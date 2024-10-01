import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { decodeJWT } from "utils/index.mjs";

/**
 * @type {import("src/commonTypes.mjs").AWSHandler}
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

		const query = `
			SELECT p.id FROM paciente p
				INNER JOIN cuenta_paciente cp ON cp.cui_paciente = p.cui
			WHERE email=$1 
			LIMIT 1
    `;
		const args = [email];
		logger.info({ query, args }, "Querying DB...");
		const dbResponse = await client.query(query, args);
		logger.info("Query done!");

		if (dbResponse.rowCount === 0) {
			logger.info("No patient is linked to this account!");
			return responseBuilder
				.setStatusCode(200)
				.setBody({ linkedPatientId: null })
				.build();
		}

		const linkedPatientId = dbResponse.rows[0].id_paciente;
		return responseBuilder
			.setStatusCode(200)
			.setBody({ linkedPatientId })
			.build();
	} catch (error) {
		logger.error(
			{ error },
			"An error occurred while checking if an account has a linked patient",
		);

		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to get linked patient due to internal error",
			})
			.build();
	} finally {
		await client?.end();
	}
};
