import { getPgClient, isDoctor, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, decodeJWT, toSafeEvent } from "utils/index.mjs";

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
 * Checks if a date is valid
 * @param {Date|string|number|undefined} date
 * @returns {boolean}
 */
function validDate(date) {
	logger.debug("Checking if date is valid", date);
	if (!date) {
		return false;
	}
	return !Number.isNaN(new Date(date));
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
	logger.info("Starting handling request...");

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
		logger.error(
			{ err: tokenInfo.error, inputs: { jwt } },
			"JWT couldn't be parsed!",
		);
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "JWT couldn't be parsed" })
			.build();
	}
	const { email } = tokenInfo;
	logger.info({ tokenInfo }, "JWT Parsed!");

	let client;
	try {
		logger.info(
			{ queryParams: event.queryStringParameters },
			"Query string parameters:",
		);
		const queryStartDate = event.queryStringParameters?.startDate;
		const queryEndDate = event.queryStringParameters?.endDate;

		logger.info(
			{ queryStartDate, queryEndDate },
			"Checking if dates are valid...",
		);
		if (!(validDate(queryStartDate) && validDate(queryEndDate))) {
			logger.error({ queryStartDate, queryEndDate }, "Invalid dates!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid start or end date provided!" })
				.build();
		}

		const startDate = new Date(queryStartDate);
		const endDate = new Date(queryEndDate);
		logger.info({ startDate, endDate }, "Dates are valid!");

		logger.info("Validating endDate >= startDate");
		if (endDate.getTime() < startDate.getTime()) {
			logger.error(
				{ startDate, endDate },
				"Start date must be lower than endDate!",
			);
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Start date is higher than end date!" })
				.build();
		}
		logger.info("EndDate is higher that StartDate!");

		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const transactionResult = await transaction(client, logger, async () => {
			logger.info("Checking if email is doctor...");
			const itsDoctor = await isDoctor(client, email);
			if (itsDoctor.error) {
				const msg =
					"An error occurred while trying to check if user is doctor!";
				logger.error({ err: itsDoctor.error, inputs: { email } }, msg);

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

			const query = `SELECT * FROM ${SCHEMA_NAME}.stats WHERE fecha_visita BETWEEN $1 AND $2`;
			const values = [startDate.toISOString(), endDate.toISOString()];
			logger.info({ query, values }, "Querying for information: ");
			const result = await client.query(query, values);
			logger.info({ rowCount: result.rowCount }, "DB query done!");
			return result;
		});

		if (transactionResult.error) {
			logger.error(
				{ err: transactionResult.error },
				"An error occurred during the database transaction!",
			);
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with:");
			return transactionResult.response;
		}

		const { result } = transactionResult;
		/**@type string[] */
		const fields = result.fields.map((f) => f.name);
		/**@type *[][] */
		const rows = result.rows.map((r) =>
			fields.map((f) => {
				if (f.includes("fecha")) {
					return new Date(r[f]).toISOString();
				}
				return r[f];
			}),
		);

		const csv = arrayToCsv([fields].concat(rows));

		return responseBuilder.setStatusCode(200).setBody(csv).build();
	} catch (error) {
		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while exporting data!",
		);

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
