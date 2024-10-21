import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils/index.mjs";

export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders();

	logger.info(process.env, "Las variables de entorno son:");
	let client;

	try {
		const url = process.env.POSTGRES_URL;
		client = getPgClient(url);
		logger.info({ url }, "Connecting to DB...");
		await client.connect();
		logger.info("Connected!");

		const query = "REFRESH MATERIALIZED VIEW stats";
		logger.info({ query }, "Querying DB...");
		const result = await client.query(query);
		logger.info({ result }, "Done!");

		return responseBuilder.setStatusCode(200).build();
	} catch (error) {
		logger.error({ error }, "An error occurred refreshing `stats` view!");
		return responseBuilder.setStatusCode(502).setBody({ error }).build();
	} finally {
		await client?.end();
	}
};
