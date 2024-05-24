import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

export const handler = async (event, context) => {
  withRequest(event, context);
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

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "GET", // Allow only GET request
      },
      body: JSON.stringify({ exists }),
    };
  } catch (error) {
    logger.error(error, "Error querying database:");
    await client.end();
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
