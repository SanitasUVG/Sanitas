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

// Create a DocumentClient that represents the query to add an item
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

// Get the DynamoDB table name from environment variables
const tableName = process.env.SAMPLE_TABLE;

/**
 * A simple example includes a HTTP post method to add one item to a DynamoDB table.
 */
export const putItemHandler = async (event, context) => {
  // All log statements are written to CloudWatch
  withRequest(event, context);
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`,
    );
  }

  // Get id and name from the body of the request
  const body = JSON.parse(event.body);
  const id = body.id;
  const name = body.name;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  const params = {
    TableName: tableName,
    Item: { id: id, name: name },
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    logger.info(data, "Success - item added or updated");
  } catch (err) {
    logger.error(err, "Error");
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(body),
  };

  const { statusCode, body: responseBody } = response;

  // All log statements are written to CloudWatch
  logger.info({ statusCode, responseBody }, `Response from ${event.path}`);
  return response;
};
