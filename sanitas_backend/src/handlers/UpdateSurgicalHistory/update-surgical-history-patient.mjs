import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";

/**
 * Transforms database record of surgical history into the API response format.
 * @param {Object} dbData - The database record for surgical history.
 * @returns {Object} Formatted response object with API-friendly field names.
 */
function formatSurgicalHistoryResponse(dbData) {
	let surgicalEventData;
	try {
		if (typeof dbData.antecedente_quirurgico_data === "string") {
			surgicalEventData = JSON.parse(dbData.antecedente_quirurgico_data);
		} else {
			surgicalEventData = dbData.antecedente_quirurgico_data;
		}
		if (!Array.isArray(surgicalEventData)) {
			surgicalEventData = [surgicalEventData];
		}
	} catch (error) {
		surgicalEventData = [];
	}

	return {
		patientId: dbData.id_paciente,
		hasSurgicalEvent: dbData.antecedente_quirurgico,
		surgicalEventData,
	};
}

/**
 * Handles the HTTP PUT request to update or create surgical history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateSurgicalHistoryHandler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("PUT");

	if (event.httpMethod !== "PUT") {
		return responseBuilder
			.setStatusCode(405)
			.setBody({ error: "Method Not Allowed" })
			.build();
	}

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();

		const body = JSON.parse(event.body);
		const { id, hasSurgicalEvent, surgicalEventData } = body;

		if (!id) {
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		const surgicalEventDataJSON = JSON.stringify(surgicalEventData);

		const upsertQuery = `
        INSERT INTO antecedentes_quirurgicos (id_paciente, antecedente_quirurgico, antecedente_quirurgico_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_paciente) DO UPDATE
        SET antecedente_quirurgico = COALESCE(EXCLUDED.antecedente_quirurgico, antecedentes_quirurgicos.antecedente_quirurgico),
            antecedente_quirurgico_data = COALESCE(EXCLUDED.antecedente_quirurgico_data, antecedentes_quirurgicos.antecedente_quirurgico_data)
        RETURNING *;
    `;
		const values = [id, hasSurgicalEvent, surgicalEventDataJSON];
		const result = await client.query(upsertQuery, values);

		if (result.rowCount === 0) {
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to insert or update surgical history." })
				.build();
		}

		const updatedRecord = result.rows[0];
		const formattedResponse = formatSurgicalHistoryResponse(updatedRecord);
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		logger.error("An error occurred while updating surgical history!", {
			message: error.message,
			stack: error.stack,
			data: error.data,
		});

		if (error.code === "23503") {
			return responseBuilder
				.setStatusCode(404)
				.setBody({ error: "Patient not found with the provided ID." })
				.build();
		}

		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to update surgical history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};
