import { getPgClient, isDoctor, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { genDefaultAllergicHistory } from "utils/defaultValues.mjs";
import {
	createResponse,
	decodeJWT,
	mapToAPIAllergicHistory,
} from "utils/index.mjs";

/**
 * Handles the HTTP POST request to update or create allergic history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */

export const updateStudentAllergicHistoryHandler = async (event, context) => {
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

	/** @type {import("pg").Client} */
	let client;

	try {
		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const itsDoctor = await isDoctor(client, email);

		if (itsDoctor.error) {
			const msg =
				"An error ocurred while trying to check if the user is a doctor!";
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
			// Fetch existing data
			const currentDataQuery =
				"SELECT * FROM antecedentes_alergicos WHERE id_paciente = $1";
			const currentDataResult = await client.query(currentDataQuery, [
				patientId,
			]);

			if (currentDataResult.rowCount > 0) {
				const existingData = mapToAPIAllergicHistory(currentDataResult.rows[0]);

				if (requestModifiesSavedData(medicalHistory, existingData)) {
					const response = responseBuilder
						.setStatusCode(403)
						.setBody({
							error: "Not authorized to update data!",
						})
						.build();
					return { response };
				}
			}

			// Use ON CONFLICT to update the data, merging existing and new information
			const insertQuery = `
			INSERT INTO antecedentes_alergicos (
				id_paciente,
				medicamento_data,
				comida_data,
				polvo_data,
				polen_data,
				cambio_de_clima_data,
				animales_data,
				otros_data
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			ON CONFLICT (id_paciente) DO UPDATE
			SET 
				medicamento_data = EXCLUDED.medicamento_data,
				comida_data = EXCLUDED.comida_data,
				polvo_data = EXCLUDED.polvo_data,
				polen_data = EXCLUDED.polen_data,
				cambio_de_clima_data = EXCLUDED.cambio_de_clima_data,
				animales_data = EXCLUDED.animales_data,
				otros_data = EXCLUDED.otros_data
			RETURNING *;
		`;

			const defaultValues = genDefaultAllergicHistory();
			const values = [
				patientId,
				JSON.stringify(medicalHistory.medication || defaultValues.medication),
				JSON.stringify(medicalHistory.food || defaultValues.food),
				JSON.stringify(medicalHistory.dust || defaultValues.dust),
				JSON.stringify(medicalHistory.pollen || defaultValues.pollen),
				JSON.stringify(
					medicalHistory.climateChange || defaultValues.climateChange,
				),
				JSON.stringify(medicalHistory.animals || defaultValues.animals),
				JSON.stringify(medicalHistory.others || defaultValues.others),
			];

			logger.info(
				{ insertQuery, values },
				"Inserting/Updating values in DB...",
			);

			const queryResult = await client.query(insertQuery, values);
			logger.info("Done inserting/updating!");
			return queryResult;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}
		if (transactionResult.response) {
			const { response } = transactionResult;
			logger.info({ response }, "Responding with: ");
			return response;
		}
		const { result: upsertResult } = transactionResult;

		if (upsertResult.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to insert or update allergic history." })
				.build();
		}

		const updatedRecord = upsertResult.rows[0];
		const response = responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPIAllergicHistory(updatedRecord))
			.build();
		logger.info({ response }, "Done! Responding with:");
		return response;
	} catch (error) {
		logger.error(
			{ error },
			"An error occurred while updating allergic history!",
		);

		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to update allergic history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		await client?.end();
	}
};

/**
 * @param {import("utils/index.mjs").AllergicMedicalHistory} requestData
 * @param {import("utils/index.mjs").AllergicMedicalHistory} savedData
 */
function requestModifiesSavedData(requestData, savedData) {
	if (savedData === null || savedData === undefined) {
		return false;
	}

	return !Object.keys(savedData).every((key) => {
		if (!Object.hasOwn(requestData, key)) {
			return false;
		}
		const savedArr = savedData[key];
		const requestArr = [...requestData[key]];

		return savedArr.every((savedValue) => {
			const properties = Object.keys(savedValue);
			for (let i = 0; i < requestArr.length; i++) {
				const reqValue = requestArr[i];
				if (
					properties.every((prop) => {
						return savedValue[prop] === reqValue[prop];
					})
				) {
					requestArr.splice(i, 1);
					return false;
				}
			}

			return true;
		});
	});
}
