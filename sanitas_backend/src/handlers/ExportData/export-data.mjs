import { getPgClient, isDoctor, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, decodeJWT } from "utils/index.mjs";

/**
 * Convert a 2D array into a CSV string
 * @param {*[][]} data
 */
function arrayToCsv(data) {
	return data
		.map(
			(row) =>
				row
					.map(String) // convert every value to String
					.map((v) => v.replaceAll('"', '""')) // escape double quotes
					.map((v) => `"${v}"`) // quote it
					.join(","), // comma-separated
		)
		.join("\r\n"); // rows starting on new lines
}

/**
 * Handles the HTTP PUT request to update or create the traumatologic history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("GET");

	if (event.httpMethod !== "GET") {
		return responseBuilder
			.setStatusCode(405)
			.setBody({ error: "Method Not Allowed" })
			.build();
	}

	logger.info({ headers: event.headers }, "Received headers...");
	const jwt = event.headers.Authorization;

	logger.info({ jwt }, "Parsing JWT...");
	const tokenInfo = decodeJWT(jwt);
	if (tokenInfo.error) {
		logger.error({ error: tokenInfo.error }, "JWT couldn't be parsed!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "JWT couldn't be parsed" })
			.build();
	}
	const { email } = tokenInfo;
	logger.info({ tokenInfo }, "JWT Parsed!");

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const transactionResult = await transaction(client, logger, async () => {
			const itsDoctor = await isDoctor(client, email);
			if (itsDoctor.error) {
				const msg =
					"An error occurred while trying to check if user is doctor!";
				logger.error({ error: itsDoctor.error }, msg);

				const response = responseBuilder
					.setStatusCode(500)
					.setBody({ error: msg })
					.build();
				return { response };
			}

			if (!itsDoctor) {
				const msg = "Unauthorized, you're not a doctor!";
				const body = { error: msg };
				logger.error(body, msg);

				const response = responseBuilder
					.setStatusCode(403)
					.setBody(body)
					.build();
				return { response };
			}
			logger.info(`${email} is a doctor!`);

			const query = `SELECT * FROM ${SCHEMA_NAME}.stats`;
			logger.info({ query }, "Querying for information: ");
			const result = await client.query(query);
			logger.info({ rowCount: result.rowCount }, "DB query done!");
			return result;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with:");
			return transactionResult.response;
		}

		const { result } = transactionResult;
		/**@type *[] */
		const fields = result.fields.map((f) => f.name);
		/**@type *[] */
		const rows = result.rows;

		const csv = arrayToCsv([fields].concat(rows));

		return responseBuilder.setStatusCode(200).setBody(csv).build();
	} catch (error) {
		logger.error({ error }, "An error occurred while exporting data!");

		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to retrieve stats because of an internal error",
				details: error.message,
			})
			.build();
	} finally {
		await client?.end();
	}
};
