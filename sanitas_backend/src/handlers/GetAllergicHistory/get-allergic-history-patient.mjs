import {
	getPgClient,
	isDoctor,
	isEmailOfPatient,
	SCHEMA_NAME,
	transaction,
} from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { genDefaultAllergicHistory } from "utils/defaultValues.mjs";
import {
	decodeJWT,
	mapToAPIAllergicHistory,
	toSafeEvent,
} from "utils/index.mjs";

/**
 * Handles the HTTP GET request to retrieve allergic medical history for a specific patient by their ID.
 * This function fetches the allergic medical history from the database and formats it for the API response.
 * It ensures the request is valid, connects to the database, queries for the allergic medical history,
 * and handles various potential error states, returning appropriate responses.
 *
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const getAllergicHistoryHandler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("GET");

	if (event.httpMethod !== "GET") {
		return responseBuilder
			.setStatusCode(405)
			.setBody({ error: "Method Not Allowed" })
			.build();
	}

	logger.info({ headers: event.headers }, "Received headers...");
	const jwt = event.headers.Authorization;

	logger.info({ jwt }, "Parsing JWT...");
	const tokenInfo = decodeJWT(jwt);
	if (tokenInfo.error) {
		logger.error(
			{ err: tokenInfo.error, inputs: { jwt } },
			"JWT couldn't be parsed!",
		);
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "JWT couldn't be parsed" })
			.build();
	}
	const { email } = tokenInfo;
	logger.info({ tokenInfo }, "JWT Parsed!");

	let client;
	try {
		const patientId = Number.parseInt(event.pathParameters.id, 10);
		if (!patientId) {
			logger.error(
				{ patientId: event.pathParameters?.id },
				"Invalid ID received!",
			);
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid request: No valid patientId supplied!" })
				.build();
		}

		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const transactionResult = await transaction(client, logger, async () => {
			logger.info("Checking if user is doctor...");
			const itsDoctor = await isDoctor(client, email);
			if (itsDoctor.error) {
				const msg =
					"An error occurred while trying to check if the user is a doctor!";
				logger.error({ err: itsDoctor.error, inputs: { email } }, msg);

				const response = responseBuilder
					.setStatusCode(500)
					.setBody(itsDoctor)
					.build();
				return { response };
			}

			if (!itsDoctor) {
				logger.info("User is patient!");
				logger.info(
					{ email, patientId },
					"Checking if email belongs to patient id",
				);
				const emailBelongs = await isEmailOfPatient(client, email, patientId);

				if (emailBelongs.error) {
					const msg =
						"An error ocurred while trying to check if the email belongs to the patient!";
					logger.error(
						{ err: emailBelongs.error, inputs: { email, patientId } },
						msg,
					);

					const response = responseBuilder
						.setStatusCode(500)
						.setBody(emailBelongs)
						.build();
					return { response };
				}

				if (!emailBelongs) {
					const msg = "The email doesn't belong to the patient id!";
					logger.error({ email, patientId }, msg);

					const response = responseBuilder
						.setStatusCode(400)
						.setBody({ error: msg })
						.build();
					return { response };
				}
				logger.info("The email belongs to the patient!");
			} else {
				logger.info("The user is a doctor!");
			}

			const query = `
      SELECT id_paciente, medicamento_data, comida_data, polvo_data, polen_data, cambio_de_clima_data, animales_data, otros_data
      FROM ${SCHEMA_NAME}.antecedentes_alergicos
      WHERE id_paciente = $1;
    `;
			const args = [patientId];
			logger.info({ query, args }, "Querying DB...");
			const dbResponse = await client.query(query, args);

			logger.info("Query done!");

			return dbResponse;
		});

		if (transactionResult.error) {
			logger.error(
				{ err: transactionResult.error },
				"An error occurred during the database transaction!",
			);

			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with:");
			return transactionResult.response;
		}

		const { result: dbResponse } = transactionResult;

		if (dbResponse.rowCount === 0) {
			logger.info("No allergic history found! Returning default values...");
			return responseBuilder
				.setStatusCode(200)
				.setBody({
					patientId,
					medicalHistory: genDefaultAllergicHistory(),
				})
				.build();
		}

		const medicalHistory = mapToAPIAllergicHistory(dbResponse.rows[0]);
		return responseBuilder.setStatusCode(200).setBody(medicalHistory).build();
	} catch (error) {
		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while fetching allergic history!",
		);
		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to get allergic history due to an internal error.",
			})
			.build();
	} finally {
		await client?.end();
	}
};
