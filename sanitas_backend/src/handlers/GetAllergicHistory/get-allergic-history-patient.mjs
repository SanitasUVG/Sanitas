import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { genDefaultAllergicHistory } from "utils/defaultValues.mjs";
import { mapToAPIAllergicHistory } from "utils/index.mjs";

/**
 * Handles the HTTP GET request to retrieve allergic medical history for a specific patient by their ID.
 * This function fetches the allergic medical history from the database and formats it for the API response.
 * It ensures the request is valid, connects to the database, queries for the allergic medical history,
 * and handles various potential error states, returning appropriate responses.
 *
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const getAllergicHistoryHandler = async (event, context) => {
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

    const patientId = Number.parseInt(event.pathParameters.id, 10);
    if (!patientId) {
      logger.error("Invalid ID received!");
      return responseBuilder
        .setStatusCode(400)
        .setBody({ error: "Invalid request: No valid patientId supplied!" })
        .build();
    }

    const query = `
      SELECT id_paciente, medicamento_data, comida_data, polvo_data, polen_data, cambio_de_clima_data, animales_data, otros_data
      FROM antecedentes_alergicos
      WHERE id_paciente = $1;
    `;
    const args = [patientId];
    logger.info({ query, args }, "Querying DB...");
    const dbResponse = await client.query(query, args);
    logger.info("Query done!");

    if (dbResponse.rowCount === 0) {
      logger.info("No allergic history found! Returning default values...");
      return responseBuilder
        .setStatusCode(200)
        .setBody({
          patientId,
          allergicHistory: genDefaultAllergicHistory(),
        })
        .build();
    }

    const allergicHistory = mapToAPIAllergicHistory(dbResponse.rows[0]);
    return responseBuilder.setStatusCode(200).setBody(allergicHistory).build();
  } catch (error) {
    logger.error("An error occurred while fetching allergic history!", error);
    return responseBuilder
      .setStatusCode(500)
      .setBody({ error: "Failed to get allergic history due to an internal error." })
      .build();
  } finally {
    if (client) {
      await client.end();
    }
  }
};
