import { getPgClient, isDoctor } from "db-conn";
import { logger, withRequest } from "logging";
import {
	decodeJWT,
	createResponse,
	mapToAPINonPathologicalHistory,
	checkForUnauthorizedChangesPathological,
} from "utils/index.mjs";

export const updateStudentNonPathologicalHistoryHandler = async (
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
		if (itsDoctor) {
			const msg = "Unauthorized, you're a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}
		logger.info(`${email} is not a doctor!`);

		const { patientId, medicalHistory } = JSON.parse(event.body);
		if (!patientId) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		const getPatientQuery =
			"SELECT * FROM antecedentes_no_patologicos WHERE id_paciente = $1;";

		const patientResult = await client.query(getPatientQuery, [patientId]);
		if (patientResult.rowCount > 0) {
			const dbData = patientResult.rows[0];
			const oldData = {
				smoker: dbData.fuma_data,
				drink: dbData.bebidas_alcoholicas_data,
				drugs: dbData.drogas_data,
			};

			if (checkForUnauthorizedChangesPathological(medicalHistory, oldData)) {
				await client.query("rollback");
				return responseBuilder
					.setStatusCode(400)
					.setBody({
						error: "Invalid input: Students cannot update saved info.",
					})
					.build();
			}
		}

		const upsertQuery = `
            INSERT INTO antecedentes_no_patologicos (id_paciente, tipo_sangre, fuma_data, bebidas_alcoholicas_data, drogas_data)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id_paciente) DO UPDATE
            SET tipo_sangre = EXCLUDED.tipo_sangre,
                fuma_data = EXCLUDED.fuma_data,
                bebidas_alcoholicas_data = EXCLUDED.bebidas_alcoholicas_data,
                drogas_data = EXCLUDED.drogas_data
            RETURNING *;
        `;

		const values = [
			patientId,
			medicalHistory.bloodType,
			JSON.stringify(medicalHistory.smoker),
			JSON.stringify(medicalHistory.drink),
			JSON.stringify(medicalHistory.drugs),
		];
		const result = await client.query(upsertQuery, values);

		if (result.rowCount === 0) {
			logger.error("No changes were made in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to update non-pathological history." })
				.build();
		}

		const updatedRecord = result.rows[0];
		const formattedResponse = mapToAPINonPathologicalHistory(updatedRecord);
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		logger.error(
			{ error },
			"An error occurred while updating non-pathological history!",
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
					"Failed to update non-pathological history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};