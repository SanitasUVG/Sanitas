import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { genDefaultPsychiatricHistory } from "utils/defaultValues.mjs";
import { mapToAPIPsychiatricHistory } from "utils/index.mjs";

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

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const patientId = Number.parseInt(event.pathParameters.id, 10);
		if (!patientId) {
			logger.error("Invalid ID received!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid request: No valid patientId supplied!" })
				.build();
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
		if (client) {
			await client.end();
		}
	}
};
