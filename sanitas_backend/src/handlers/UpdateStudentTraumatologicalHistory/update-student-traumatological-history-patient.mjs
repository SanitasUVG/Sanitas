import { getPgClient, isDoctor } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { mapToAPITraumatologicHistory } from "utils";
import { decodeJWT, requestDataEditsDBData } from "utils/index.mjs";

/**
 * Handles the HTTP POST request to update or create the traumatologic history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateStudentTraumatologicalHistoryHandler = async (
	event,
	context,
) => {
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

		logger.info({ eventBody: event.body }, "Parsing event body...");
		const { patientId: id, medicalHistory } = JSON.parse(event.body);
		logger.info("Event body parsed!");

		if (!id) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		await client.query("begin");

		const studentSearchValues = [id];

		const getPatientQuery = `
			SELECT * FROM antecedentes_traumatologicos WHERE id_paciente = $1;
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
				patientResult.rows[0].antecedente_traumatologico_data.traumas.data;
			const newData = medicalHistory.traumas.data;

			logger.info({ oldData }, "Data of the patient in DB currently...");
			logger.info({ medicalHistory }, "Data coming in...");

			const repeatingData = requestDataEditsDBData(newData, oldData);

			if (repeatingData) {
				logger.error("Student trying to update info already saved!");
				return responseBuilder
					.setStatusCode(400)
					.setBody({
						error: "Invalid input: Students cannot update saved info.",
					})
					.build();
			}
		}

		const upsertQuery = `
        INSERT INTO antecedentes_traumatologicos (id_paciente, antecedente_traumatologico, antecedente_traumatologico_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_paciente) DO UPDATE
        SET antecedente_traumatologico = EXCLUDED.antecedente_traumatologico,
            antecedente_traumatologico_data = COALESCE(EXCLUDED.antecedente_traumatologico_data, antecedentes_traumatologicos.antecedente_traumatologico_data)
        RETURNING *;
    `;
		const values = [id, true, JSON.stringify(medicalHistory.traumas)];
		logger.info({ upsertQuery, values }, "Inserting/Updating values in DB...");
		const result = await client.query(upsertQuery, values);
		logger.info("Done inserting/updating!");

		await client.query("commit");

		if (result.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({
					message: "Failed to insert or update traumatologic history.",
				})
				.build();
		}

		const updatedRecord = result.rows[0];
		const formattedResponse = mapToAPITraumatologicHistory(updatedRecord);
		logger.info({ formattedResponse }, "Done! Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		await client.query("rollback");
		logger.error(
			{ error },
			"An error occurred while updating traumatologic history!",
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
				error:
					"Failed to update traumatological history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};
