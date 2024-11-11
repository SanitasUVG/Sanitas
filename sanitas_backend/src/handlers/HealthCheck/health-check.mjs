import { getPgClient, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils/index.mjs";

export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders();

	if (event.httpMethod !== "GET") {
		const msg = `Health Check solo acepta el método GET, intentaste: ${event.httpMethod}`;
		logger.error(msg);
		return responseBuilder.setStatusCode(405).setBody({ error: msg });
	}

	logger.info(process.env, "Las variables de entorno son:");
	let client;

	try {
		const url = process.env.POSTGRES_URL;
		client = getPgClient(url);
		logger.info(url, "Connecting to DB...");
		await client.connect();
		logger.info("Querying DB...");
		const query = `SELECT * FROM ${SCHEMA_NAME}.PACIENTE LIMIT 1`;
		await client.query(query);
		await client.end();

		return responseBuilder
			.setStatusCode(200)
			.setBody([
				{
					name: "DB",
					status: "UP",
				},
			])
			.build();
	} catch (error) {
		logger.error(error, "Error querying database");
		return responseBuilder
			.setStatusCode(200)
			.setBody([{ name: "DB", status: "DOWN", error: error.message }])
			.build();
	}
};
