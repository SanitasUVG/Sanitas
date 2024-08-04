import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { genDefaultPersonalHistory } from "utils/defaultValues.mjs";
import { mapToAPIPersonalHistory } from "utils/index.mjs";

/**
 * Handles the HTTP GET request to retrieve personal medical history for a specific patient by their ID.
 * This function fetches the personal medical history from the database and formats it for the API response.
 * It ensures the request is valid, connects to the database, queries for the personal medical history,
 * and handles various potential error states, returning appropriate responses.
 *
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const getPersonalHistoryHandler = async (event, context) => {
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

		const id = Number.parseInt(event.pathParameters.id, 10);
		if (!id) {
			logger.error("Invalid ID received!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid request: No valid patientId supplied!" })
				.build();
		}

		const query = `
      SELECT id_paciente, hipertension_arterial_data, diabetes_mellitus_data, hipotiroidismo_data, asma_data, convulsiones_data, infarto_agudo_miocardio_data, cancer_data, enfermedades_cardiacas_data, enfermedades_renales_data, otros_data
      FROM antecedentes_personales
      WHERE id_paciente = $1;
    `;
		const args = [id];
		logger.info({ query, args }, "Querying DB...");
		const dbResponse = await client.query(query, args);
		logger.info("Query done!");

		if (dbResponse.rowCount === 0) {
			logger.info("No personal history found! Returning default values...");
			return responseBuilder
				.setStatusCode(200)
				.setBody({
					patientId: id,
					medicalHistory: genDefaultPersonalHistory(),
				})
				.build();
		}

		const medicalHistory = mapToAPIPersonalHistory(dbResponse.rows[0]);
		return responseBuilder.setStatusCode(200).setBody(medicalHistory).build();
	} catch (error) {
		logger.error("An error occurred while fetching personal history!", error);
		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to get personal history due to an internal error.",
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};
