import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";

export const handler = async (event, context) => {
  withRequest(event, context);

  if (event.httpMethod !== "GET") {
    throw new Error(
      `Check Cui solo acepta el método GET, intentaste: ${event.httpMethod}`,
    );
  }

  const cui = event.pathParameters.cui;
  logger.info(process.env, "Las variables de entorno son:");
  let client;
  try {
    const url = process.env.POSTGRES_URL;
    client = getPgClient(url);
    logger.info(url, "Connecting to DB...");
    await client.connect();
    logger.info("Querying DB...");

    const query = "SELECT COUNT(*) FROM PACIENTE WHERE cui = $1";
    const values = [cui];
    const response = await client.query(query, values);
    logger.info(response.rows, "The response from the DB is:");
    const exists = response.rows[0].count > 0;

    await client.end();

    return createResponse().setStatusCode(200).addCORSHeaders().setBody({ exists }).build();
  } catch (error) {
    logger.error(error, "Error querying database:");
    await client?.end();

    return createResponse().setStatusCode(500).addCORSHeaders().setBody({ error: "Internal Server Error" }).build();
  }
};
