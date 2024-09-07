import { getPgClient, isDoctor } from "db-conn";
import { logger, withRequest } from "logging";
import {
	decodeJWT,
	createResponse,
	mapToAPIPersonalHistory,
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

		// Verificar si el registro ya existe
		const currentDataQuery = `
            SELECT * FROM antecedentes_personales WHERE id_paciente = $1;
        `;
		const currentDataResult = await client.query(currentDataQuery, [patientId]);

		if (currentDataResult.rowCount > 0) {
			// Si el registro existe, no permitir la actualización
			return responseBuilder
				.setStatusCode(403)
				.setBody({ error: "Modification not allowed. You are not allowed to make changes" })
				.build();
		}

		// Preparar los valores para la inserción
		const values = [
			patientId,
			JSON.stringify(medicalHistory.hypertension),
			JSON.stringify(medicalHistory.diabetesMellitus),
			JSON.stringify(medicalHistory.hypothyroidism),
			JSON.stringify(medicalHistory.asthma),
			JSON.stringify(medicalHistory.convulsions),
			JSON.stringify(medicalHistory.myocardialInfarction),
			JSON.stringify(medicalHistory.cancer),
			JSON.stringify(medicalHistory.cardiacDiseases),
			JSON.stringify(medicalHistory.renalDiseases),
			JSON.stringify(medicalHistory.others),
		];

		const insertQuery = `
            INSERT INTO antecedentes_personales (id_paciente, hipertension_arterial_data, diabetes_mellitus_data, hipotiroidismo_data, asma_data, convulsiones_data, infarto_agudo_miocardio_data, cancer_data, enfermedades_cardiacas_data, enfermedades_renales_data, otros_data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
        `;

		logger.info({ insertQuery, values }, "Inserting values into DB...");
		const insertResult = await client.query(insertQuery, values);
		logger.info("Done inserting!");

		await client.query("commit");

		if (insertResult.rowCount === 0) {
			logger.error("No value was inserted into the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to insert personal history." })
				.build();
		}

		logger.info("Mapping DB response into API response...");
		const insertedRecord = insertResult.rows[0];
		const formattedResponse = mapToAPIPersonalHistory(insertedRecord);
		logger.info({ formattedResponse }, "Done! Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		await client.query("rollback");
		logger.error(
			{ error },
			"An error occurred while inserting personal history!",
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
				error: "Failed to insert personal history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};
