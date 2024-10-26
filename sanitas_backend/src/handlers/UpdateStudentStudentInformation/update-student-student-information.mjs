import { getPgClient, isDoctor, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPIStudentInfo,
} from "utils/index.mjs";

/**
 * @param {import("utils/index.mjs").APIStudentInfo} savedData - The DB data
 * @param {import("utils/index.mjs").APIStudentInfo} newData - The request data
 * @returns {boolean}
 */
function requestUpdatesValues(savedData, newData) {
	return ["idPatient", "carnet"].some((key) => {
		if (!Object.hasOwn(newData, key)) {
			return true;
		}

		return savedData[key] !== newData[key];
	});
}

/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 */
export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("POST");

	if (event.httpMethod !== "POST") {
		return responseBuilder
			.setStatusCode(405)
			.setBody(
				`update student info only accepts PUT method, you tried: ${event.httpMethod}`,
			)
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

	logger.info({ body: event.body }, "Parsing request...");
	/**@type {import("utils/index.mjs").APIStudentInfo} */
	const requestData = JSON.parse(event.body);
	const { idPatient, carnet, career } = requestData;
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

	/** @type {import("pg").Client} */
	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);

		await client.connect();
		logger.info("Connected to DB!");

		const itsDoctor = await isDoctor(client, email);
		if (itsDoctor.error) {
			const msg = "An error occurred while trying to check if user is doctor!";
			logger.error({ error: itsDoctor.error }, msg);
			return responseBuilder.setStatusCode(500).setBody({ error: msg }).build();
		}

		if (itsDoctor) {
			const msg = "Unauthorized, you're a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}
		logger.info(`${email} is not a doctor!`);

		const transactionResult = await transaction(client, logger, async () => {
			let sql = `SELECT * FROM ${SCHEMA_NAME}.estudiante WHERE id_paciente = $1`;
			const values = [idPatient];

			logger.info({ sql, values }, "Querying DB for existing data...");
			const selectResult = await client.query(sql, values);

			const foundData = selectResult.rowCount > 0;
			const dbData = foundData
				? mapToAPIStudentInfo(selectResult.rows[0])
				: null;

			if (foundData && requestUpdatesValues(dbData, requestData)) {
				logger.error({ dbData, requestData }, "requestData modifies dbData!");

				const response = responseBuilder
					.setStatusCode(403)
					.setBody({ error: "Students cannot update saved info!" })
					.build();
				return { response };
			}
			logger.info("Request data doesn't modify existing data!");

			sql = `
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
			const result = await client.query(sql, params);
			logger.info("Insert completed!");

			return result;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with...");
			return transactionResult.response;
		}

		const { rows } = transactionResult.result;

		const studentData = mapToAPIStudentInfo(rows[0]);
		logger.info({ studentData }, "Data updated!");

		return responseBuilder.setStatusCode(200).setBody(studentData).build();
	} catch (error) {
		logger.error({ error }, "Error querying database:");

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
