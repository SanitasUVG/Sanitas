import { getPgClient, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, decodeJWT, toSafeEvent } from "utils/index.mjs";

/**
 * @type {import("src/commonTypes.mjs").AWSHandler}
 */
export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("POST");

	if (event.httpMethod !== "POST") {
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

	if (!email) {
		logger.error("No email found!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "No email supplied" })
			.build();
	}

	/** @type {import("src/commonTypes.mjs").LinkData} */
	const { cui } = JSON.parse(event.body);
	if (!cui) {
		logger.error("No cui found!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "No CUI supplied" })
			.build();
	}
	logger.info(process.env, "Environment variables are:");

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to the database...");
		client = getPgClient(url);
		await client.connect();

		const transactionResult = await transaction(client, logger, async () => {
			let query = `
			INSERT INTO ${SCHEMA_NAME}.cuenta_paciente (email, cui_paciente)
			VALUES ($1, $2)
			RETURNING (SELECT id FROM ${SCHEMA_NAME}.paciente WHERE cui = cui_paciente)
		`;
			let values = [email, cui];
			logger.info({ query, values }, "Querying DB...");
			let dbResponse = await client.query(query, values);
			logger.info("Patient linked successfully!");

			const linkedPatientId = dbResponse.rows[0].id;
			query = `
			UPDATE ${SCHEMA_NAME}.paciente SET
			correo = $1
			WHERE id = $2`;
			values = [email, linkedPatientId];

			logger.info({ query, values }, "Querying DB...");
			dbResponse = await client.query(query, values);
			logger.info("Updated patient email successfully!");

			return linkedPatientId;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with:");
			return transactionResult.response;
		}

		const linkedPatientId = transactionResult.result;

		const response = responseBuilder
			.setStatusCode(200)
			.setBody({ linkedPatientId })
			.build();
		logger.info({ response }, "Responding with:");
		return response;
	} catch (error) {
		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while linking account!",
		);

		let statusCode = 500;
		let errorMessage =
			"The account couldn't be linked due to an internal error!";

		if (error.code === "23503") {
			statusCode = 404;
			errorMessage = "No patient with the given CUI found!";
		}

		if (error.message.includes("violates unique constraint")) {
			statusCode = 409;
			errorMessage = "Patient is already linked to another account!";
		}

		return responseBuilder
			.setStatusCode(statusCode)
			.setBody({
				error: errorMessage,
			})
			.build();
	} finally {
		await client?.end();
	}
};
