import { logger, withRequest } from "logging";
import { getPgClient } from "db-conn";

/**
 * A simple example includes a HTTP get method.
 */
export const getAllItemsHandler = async (event, context) => {
  // All log statements are written to CloudWatch
  withRequest(event, context);
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accepts GET method, you tried: ${event.httpMethod}`,
    );
  }

  logger.info(process.env, "Las variables de entorno son:");

  try {
    logger.info("Connecting to DB...");
    const client = getPgClient(process.env.POSTGRES_URL);

    logger.info("Querying DB...");
    const response = await client.query("SELECT 2+2;");
    logger.info(response.rows, "The response from the DB is:");
  } catch (error) {
    logger.error(error, "An error has ocurred!");
  }

  logger.info("Creating response...");
  const response = {
    statusCode: 200,
    body: JSON.stringify([]),
  };

  logger.info(response, "Responding with:");
  return response;
};
