import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

function checkValidInput(patientData) {
	if (!patientData.cui) {
		return false;
	}
	if (!patientData.names) {
		return false;
	}
	if (!patientData.lastNames) {
		return false;
	}
	if (patientData.isWoman === undefined) {
		return false;
	}
	if (!patientData.birthdate) {
		return false;
	}

	return true;
}

export const createPatientHandler = async (event, context) => {
	withRequest(event, context);

	if (event.httpMethod !== "POST") {
		throw new Error(
			`createPatientHandler only accepts POST method, attempted: ${event.httpMethod}`,
		);
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
		if (!checkValidInput(patientData)) {
			logger.error({ patientData }, "The data is missing some fields!");

			return {
				statusCode: 400,
				body: JSON.stringify({ error: "Invalid data" }),
			};
		}
		logger.info({ patientData }, "Data is valid!");

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
		logger.info("Patient record created successfully.");
		const response = {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Headers": "Content-Type",
				"Access-Control-Allow-Origin": "*", // Allow from anywhere
				"Access-Control-Allow-Methods": "POST", // Allow only POST request
			},
			body: JSON.stringify(dbresponse.rows[0].id),
		};

		logger.info(response, "Responding with:");
		return response;
	} catch (error) {
		logger.error(error, "An error occurred while creating the patient record.");

		let statusCode = 400;
		let errorMessage = "An error occurred while creating the patient record.";

		if (error.message.includes("violates unique constraint")) {
			statusCode = 409;
			errorMessage = "CUI already exists.";
		}

		const response = {
			statusCode: statusCode,
			body: JSON.stringify({ error: errorMessage }),
		};
		return response;
	} finally {
		await client?.end();
	}
};
