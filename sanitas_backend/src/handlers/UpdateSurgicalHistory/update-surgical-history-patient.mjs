import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, mapToAPISurgicalHistory } from "utils/index.mjs";

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
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		logger.info({ eventBody: event.body }, "Parsing event body...");
		/** @type {import("utils/defaultValues.mjs").APISurgicalHistory}  */
		const { patientId: id, medicalHistory } = JSON.parse(event.body);
		logger.info("Event body parsed!");

		if (!id) {
			logger.error("No id provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		const upsertQuery = `
        INSERT INTO antecedentes_quirurgicos (id_paciente, antecedente_quirurgico, antecedente_quirurgico_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_paciente) DO UPDATE
        SET antecedente_quirurgico = COALESCE(EXCLUDED.antecedente_quirurgico, antecedentes_quirurgicos.antecedente_quirurgico),
            antecedente_quirurgico_data = COALESCE(EXCLUDED.antecedente_quirurgico_data, antecedentes_quirurgicos.antecedente_quirurgico_data)
        RETURNING *;
    `;
		const values = [id, true, medicalHistory];
		logger.info({ upsertQuery, values }, "Inserting/Updating values in DB...");
		const result = await client.query(upsertQuery, values);
		logger.info("Done inserting/updating!");

		if (result.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");

			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to insert or update surgical history." })
				.build();
		}

		logger.info("Mapping DB response into API response...");
		const updatedRecord = result.rows[0];
		const formattedResponse = mapToAPISurgicalHistory(updatedRecord);
		logger.info({ formattedResponse }, "Done! Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		logger.error(
			{ error },
			"An error occurred while updating surgical history!",
		);

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
