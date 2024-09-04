import { getPgClient, isDoctor } from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPIAllergicHistory,
	requestDataEditsDBData,
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
				"An error occurred while trying to check if the user is a doctor!";
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
		try {
			await client.query("begin");

			const getPatientQuery = `
            SELECT * FROM antecedentes_alergicos WHERE id_paciente = $1;
        `;
			const result = await client.query(getPatientQuery, [patientId]);
			if (result.rowCount > 0) {
				const existingData = result.rows[0].antecedente_alergico_data;
				const newData = medicalHistory;

				logger.info({ existingData }, "Data of the patient in DB currently...");
				logger.info({ medicalHistory }, "Data coming in...");

				const repeatingData = requestDataEditsDBData(newData, existingData);

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

			const values = [
				patientId,
				JSON.stringify(medicalHistory.medication),
				JSON.stringify(medicalHistory.food),
				JSON.stringify(medicalHistory.dust),
				JSON.stringify(medicalHistory.pollen),
				JSON.stringify(medicalHistory.climateChange),
				JSON.stringify(medicalHistory.animals),
				JSON.stringify(medicalHistory.others),
			];

			const upsertQuery = `
        INSERT INTO antecedentes_alergicos (
          id_paciente,
          medicamento_data,
          comida_data,
          polvo_data,
          polen_data,
          cambio_de_clima_data,
          animales_data,
          otros_data
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8
        )
        ON CONFLICT (id_paciente) DO UPDATE
        SET medicamento_data = EXCLUDED.medicamento_data,
            comida_data = EXCLUDED.comida_data,
            polvo_data = EXCLUDED.polvo_data,
            polen_data = EXCLUDED.polen_data,
            cambio_de_clima_data = EXCLUDED.cambio_de_clima_data,
            animales_data = EXCLUDED.animales_data,
            otros_data = EXCLUDED.otros_data
        RETURNING *;
        `;

			logger.info(
				{ upsertQuery, values },
				"Inserting/Updating values in DB...",
			);
			const upsertResult = await client.query(upsertQuery, values);
			logger.info("Done inserting/updating!");

			await client.query("commit");

			if (upsertResult.rowCount === 0) {
				logger.error("No value was inserted/updated in the DB!");
				return responseBuilder
					.setStatusCode(404)
					.setBody({ message: "Failed to insert or update allergic history." })
					.build();
			}

			logger.info("Mapping DB response into API response...");
			const updatedRecord = upsertResult.rows[0];
			const formattedResponse = mapToAPIAllergicHistory(updatedRecord);
			logger.info({ formattedResponse }, "Done! Responding with:");
			return responseBuilder
				.setStatusCode(200)
				.setBody(formattedResponse)
				.build();
		} catch (error) {
			await client.query("rollback");
			throw error;
		}
	} catch (error) {
		logger.error(
			{ error },
			"An error occurred while updating allergic history!",
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
