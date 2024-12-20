import { getPgClient, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, toSafeEvent } from "utils/index.mjs";

export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders();

	if (event.httpMethod !== "GET") {
		const msg = `Check Cui solo acepta el método GET, intentaste: ${event.httpMethod}`;
		logger.error(msg);
		return responseBuilder.setStatusCode(405).setBody({ error: msg }).build();
	}

	const cui = event.pathParameters.cui;
	logger.info(process.env, "Las variables de entorno son:");

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		client = getPgClient(url);
		logger.info(url, "Connecting to DB...");
		await client.connect();
		logger.info("Querying DB...");

		const query = `SELECT COUNT(*) FROM ${SCHEMA_NAME}.paciente WHERE cui = $1`;
		const values = [cui];
		const response = await client.query(query, values);
		logger.info(response.rows, "The response from the DB is:");
		const exists = response.rows[0].count > 0;

		await client.end();

		return responseBuilder.setStatusCode(200).setBody({ exists }).build();
	} catch (error) {
		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while checking CUI history!",
		);
		await client?.end();

		return responseBuilder
			.setStatusCode(500)
			.setBody({ error: "Internal Server Error" })
			.build();
	}
};
