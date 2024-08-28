import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils/index.mjs";

function checkValidInput(patientData) {
	if (!patientData.cui) {
		return { isValid: false, error: "CUI is required." };
	}
	if (!patientData.names) {
		return { isValid: false, error: "Names are required." };
	}
	if (!patientData.lastNames) {
		return { isValid: false, error: "Last names are required." };
	}
	if (patientData.isWoman === undefined) {
		return { isValid: false, error: "Gender (isWoman) is required." };
	}
	if (!patientData.birthdate) {
		return { isValid: false, error: "Birthdate is required." };
	}

	return { isValid: true };
}
export const createPatientHandler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("POST");

	if (event.httpMethod !== "POST") {
		logger.error("Method Not Allowed");
		return responseBuilder
			.setStatusCode(405)
			.setBody({ error: "Method Not Allowed" })
			.build();
	}

	const patientData = JSON.parse(event.body);
	logger.info(process.env, "Environment variables are:");

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to the database...");
		client = getPgClient(url);
		await client.connect();

		logger.info("Validating data...");
		const validation = checkValidInput(patientData);
		if (!validation.isValid) {
			logger.error({ patientData }, "The data is missing some fields!");

			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: validation.error })
				.build();
		}
		logger.info({ patientData }, "Data is valid!");

		try {
			await client.query("BEGIN");
			// Check if the CUI already exists in the database
			const existingPatientQuery = `
			SELECT 1 FROM PACIENTE WHERE CUI = $1
		`;
			const existingPatientResult = await client.query(existingPatientQuery, [
				patientData.cui,
			]);
			if (existingPatientResult.rows.length > 0) {
				logger.error("CUI already exists.");

				return responseBuilder
					.setStatusCode(409)
					.setBody({ error: "CUI already exist!" })
					.build();
			}

			logger.info(
				patientData,
				"Inserting new patient record into the database...",
			);

			const query = `
			INSERT INTO PACIENTE (CUI, NOMBRES, APELLIDOS, ES_MUJER, FECHA_NACIMIENTO)
			VALUES ($1, $2, $3, $4, $5)
			returning *
		`;
			const values = [
				patientData.cui,
				patientData.names,
				patientData.lastNames,
				patientData.isWoman,
				new Date(patientData.birthdate),
			];
			const dbresponse = await client.query(query, values);
			await client.query("COMMIT");
			logger.info("Patient record created successfully.");

			const response = responseBuilder
				.setStatusCode(200)
				.setBody(dbresponse.rows[0].id)
				.build();
			logger.info(response, "Responding with:");
			return response;
		} catch (error) {
			logger.error("Transaction failed! Rolling back...");
			await client.query("ROLLBACK");
			throw error;
		}
	} catch (error) {
		logger.error(error, "An error occurred while creating the patient record.");

		let statusCode = 400;
		let errorMessage = "An error occurred while creating the patient record.";

		if (error.message.includes("violates unique constraint")) {
			statusCode = 409;
			errorMessage = "CUI already exists.";
		}

		return responseBuilder
			.setStatusCode(statusCode)
			.setBody({ error: errorMessage })
			.build();
	} finally {
		await client?.end();
	}
};
