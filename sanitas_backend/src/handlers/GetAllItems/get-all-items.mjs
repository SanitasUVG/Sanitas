// Create clients and set shared const values outside of the handler.
import pino from "pino";
import { lambdaRequestTracker, pinoLambdaDestination } from "pino-lambda";

// custom destination formatter
const destination = pinoLambdaDestination();
const logger = pino(
  {
    // typical pino options
  },
  destination,
);
const withRequest = lambdaRequestTracker();

import { getXataClient } from "db-conn";

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
export const getAllItemsHandler = async (event, context) => {
  // All log statements are written to CloudWatch
  withRequest(event, context);
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`,
    );
  }

  const client = getXataClient(
    process.env.XATA_API_KEY,
    process.env.XATA_BRANCH,
  );
  const pacientes = await client.db.Paciente.getPaginated({
    pagination: { size: 5, offset: 0 },
  });
  let records = pacientes.records;

  logger.info(records, "Los primeros 5 pacientes son:");

  const secondPage = await pacientes.nextPage();
  logger.info(secondPage.records, "La segunda página con 5 pacientes es:");

  const response = {
    statusCode: 200,
    body: JSON.stringify(secondPage.records),
  };

  return response;
};
