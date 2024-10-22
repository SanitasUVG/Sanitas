import { getPgClient, isDoctor, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { decodeJWT, mapToAPIMedicalConsultation } from "utils/index.mjs";
import { genDefaultMedicalConsultation } from "utils/defaultValues.mjs";

/**
 * Handles the HTTP GET request to retrieve medical consultation details for a specific patient by their ID.
 * This function fetches the medical consultation from the database and formats it for the API response.
 * It ensures the request is valid, connects to the database, queries for the medical consultation,
 * and handles various potential error states, returning appropriate responses.
 *
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const getMedicalConsultationHandler = async (event, context) => {
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
		logger.error({ error: tokenInfo.error }, "JWT couldn't be parsed!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "JWT couldn't be parsed" })
			.build();
	}
	const { email } = tokenInfo;
	logger.info({ tokenInfo }, "JWT Parsed!");

	const patientId = Number.parseInt(event.pathParameters?.id, 10);
	if (Number.isNaN(patientId)) {
		logger.error("Invalid ID received!", { id: event.pathParameters?.id });
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
				logger.error(itsDoctor, msg);

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

				const msg = "Unauthorized, you're not a doctor!";
				logger.error({ email, patientId }, msg);

				const response = responseBuilder
					.setStatusCode(401)
					.setBody({ error: msg })
					.build();
				return { response };
			}

			const query = `SELECT * FROM consulta WHERE id_paciente = $1 ORDER BY fecha DESC;
			`;

			const args = [patientId];
			logger.info({ query, args }, "Querying DB...");
			const dbResponse = await client.query(query, args);
			logger.info({ dbResponse }, "Query response!");
			return dbResponse;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			return transactionResult.response;
		}

		const { result: dbResponse } = transactionResult;

		logger.info("Query done!");
		if (dbResponse.rowCount === 0) {
			logger.info("No medical consultation found! Returning default values...");
			return responseBuilder
				.setStatusCode(200)
				.setBody({ patientId: patientId, ...genDefaultMedicalConsultation() })
				.build();
		}

		const medicalConsultation = dbResponse.rows.map((row) =>
			mapToAPIMedicalConsultation(row),
		);
		return responseBuilder
			.setStatusCode(200)
			.setBody({ patientId: patientId, consultations: medicalConsultation })
			.build();
	} catch (error) {
		logger.error(
			"An error occurred while fetching medical consultation!",
			error,
		);
		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to get medical consultation due to an internal error.",
			})
			.build();
	} finally {
		await client?.end();
	}
};
