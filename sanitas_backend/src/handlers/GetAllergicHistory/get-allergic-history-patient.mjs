import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { genDefaultAllergicHistory } from "utils/defaultValues.mjs";
import { mapToAPIAllergicHistory } from "utils/index.mjs";

/**
 * Handles the HTTP GET request to retrieve allergic history for a specific patient.
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

    const { patientId } = event.queryStringParameters || {};

    if (!patientId) {
      logger.error("No patientId provided!");
      return responseBuilder
        .setStatusCode(400)
        .setBody({ error: "Invalid input: Missing patientId." })
        .build();
    }

    logger.info({ patientId }, "Received request for allergic history");

    const query = `
      SELECT *
      FROM antecedentes_alergicos
      WHERE id_paciente = $1;
    `;

    const result = await client.query(query, [patientId]);

    if (result.rowCount === 0) {
      logger.warn("No allergic history found for the provided ID. Returning default value.");
      const defaultAllergicHistory = genDefaultAllergicHistory();
      return responseBuilder.setStatusCode(200).setBody({
        patientId,
        allergicHistory: defaultAllergicHistory,
      }).build();
    }

    const medicalHistory = result.rows[0];
    logger.info({ allergicHistory }, "Successfully retrieved allergic history");
    return responseBuilder.setStatusCode(200).setBody(mapToAPIAllergicHistory(medicalHistory)).build();
  } catch (error) {
    logger.error({ error }, "An error occurred while retrieving allergic history!");

    return responseBuilder
      .setStatusCode(500)
      .setBody({
        error: "Failed to retrieve allergic history due to an internal error.",
        details: error.message,
      })
      .build();
  } finally {
    if (client) {
      await client.end();
    }
  }
};
