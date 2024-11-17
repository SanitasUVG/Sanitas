import { getPgClient, isDoctor, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPISurgicalHistory,
	requestIsSuperset,
	toSafeEvent,
} from "utils/index.mjs";

/**
 * Handles the HTTP POST request to update or create surgical history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateStudentSurgicalHistoryHandler = async (event, context) => {
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

	let client;

	try {
		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const itsDoctor = await isDoctor(client, email);
		if (itsDoctor.error) {
			const msg = "An error occurred while trying to check if user is doctor!";
			logger.error({ err: itsDoctor.error, inputs: { email } }, msg);
			return responseBuilder.setStatusCode(500).setBody({ error: msg }).build();
		}

		if (itsDoctor) {
			const msg = "Unauthorized, you're a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}
		logger.info(`${email} is not a doctor!`);

		logger.info({ eventBody: event.body }, "Parsing event body...");
		/** @type {import("utils/defaultValues.mjs").APISurgicalHistory}  */
		const { patientId: id, medicalHistory } = JSON.parse(event.body);
		logger.info("Event body parsed!");

		if (!id) {
			logger.error("No id provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		await client.query("begin");

		const studentSearchValues = [id];

		const getPatientQuery = `
			SELECT * FROM ${SCHEMA_NAME}.antecedentes_quirurgicos WHERE id_paciente = $1;
		`;

		logger.info(
			{ getPatientQuery, studentSearchValues },
			"Searching patient in DB...",
		);
		const patientResult = await client.query(
			getPatientQuery,
			studentSearchValues,
		);
		logger.info("Done searching!");

		if (patientResult.rowCount > 0) {
			const oldData =
				patientResult.rows[0].antecedente_quirurgico_data.surgeries.data;
			const newData = medicalHistory.surgeries.data;

			logger.info({ oldData }, "Data of the patient in DB currently...");
			logger.info({ newData }, "Data coming in...");

			const onlyAddsData = requestIsSuperset(oldData, newData, logger);

			if (!onlyAddsData) {
				logger.error("Student trying to update info already saved!");
				return responseBuilder
					.setStatusCode(400)
					.setBody({
						error: "Invalid input: Students cannot update saved info.",
					})
					.build();
			}
		}

		const values = [id, true, medicalHistory];

		const upsertQuery = `
				INSERT INTO ${SCHEMA_NAME}.antecedentes_quirurgicos (id_paciente, antecedente_quirurgico, antecedente_quirurgico_data)
				VALUES ($1, $2, $3)
				ON CONFLICT (id_paciente) DO UPDATE
				SET antecedente_quirurgico = COALESCE(EXCLUDED.antecedente_quirurgico, antecedentes_quirurgicos.antecedente_quirurgico),
						antecedente_quirurgico_data = COALESCE(EXCLUDED.antecedente_quirurgico_data, antecedentes_quirurgicos.antecedente_quirurgico_data)
				RETURNING *;
		`;

		logger.info({ upsertQuery, values }, "Inserting/Updating values in DB...");
		const result = await client.query(upsertQuery, values);
		logger.info("Done inserting/updating!");

		await client.query("commit");

		if (result.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");

			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to insert or update surgical history." })
				.build();
		}

		logger.info("Mapping DB response into API response...");
		const updatedRecord = result.rows[0];
		const formattedResponse = mapToAPISurgicalHistory(updatedRecord);
		logger.info({ formattedResponse }, "Done! Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		await client.query("rollback");

		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while updating surgical history!",
		);

		if (error.code === "23503") {
			return responseBuilder
				.setStatusCode(404)
				.setBody({ error: "Patient not found with the provided ID." })
				.build();
		}

		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to update surgical history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		await client?.end();
	}
};
