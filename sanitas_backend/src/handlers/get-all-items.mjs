// Create clients and set shared const values outside of the handler.
import pino from "pino";
import { lambdaRequestTracker, pinoLambdaDestination } from "pino-lambda";

// custom destination formatter
const destination = pinoLambdaDestination();
const logger = pino(
  {
    // typical pino options
  },
  destination
);
const withRequest = lambdaRequestTracker();

import { getXataClient } from "db-conn";

// Create a DocumentClient that represents the query to add an item
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
// const client = new DynamoDBClient({});
// const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
// const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP get method to get all items from a DynamoDB table.
 */
export const getAllItemsHandler = async (event, context) => {
  // All log statements are written to CloudWatch
  withRequest(event, context);
  if (event.httpMethod !== "GET") {
    throw new Error(
      `getAllItems only accept GET method, you tried: ${event.httpMethod}`
    );
  }

  const client = getXataClient(
    process.env.XATA_API_KEY,
    process.env.XATA_BRANCH
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

  // get all items from the table (only first 1MB data, you can use `LastEvaluatedKey` to get the rest of data)
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property
  // https://docs.aws.amazon.com/amazondynamodb/latest/APIReference/API_Scan.html
  // const params = {
  //   TableName: tableName,
  // };
  //
  // let items;
  // try {
  //   const data = await ddbDocClient.send(new ScanCommand(params));
  //   items = data.Items;
  // } catch (err) {
  //   logger.error(err, "Error!");
  // }
  //
  // const response = {
  //   statusCode: 200,
  //   body: JSON.stringify(items),
  // };
  //
  // logger.info(
  //   { statusCode: response.statusCode, body: response.body },
  //   `Response from DBClient on ${event.path}`
  // );
  // return response;
};
