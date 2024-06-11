import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";

/**
 * Maps database surgical history data to the API format.
 * @param {Object} dbData - The surgical history data from the database.
 * @returns {Object} The surgical history formatted for the API.
 */
function mapToAPISurgicalHistory(dbData) {
  let surgicalEventData;
  try {
    // Check if dbData.antecedente_quirurgico_data is already an object or a string that needs parsing
    if (typeof dbData.antecedente_quirurgico_data === "string") {
      surgicalEventData = JSON.parse(dbData.antecedente_quirurgico_data);
    } else {
      surgicalEventData = dbData.antecedente_quirurgico_data;
    }

    // Ensure surgicalEventData is always an array
    if (!Array.isArray(surgicalEventData)) {
      surgicalEventData = [surgicalEventData];
    }
  } catch (parseError) {
    logger.error("Failed to parse surgicalEventData:", {
      data: dbData.antecedente_quirurgico_data,
      parseError: parseError.message,
    });
    throw new Error("Invalid JSON data in database.");
  }

  return {
    patientId: dbData.id_paciente,
    surgicalEvent: dbData.antecedente_quirurgico,
    surgicalEventData,
  };
}

/**
 * Handles the HTTP GET request to retrieve surgical history for a specific patient by their ID.
 * This function fetches the surgical history from the database and formats it for the API response.
 * It ensures the request is valid, connects to the database, queries for the surgical history,
 * and handles various potential error states, returning appropriate responses.
 *
 * @param {Object} event - The API Gateway event object containing all the information about the request,
 * including path parameters and the HTTP method.
 * @param {Object} context - The context in which the Lambda function is running.
 * @returns {Promise<Object>} The API response object with status code and body, formatted for the client.
 */
export const getSurgicalHistoryHandler = async (event, context) => {
  withRequest(event, context);
  const responseBuilder = createResponse();

  if (event.httpMethod !== "GET") {
    return responseBuilder.setStatusCode(405).setBody({ error: "Method Not Allowed" }).build();
  }

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Connecting to DB...");
    client = getPgClient(url);
    await client.connect();

    const id = event.pathParameters.id;
    if (!id) {
      logger.error("No ID received!");
      return responseBuilder
        .setStatusCode(400)
        .setBody({ message: "Invalid request: No patientId supplied!" })
        .build();
    }

    const dbResponse = await client.query(
      "SELECT * FROM antecedentes_quirurgicos WHERE id_paciente = $1;",
      [id],
    );
    if (dbResponse.rowCount === 0) {
      logger.error("No surgical history found!");
      return responseBuilder
        .setStatusCode(404)
        .setBody({ message: "No surgical history found for the provided ID." })
        .build();
    }

    try {
      const surgicalHistory = mapToAPISurgicalHistory(dbResponse.rows[0]);
      return responseBuilder.setStatusCode(200).setBody(surgicalHistory).build();
    } catch (error) {
      logger.error("An error occurred while processing surgical history:", {
        errorMessage: error.message,
        errorStack: error.stack,
        rawData: dbResponse.rows[0],
      });
      return responseBuilder
        .setStatusCode(500)
        .setBody({
          error: "Failed to process surgical history due to an internal error.",
          details: error.message,
        })
        .build();
    }
  } catch (error) {
    logger.error("An error occurred while fetching surgical history!", error);
    return responseBuilder
      .setStatusCode(500)
      .setBody({ error: "Failed to fetch surgical history due to an internal error." })
      .build();
  } finally {
    if (client) {
      await client.end();
    }
  }
};
