import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, mapToAPICollaboratorInfo } from "utils/index.mjs";

/**
 * Get the collaborator information endpoint handler.
 * This endpoint must return all the information contained inside the COLABORADOR table for a specific collaborator.
 */
export const getCollaboratorHandler = async (event, context) => {
	withRequest(event, context);
	if (event.httpMethod !== "GET") {
		throw new Error(
			`/patient/collaborator/{id} only accepts GET method, you tried: ${event.httpMethod}`,
		);
	}

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();

		logger.info("Checking if received all parameters...");
		const id = event.pathParameters.id;
		if (!id) {
			logger.error("No id received!");
			const response = {
				statusCode: 400,
				headers: {
					"Access-Control-Allow-Headers": "Content-Type",
					"Access-Control-Allow-Origin": "*", // Allow from anywhere
					"Access-Control-Allow-Methods": "GET", // Allow only GET request
				},
				body: JSON.stringify({ message: "Invalid request: No id supplied!" }),
			};

			return response;
		}
		logger.info("ID received!");

		logger.info("Querying DB...");
		const dbResponse = await client.query(
			"SELECT * FROM colaborador WHERE ID_PACIENTE = $1 LIMIT 1;",
			[id],
		);
		logger.info(dbResponse, "Query done!");

		if (dbResponse.rowCount === 0) {
			logger.error("No record found! Returning default data");

			return createResponse()
				.setStatusCode(200)
				.addCORSHeaders()
				.setBody({ idPatient: id, code: null, area: null })
				.build();
		}

		logger.info("Creating response...");

		logger.info(dbResponse.rows[0], "Responding with:");
		return createResponse()
			.setStatusCode(200)
			.addCORSHeaders()
			.setBody(mapToAPICollaboratorInfo(dbResponse.rows[0]))
			.build();
	} catch (error) {
		logger.error(error, "An error has occurred!");
		return createResponse()
			.setStatusCode(500)
			.addCORSHeaders()
			.setBody(error)
			.build();
	} finally {
		await client?.end();
	}
};
