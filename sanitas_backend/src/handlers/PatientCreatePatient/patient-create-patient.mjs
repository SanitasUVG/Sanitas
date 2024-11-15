import { getPgClient, isDoctor, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { cuiIsValid } from "utils/cui.mjs";
import { createResponse, decodeJWT } from "utils/index.mjs";

function checkValidInput(patientData) {
	const isValidCUI = cuiIsValid(patientData.cui);
	if (isValidCUI.error) {
		return { isValid: false, error: isValidCUI.error };
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
	if (!patientData.phone) {
		return { isValid: false, error: "Phone is required." };
	}
	if (!patientData.insurance) {
		return { isValid: false, error: "Insurance is required." };
	}

	return { isValid: true };
}

export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("POST");

	if (event.httpMethod !== "POST") {
		logger.error("Method Not Allowed");
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

		const transactionResult = await transaction(client, logger, async () => {
			logger.info("Checking if the user is a doctor...");
			const isDoctorResponse = await isDoctor(client, email);
			if (isDoctorResponse.error) {
				logger.error(
					{ isDoctorResponse },
					"An error ocurred while checking if the user is doctor!",
				);
				const response = responseBuilder
					.setStatusCode(500)
					.setBody(isDoctorResponse)
					.build();
				return { response };
			}

			if (isDoctorResponse) {
				logger.error("The user is a doctor!");
				const response = responseBuilder
					.setStatusCode(401)
					.setBody({ error: "Unauthorized, you're a doctor!" })
					.build();
				return { response };
			}
			logger.info("The user is not a doctor!");

			const existingPatientQuery = `
			SELECT 1 FROM ${SCHEMA_NAME}.paciente WHERE cui = $1
		`;
			const existingPatientResult = await client.query(existingPatientQuery, [
				patientData.cui,
			]);

			if (existingPatientResult.rows.length > 0) {
				logger.error(patientData.cui, "CUI already exists.");

				const response = responseBuilder
					.setStatusCode(409)
					.setBody({ error: "CUI already exists." })
					.build();

				return { response };
			}

			logger.info(
				patientData,
				"Inserting new patient record into the database...",
			);

			const query = `
			INSERT INTO ${SCHEMA_NAME}.paciente (cui, nombres, apellidos, es_mujer, fecha_nacimiento, telefono, seguro)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			returning *
		`;
			const values = [
				patientData.cui,
				patientData.names,
				patientData.lastNames,
				patientData.isWoman,
				new Date(patientData.birthdate),
				patientData.phone,
				patientData.insurance,
			];
			return await client.query(query, values);
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with:");
			return transactionResult.response;
		}

		const { result: dbresponse } = transactionResult;
		logger.info("Patient record created successfully.");

		const response = responseBuilder
			.setStatusCode(200)
			.setBody(dbresponse.rows[0].id)
			.build();
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

		return responseBuilder
			.setStatusCode(statusCode)
			.setBody({ error: errorMessage })
			.build();
	} finally {
		await client?.end();
	}
};
