import { getPgClient, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, mapToAPIStudentInfo } from "utils/index.mjs";

/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 */
export const handler = async (event, context) => {
	withRequest(event, context);

	if (event.httpMethod !== "PUT") {
		return createResponse()
			.addCORSHeaders()
			.setStatusCode(405)
			.setBody(
				`update student info only accepts PUT method, you tried: ${event.httpMethod}`,
			)
			.build();
	}

	const responseBuilder = createResponse().addCORSHeaders("PUT");

	logger.info({ body: event.body }, "Parsing request...");
	const { idPatient, carnet, career } = JSON.parse(event.body);
	logger.info("Request body parsed!");

	if (!idPatient) {
		logger.error("No patient ID provided!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "No patientId was given!" })
			.build();
	}

	if (!carnet) {
		logger.error("No student carnet provided!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "No student carnet was given!" })
			.build();
	}

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);

		await client.connect();
		logger.info("Connected to DB!");

		const sql = `
		INSERT INTO ${SCHEMA_NAME}.estudiante (carnet, carrera, id_paciente)
		VALUES ($1, $2, $3)
		ON CONFLICT (id_paciente) DO
		UPDATE SET
			carnet = COALESCE(EXCLUDED.carnet, estudiante.carnet),
			carrera = COALESCE(EXCLUDED.carrera, estudiante.carrera)
		RETURNING *;
		`;
		const params = [carnet, career, idPatient];

		logger.info({ sql, params }, "Updating/inserting data on DB...");
		const { rows } = await client.query(sql, params);
		const studentData = rows[0];
		logger.info(studentData, "Data updated!");

		return responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPIStudentInfo(studentData))
			.build();
	} catch (error) {
		logger.error(error, "Error querying database:");

		if (error.code === "23503") {
			logger.error("A patient with the given ID doesn't exists!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ error: "No patient with the given ID found!" })
				.build();
		}

		if (error.code === "23505") {
			logger.error("A student with the same carnet already exsits!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Student carnet already exists!" })
				.build();
		}

		logger.error(error, "An error occurred!");
		return responseBuilder
			.setStatusCode(500)
			.setBody({ error: "An internal error ocurred" })
			.build();
	} finally {
		await client?.end();
		logger.info("Database connection closed!");
	}
};
