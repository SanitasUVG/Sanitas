import { getPgClient, isDoctor } from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPIAllergicHistory,
} from "utils/index.mjs";

/**
 * Handles the HTTP POST request to update or create personal history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
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

		// Fetch existing data
		const currentDataQuery = `
			SELECT * FROM antecedentes_alergicos WHERE id_paciente = $1;
		`;
		const currentDataResult = await client.query(currentDataQuery, [patientId]);

		let existingData = {
			medicamento_data: [],
			comida_data: [],
			polvo_data: [],
			polen_data: [],
			cambio_de_clima_data: [],
			animales_data: [],
			otros_data: [],
		};

		if (currentDataResult.rowCount > 0) {
			existingData = currentDataResult.rows[0];

			if (!areAllFieldsPresent(existingData, medicalHistory)) {
				return responseBuilder
					.setStatusCode(403)
					.setBody({
						error: "Not all existing fields are present in the request.",
					})
					.build();
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

		const values = [
			patientId,
			JSON.stringify(
				medicalHistory.medication || existingData.medicamento_data,
			),
			JSON.stringify(medicalHistory.food || existingData.comida_data),
			JSON.stringify(medicalHistory.dust || existingData.polvo_data),
			JSON.stringify(medicalHistory.pollen || existingData.polen_data),
			JSON.stringify(
				medicalHistory.climateChange || existingData.cambio_de_clima_data,
			),
			JSON.stringify(medicalHistory.animals || existingData.animales_data),
			JSON.stringify(medicalHistory.others || existingData.otros_data),
		];

		logger.info({ insertQuery, values }, "Inserting/Updating values in DB...");
		const upsertResult = await client.query(insertQuery, values);
		logger.info("Done inserting/updating!");

		await client.query("commit");

		if (upsertResult.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to insert or update allergic history." })
				.build();
		}

		const updatedRecord = upsertResult.rows[0];
		const formattedResponse = mapToAPIAllergicHistory(updatedRecord);
		logger.info({ formattedResponse }, "Done! Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		await client.query("rollback");
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
		if (client) {
			await client.end();
		}
	}
};

// Helper function to check if all fields are present
function areAllFieldsPresent(existingData, requestData) {
	const existingMedicationData = safeParse(existingData.medicamento_data);
	const existingFoodData = safeParse(existingData.comida_data);
	const existingDustData = safeParse(existingData.polvo_data);
	const existingPollenData = safeParse(existingData.polen_data);
	const existingClimateChangeData = safeParse(
		existingData.cambio_de_clima_data,
	);
	const existingAnimalsData = safeParse(existingData.animales_data);
	const existingOthersData = safeParse(existingData.otros_data);

	return (
		compareArrayFields(existingMedicationData, requestData.medication) &&
		compareArrayFields(existingFoodData, requestData.food) &&
		compareArrayFields(existingDustData, requestData.dust) &&
		compareArrayFields(existingPollenData, requestData.pollen) &&
		compareArrayFields(existingClimateChangeData, requestData.climateChange) &&
		compareArrayFields(existingAnimalsData, requestData.animals) &&
		compareArrayFields(existingOthersData, requestData.others)
	);
}

function safeParse(data) {
	try {
		const parsed = JSON.parse(data || "[]");
		return Array.isArray(parsed) ? parsed : [];
	} catch (_e) {
		return [];
	}
}

function compareArrayFields(existing, incoming) {
	if (!(existing && incoming)) return true;

	// Ensure that all existing elements are present in incoming data
	return existing.every((item) =>
		incoming.some(
			(incItem) =>
				incItem.name === item.name &&
				incItem.reaction === item.reaction &&
				incItem.severity === item.severity,
		),
	);
}
