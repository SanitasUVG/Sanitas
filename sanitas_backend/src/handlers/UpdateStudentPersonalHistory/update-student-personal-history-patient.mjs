import { getPgClient, isDoctor, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { genDefaultPersonalHistory } from "utils/defaultValues.mjs";
import {
	decodeJWT,
	createResponse,
	mapToAPIPersonalHistory,
	requestIsSubset,
} from "utils/index.mjs";

/**
 * Handles the HTTP POST request to update or create personal history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateStudentPersonalHistoryHandler = async (event, context) => {
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

	logger.info({ tokenPayload: tokenInfo }, "Decoded JWT payload");

	if (tokenInfo.error) {
		logger.error({ error: tokenInfo.error }, "JWT couldn't be parsed!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "JWT couldn't be parsed" })
			.build();
	}
	const { email } = tokenInfo;
	logger.info({ tokenInfo }, "JWT Parsed!");

	/** @type {import("pg").Client} */
	let client;

	try {
		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const itsDoctor = await isDoctor(client, email);
		if (itsDoctor) {
			const msg = "Unauthorized, you're a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}

		logger.info(`${email} is not a doctor!`);

		logger.info({ eventBody: event.body }, "Parsing event body...");
		const { patientId, medicalHistory } = JSON.parse(event.body);
		logger.info("Event body parsed!");

		if (!patientId) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing patientId." })
				.build();
		}

		const transactionResult = await transaction(client, logger, async () => {
			logger.info("Fetching existing data...");
			const currentDataResult = await client.query(
				`SELECT * FROM ${SCHEMA_NAME}.antecedentes_personales WHERE id_paciente = $1`,
				[patientId],
			);
			logger.info(`Found ${currentDataResult.rowCount} patients...`);

			if (currentDataResult.rowCount > 0) {
				const { medicalHistory: existingData } = mapToAPIPersonalHistory(
					currentDataResult.rows[0],
				);

				logger.info(
					{ medicalHistory, existingData },
					"Comparing medicalHistory with existingData...",
				);
				if (requestModifiesSavedData(medicalHistory, existingData)) {
					logger.error("Request modifies data!");
					const response = responseBuilder
						.setStatusCode(403)
						.setBody({ error: "Not authorized to update data!" })
						.build();

					logger.info({ response }, "Responding with:");
					return { response };
				}
			}

			const defaultValues = genDefaultPersonalHistory();
			const values = [
				patientId,
				JSON.stringify(
					medicalHistory.hypertension || defaultValues.hypertension,
				),
				JSON.stringify(
					medicalHistory.diabetesMellitus || defaultValues.diabetesMellitus,
				),
				JSON.stringify(
					medicalHistory.hypothyroidism || defaultValues.hypothyroidism,
				),
				JSON.stringify(medicalHistory.asthma || defaultValues.asthma),
				JSON.stringify(medicalHistory.convulsions || defaultValues.convulsions),
				JSON.stringify(
					medicalHistory.myocardialInfarction ||
						defaultValues.myocardialInfarction,
				),
				JSON.stringify(medicalHistory.cancer || defaultValues.cancer),
				JSON.stringify(
					medicalHistory.cardiacDiseases || defaultValues.cardiacDiseases,
				),
				JSON.stringify(
					medicalHistory.renalDiseases || defaultValues.renalDiseases,
				),
				JSON.stringify(medicalHistory.others || defaultValues.others),
			];

			const upsertQuery = `
            INSERT INTO ${SCHEMA_NAME}.antecedentes_personales (id_paciente, hipertension_arterial_data, diabetes_mellitus_data, hipotiroidismo_data, asma_data, convulsiones_data, infarto_agudo_miocardio_data, cancer_data, enfermedades_cardiacas_data, enfermedades_renales_data, otros_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id_paciente) DO UPDATE
            SET hipertension_arterial_data = EXCLUDED.hipertension_arterial_data,
                diabetes_mellitus_data = EXCLUDED.diabetes_mellitus_data,
                hipotiroidismo_data = EXCLUDED.hipotiroidismo_data,
                asma_data = EXCLUDED.asma_data,
                convulsiones_data = EXCLUDED.convulsiones_data,
                infarto_agudo_miocardio_data = EXCLUDED.infarto_agudo_miocardio_data,
                cancer_data = EXCLUDED.cancer_data,
                enfermedades_cardiacas_data = EXCLUDED.enfermedades_cardiacas_data,
                enfermedades_renales_data = EXCLUDED.enfermedades_renales_data,
                otros_data = EXCLUDED.otros_data
            RETURNING *;
        `;

			logger.info({ upsertQuery, values }, "Inserting values in DB...");

			const upsertResult = await client.query(upsertQuery, values);
			logger.info("Done inserting/updating!");
			return upsertResult;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}
		if (transactionResult.response) {
			const { response } = transactionResult;
			logger.info({ response }, "Responding with:");
			return response;
		}
		const { result: upsertResult } = transactionResult;

		if (upsertResult.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to insert or update personal history." })
				.build();
		}

		logger.info("Mapping DB response into API response...");
		const updatedRecord = upsertResult.rows[0];
		const formattedResponse = mapToAPIPersonalHistory(updatedRecord);
		logger.info({ formattedResponse }, "Done! Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		await client.query("rollback");
		logger.error(
			{ error },
			"An error occurred while updating personal history!",
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
				error: "Failed to update personal history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};

function requestModifiesSavedData(requestData, savedData) {
	if (savedData === null || savedData === requestData) {
		return false;
	}

	const properties = Object.keys(savedData);
	logger.info({ properties }, "Checking properties...");

	const doesntModifyData = properties.every((key) => {
		logger.info({ key }, "Checking key...");
		if (!Object.hasOwn(requestData, key)) {
			logger.error({ key }, "Key isn't present on request data!");
			return false;
		}

		logger.info(
			{ savedData: savedData[key], requestData: requestData[key] },
			"Comparing savedData with requestData",
		);
		return requestIsSubset(savedData[key].data, requestData[key].data, logger);
	});

	if (!doesntModifyData) {
		return true;
	}

	logger.info({ properties }, "Properties aren't changed!");
	return false;
}
