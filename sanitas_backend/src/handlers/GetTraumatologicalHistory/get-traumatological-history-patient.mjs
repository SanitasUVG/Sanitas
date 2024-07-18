import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, mapToAPITraumatologicHistory } from "utils";
import { genDefaultTraumatologicalHistory } from "utils/defaultValues.mjs";

/**
 * Handles the HTTP GET request to retrieve traumatologic history for a specific patient by their ID.
 * This function fetches the traumatologic history from the database and formats it for the API response.
 * It ensures the request is valid, connects to the database, queries for the traumatologic history,
 * and handles various potential error states, returning appropriate responses.
 *
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const getTraumatologicalHistoryHandler = async (event, context) => {
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

    const query = "SELECT * FROM antecedentes_traumatologicos WHERE id_paciente = $1;";
    const args = [id];
    logger.info({ query, args }, "Querying DB...");
    const dbResponse = await client.query(query, args);
    logger.info("Query done!");

    if (dbResponse.rowCount === 0) {
      logger.info("No traumatologic history found! Returning default values...");
      return responseBuilder
        .setStatusCode(200)
        .setBody({
          patientId: id,
          medicalHistory: genDefaultTraumatologicalHistory(),
        })
        .build();
    }

    const traumatologicHistory = mapToAPITraumatologicHistory(dbResponse.rows[0]);
    logger.info({ traumatologicHistory }, "Responding with:");
    return responseBuilder.setStatusCode(200).setBody(traumatologicHistory).build();
  } catch (error) {
    logger.error("An error occurred while fetching traumatologic history!", error);
    return responseBuilder
      .setStatusCode(500)
      .setBody({ error: "Failed to fetch traumatologic history due to an internal error." })
      .build();
  } finally {
    if (client) {
      await client.end();
    }
  }
};
