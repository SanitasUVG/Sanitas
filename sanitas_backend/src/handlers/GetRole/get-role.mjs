import { getPgClient, isDoctor } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, decodeJWT } from "utils/index.mjs";

/**
 * Handles patient search queries based on ID, employee code, or partial names and surnames.
 */
export const handler = async (event, context) => {
	// All log statements are written to CloudWatch
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders();

	if (event.httpMethod !== "GET") {
		return responseBuilder
			.setStatusCode(405)
			.setBody({ error: "Method Not Allowed" })
			.build();
	}

	logger.info({ headers: event.headers }, "Received headers...");
	let jwt = event.headers["Authorization"];

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
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected to DB!");

		let itsDoctor = await isDoctor(client, email);
		if (itsDoctor.error) {
			const msg = "An error occurred while trying to check if user is doctor!";
			logger.error({ error: itsDoctor.error }, msg);
			return responseBuilder.setStatusCode(500).setBody({ error: msg }).build();
		}

		const response = responseBuilder
			.setStatusCode(200)
			.setBody(itsDoctor ? "DOCTOR" : "PATIENT")
			.build();
		logger.info({ response }, "Responding with...");
		return response;
	} catch (error) {
		logger.error({ error: error.message }, "An error has occurred!");
		return responseBuilder
			.setStatusCode(500)
			.setBody({ error: "Internal Server Error" })
			.build();
	} finally {
		await client?.end();
		logger.info("Database connection closed");
	}
};
