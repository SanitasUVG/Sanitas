import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { genDefaultNonPathologicalHistory } from "utils/defaultValues.mjs";
import { createResponse, mapToAPINonPathologicalHistory } from "utils/index.mjs";

export const getNonPatologicalHistoryHandler = async (event, context) => {
  withRequest(event, context);
  const responseBuilder = createResponse().addCORSHeaders("GET");

  if (event.httpMethod !== "GET") {
    return responseBuilder.setStatusCode(405).setBody({ error: "Method Not Allowed" }).build();
  }

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info({ url }, "Connecting to DB...");
    client = await getPgClient(url);
    await client.connect();
    logger.info("Connected!");

    const id = Number.parseInt(event.pathParameters?.id, 10);
    if (isNaN(id)) {
      logger.error("Invalid ID received!", { id: event.pathParameters?.id });
      return responseBuilder
        .setStatusCode(400)
        .setBody({ error: "Invalid request: No valid patientId supplied!" })
        .build();
    }

    const query = "SELECT * FROM antecedentes_no_patologicos WHERE id_paciente = $1;";
    const args = [id];
    logger.info({ query, args }, "Querying DB...");
    const dbResponse = await client.query(query, args);
    logger.info("Query done!");

    if (dbResponse.rowCount === 0) {
      logger.info("No non-pathological history found! Returning default values...", { id });
      return responseBuilder
        .setStatusCode(200)
        .setBody({
          patientId: id,
          medicalHistory: genDefaultNonPathologicalHistory(),
        })
        .build();
    }

    const nonPathologicalHistory = mapToAPINonPathologicalHistory(dbResponse.rows[0]);
    logger.info({ nonPathologicalHistory }, "Responding with:");
    return responseBuilder.setStatusCode(200).setBody(nonPathologicalHistory).build();
  } catch (error) {
    logger.error("An error occurred while fetching non-pathological history!", {
      error,
      stack: error.stack,
    });
    return responseBuilder
      .setStatusCode(500)
      .setBody({
        error: "Failed to fetch non-pathological history due to an internal error.",
        details: error.message,
      })
      .build();
  } finally {
    if (client) {
      await client.end();
    }
  }
};
