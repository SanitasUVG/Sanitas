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
    // Check if dbData.antecedente_quirurgico_data is already an object or a string
    if (typeof dbData.antecedente_quirurgico_data === "string") {
      surgicalEventData = JSON.parse(dbData.antecedente_quirurgico_data);
    } else {
      surgicalEventData = dbData.antecedente_quirurgico_data;
    }

    // Ensure surgicalEventData is always an array
    if (!Array.isArray(surgicalEventData)) {
      surgicalEventData = [surgicalEventData]; // Wrap non-array data in an array
    }
  } catch (error) {
    surgicalEventData = []; // Set a default or handle appropriately
  }

  return {
    patientId: dbData.id_paciente,
    surgicalEvent: dbData.antecedente_quirurgico,
    surgicalEventData: surgicalEventData,
  };
}

/**
 * Handles the HTTP PUT request to update or create surgical history for a specific patient.
 * This function checks for valid input, connects to the database, performs an upsert operation,
 * and returns the updated or new surgical history record.
 *
 * @param {Object} event - The API Gateway event object containing all the information about the request.
 * @param {Object} context - The context in which the Lambda function is running.
 * @returns {Promise<Object>} The API response object with status code and body.
 */
export const updateSurgicalHistoryHandler = async (event, context) => {
  withRequest(event, context);
  const responseBuilder = createResponse();

  if (event.httpMethod !== "PUT") {
    return responseBuilder.setStatusCode(405).setBody({ error: "Method Not Allowed" }).build();
  }

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Connecting to DB...");
    client = getPgClient(url);
    await client.connect();

    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    // Check if the required fields are present and not empty
    if (
      !id
      || !body.surgicalEvent
      || !body.surgicalEventData
      || (Array.isArray(body.surgicalEventData) && body.surgicalEventData.length === 0)
    ) {
      logger.error("Validation Failed", { id, body });
      return responseBuilder
        .setStatusCode(400)
        .setBody({ error: "Invalid input: Missing or empty required fields." })
        .build();
    }

    const { surgicalEvent, surgicalEventData } = body;

    // Ensuring the surgicalEventData is a JSON string
    const surgicalEventDataJSON = JSON.stringify(surgicalEventData);

    const upsertQuery = `
            INSERT INTO antecedentes_quirurgicos (id_paciente, antecedente_quirurgico, antecedente_quirurgico_data)
            VALUES ($1, $2, $3)
            ON CONFLICT (id_paciente) DO UPDATE
            SET antecedente_quirurgico = EXCLUDED.antecedente_quirurgico, 
                antecedente_quirurgico_data = EXCLUDED.antecedente_quirurgico_data
            RETURNING *;
        `;
    const values = [id, surgicalEvent, surgicalEventDataJSON];
    const result = await client.query(upsertQuery, values);

    if (result.rowCount === 0) {
      logger.error("No record found or updated!");
      return responseBuilder
        .setStatusCode(404)
        .setBody({ message: "Failed to insert or update surgical history." })
        .build();
    }

    const updatedRecord = result.rows[0];
    const formattedResponse = formatSurgicalHistoryResponse(updatedRecord);
    return responseBuilder.setStatusCode(200).setBody(formattedResponse).build();
  } catch (error) {
    logger.error("An error occurred while updating surgical history!", {
      message: error.message,
      stack: error.stack,
      data: error.data,
    });

    if (error.code === "23503") {
      // PostgreSQL error code for foreign key violation
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
