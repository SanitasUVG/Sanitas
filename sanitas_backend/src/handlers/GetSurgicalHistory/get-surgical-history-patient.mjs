import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { genDefaultSurgicalHistory } from "utils/defaultValues.mjs";
import { createResponse, mapToAPISurgicalHistory } from "utils/index.mjs";

/**
 * Handles the HTTP GET request to retrieve surgical history for a specific patient by their ID.
 * This function fetches the surgical history from the database and formats it for the API response.
 * It ensures the request is valid, connects to the database, queries for the surgical history,
 * and handles various potential error states, returning appropriate responses.
 *
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const getSurgicalHistoryHandler = async (event, context) => {
  withRequest(event, context);
  const responseBuilder = createResponse().addCORSHeaders("GET");

  if (event.httpMethod !== "GET") {
    return responseBuilder.setStatusCode(405).setBody({ error: "Method Not Allowed" }).build();
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

    let query = "SELECT * FROM antecedentes_quirurgicos WHERE id_paciente = $1;";
    let args = [id];
    logger.info({ query, args }, "Querying DB...");
    const dbResponse = await client.query(query, args);
    logger.info("Query done!");

    if (dbResponse.rowCount === 0) {
      logger.info("No surgical history found! Returning default values...");
      return responseBuilder.setStatusCode(200).setBody({
        patientId: id,
        medicalHistory: genDefaultSurgicalHistory(),
      }).build();
    }

    try {
      const surgicalHistory = mapToAPISurgicalHistory(dbResponse.rows[0]);

      logger.info({ surgicalHistory }, "Responding with:");
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
