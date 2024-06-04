import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

export const handler = async (event, context) => {
  withRequest(event, context);

  if (event.httpMethod !== "GET") {
    throw new Error(
      `Health Check solo acepta el método GET, intentaste: ${event.httpMethod}`,
    );
  }

  logger.info(process.env, "Las variables de entorno son:");
  let client;

  try {
    const url = process.env.POSTGRES_URL;
    client = getPgClient(url);
    logger.info(url, "Connecting to DB...");
    await client.connect();
    logger.info("Querying DB...");
    const query = "SELECT * FROM PACIENTE";
    await client.query(query);
    await client.end();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "GET", // Allow only GET request
      },
      body: JSON.stringify([{
        name: "DB",
        status: "UP",
      }]),
    };
  } catch (error) {
    logger.error(error, "Error querying database:");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "GET", // Allow only GET request
      },
      body: JSON.stringify([{ name: "DB", status: "DOWN", error: error.message }]),
    };
  }
};
