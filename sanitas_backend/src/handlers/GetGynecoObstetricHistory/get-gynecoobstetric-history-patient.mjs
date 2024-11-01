import {
	getPgClient,
	isDoctor,
	isEmailOfPatient,
	SCHEMA_NAME,
	transaction,
} from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPIGynecologicalHistory,
} from "utils/index.mjs";
import { genDefaultGynecologicalHistory } from "utils/defaultValues.mjs";

export const getGynecologicalHistoryHandler = async (event, context) => {
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

	const patientId = Number.parseInt(event.pathParameters?.id, 10);
	if (Number.isNaN(patientId)) {
		logger.error(
			{ patientId: event.pathParameters?.id },
			"Invalid ID received!",
		);
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "Invalid request: No valid patientId supplied!" })
			.build();
	}

	let client;
	try {
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
				logger.error({ err: itsDoctor, inputs: { email } }, msg);

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
						{ err: emailBelongs, inputs: { email, patientId } },
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

			const query = `SELECT * FROM ${SCHEMA_NAME}.antecedentes_ginecoobstetricos WHERE id_paciente = $1;`;
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
			logger.info(
				"No gynecological history found! Returning default values...",
				{ id: patientId },
			);
			return responseBuilder
				.setStatusCode(200)
				.setBody({
					patientId: patientId,
					medicalHistory: genDefaultGynecologicalHistory(),
				})
				.build();
		}

		const gynecologicalHistory = mapToAPIGynecologicalHistory(
			dbResponse.rows[0],
		);
		const response = responseBuilder
			.setStatusCode(200)
			.setBody(gynecologicalHistory)
			.build();

		logger.info({ response }, "Responding with:");
		return response;
	} catch (error) {
		logger.error(
			error,
			"An error occurred while fetching gynecological history!",
		);
		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error:
					"Failed to fetch gynecological history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		await client?.end();
	}
};
