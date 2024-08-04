import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, mapToAPIStudentInfo } from "utils";

/**
 * Get the student information endpoint handler.
 * This endpoint must return all the information contained inside the ESTUDIANTE table for a specific student.
 */
export const handler = async (event, context) => {
	withRequest(event, context);
	if (event.httpMethod !== "GET") {
		throw new Error(
			`/patient/student/{id} only accepts GET method, you tried: ${event.httpMethod}`,
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

			return createResponse()
				.setStatusCode(400)
				.addCORSHeaders()
				.setBody({ message: "Invalid request: No id supplied!" })
				.build();
		}
		logger.info("CARNET received!");

		logger.info("Querying DB...");
		const dbResponse = await client.query(
			"SELECT * FROM estudiante WHERE ID_PACIENTE = $1 LIMIT 1;",
			[id],
		);
		logger.info(dbResponse, "Query done!");

		if (dbResponse.rowCount === 0) {
			/** @type {APIStudentInfo} */
			const defaultStudentInfo = {
				patientId: id,
				carnet: "",
				career: "",
			};
			logger.error(
				{ defaultStudentInfo },
				"No record found! Returning empty data...",
			);

			return createResponse()
				.setStatusCode(200)
				.addCORSHeaders()
				.setBody(defaultStudentInfo)
				.build();
		}

		logger.info("Creating response...");

		logger.info(dbResponse.rows[0], "Responding with:");
		return createResponse()
			.setStatusCode(200)
			.addCORSHeaders()
			.setBody(mapToAPIStudentInfo(dbResponse.rows[0]))
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
