import { getPgClient, isDoctor, isEmailOfPatient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { genDefaultPsychiatricHistory } from "utils/defaultValues.mjs";
import { decodeJWT, mapToAPIPsychiatricHistory } from "utils/index.mjs";

/**
 * Handles the HTTP GET request to retrieve psychiatric medical history for a specific patient by their ID.
 * This function fetches the psychiatric medical history from the database and formats it for the API response.
 * It ensures the request is valid, connects to the database, queries for the psychiatric medical history,
 * and handles various potential error states, returning appropriate responses.
 *
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const getPsychiatricHistoryHandler = async (event, context) => {
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

		logger.info("Checking if user is doctor...");
		const itsDoctor = await isDoctor(client, email);
		if (itsDoctor.error) {
			const msg =
				"An error occurred while trying to check if the user is a doctor!";
			logger.error(itsDoctor, msg);
			return responseBuilder.setStatusCode(500).setBody(itsDoctor).build();
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
				logger.error(emailBelongs, msg);
				return responseBuilder.setStatusCode(500).setBody(emailBelongs).build();
			}

			if (!emailBelongs) {
				const msg = "The email doesn't belong to the patient id!";
				logger.error({ email, patientId }, msg);
				return responseBuilder
					.setStatusCode(400)
					.setBody({ error: msg })
					.build();
			}
			logger.info("The email belongs to the patient!");
		} else {
			logger.info("The user is a doctor!");
		}

		const query = `
      SELECT id_paciente, depresion, depresion_data, ansiedad, ansiedad_data, toc, toc_data, tdah, tdah_data, bipolaridad, bipolaridad_data, otro, otro_data
      FROM antecedentes_psiquiatricos
      WHERE id_paciente = $1;
    `;
		const args = [patientId];
		logger.info({ query, args }, "Querying DB...");
		const dbResponse = await client.query(query, args);
		logger.info("Query done!");

		if (dbResponse.rowCount === 0) {
			logger.info("No psychiatric history found! Returning default values...");
			return responseBuilder
				.setStatusCode(200)
				.setBody({
					patientId,
					medicalHistory: genDefaultPsychiatricHistory(),
				})
				.build();
		}

		const medicalHistory = mapToAPIPsychiatricHistory(dbResponse.rows[0]);
		return responseBuilder.setStatusCode(200).setBody(medicalHistory).build();
	} catch (error) {
		logger.error(
			"An error occurred while fetching psychiatric history!",
			error,
		);
		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to get psychiatric history due to an internal error.",
			})
			.build();
	} finally {
		await client?.end();
	}
};
