import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

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

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Connecting to DB...");
    client = getPgClient(url);
    await client.connect();

    logger.info("Querying DB...");
    const response = await client.query("SELECT 2+2;", []);
    logger.info(response.rows, "The response from the DB is:");
  } catch (error) {
    logger.error(error, "An error has ocurred!");
    const response = {
      statusCode: 500,
      body: JSON.stringify(error),
    };
    return response;
  } finally {
    await client?.end();
  }

  logger.info("Creating response...");
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*", // Allow from anywhere
      "Access-Control-Allow-Methods": "GET", // Allow only GET request
    },
    body: JSON.stringify([]),
  };

  logger.info(response, "Responding with:");
  return response;
};
