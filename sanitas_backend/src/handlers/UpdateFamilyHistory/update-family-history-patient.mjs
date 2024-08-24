import { getPgClient, isDoctor } from "db-conn";
import { logger, withRequest } from "logging";
import {
	decodeJWT,
	createResponse,
	mapToAPIFamilyHistory,
} from "utils/index.mjs";

/**
 * Handles the HTTP PUT request to update or create family medical history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateFamilyHistoryHandler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("PUT");

	if (event.httpMethod !== "PUT") {
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

		if (!itsDoctor) {
			const msg = "Unauthorized, you're not a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}
		logger.info(`${email} is a doctor!`);

		const { patientId, medicalHistory } = JSON.parse(event.body);

		if (!patientId) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing patientId." })
				.build();
		}

		const upsertQuery = `
      INSERT INTO antecedentes_familiares (id_paciente, hipertension_arterial_data, diabetes_mellitus_data, hipotiroidismo_data, asma_data, convulsiones_data, infarto_agudo_miocardio_data, cancer_data, enfermedades_cardiacas_data, enfermedades_renales_data, otros_data)
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

		const result = await client.query(upsertQuery, values);

		if (result.rowCount === 0) {
			logger.error("No changes were made in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to update family history." })
				.build();
		}

		const updatedRecord = result.rows[0];
		return responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPIFamilyHistory(updatedRecord))
			.build();
	} catch (error) {
		logger.error({ error }, "An error occurred while updating family history!");

		if (error.code === "23503") {
			return responseBuilder
				.setStatusCode(404)
				.setBody({ error: "No family history found for the provided ID." })
				.build();
		}

		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to update family history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};
