import { getPgClient, isDoctor, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { decodeJWT, mapToAPIMedicalConsultation } from "utils/index.mjs";

/**
 * Handles the HTTP PUT request to update or create a medical consultation for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateMedicalConsultationHandler = async (event, context) => {
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

		const body = JSON.parse(event.body);
		const patientId = body.patientId;
		if (!patientId) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing patientId." })
				.build();
		}

		const transactionResult = await transaction(client, logger, async () => {
			logger.info("Checking if user is doctor...");
			const itsDoctor = await isDoctor(client, email);
			if (itsDoctor.error) {
				const msg =
					"An error occurred while trying to check if the user is a doctor!";
				logger.error(itsDoctor, msg);

				const response = responseBuilder
					.setStatusCode(500)
					.setBody(itsDoctor)
					.build();
				return { response };
			}

			if (!itsDoctor) {
				logger.info("User is patient!");
				logger.info(
					{ email, patientId },
					"Checking if email belongs to patient id",
				);

				const msg = "Unauthorized, you're not a doctor!";
				logger.error({ email, patientId }, msg);

				const response = responseBuilder
					.setStatusCode(401)
					.setBody({ error: msg })
					.build();
				return { response };
			}

			const { patientConsultation } = body;
			const {
				date,
				evaluator,
				reason,
				diagnosis,
				physicalExam,
				temperature,
				systolicPressure,
				diastolicPressure,
				oxygenSaturation,
				respiratoryRate,
				heartRate,
				glucometry,
				medications,
				notes,
			} = patientConsultation.data;

			const upsertQuery = `
            INSERT INTO consulta (
                id_paciente,
                fecha,
                motivo,
                diagnostico,
                examen_fisico,
                frecuencia_respiratoria,
                temperatura,
                saturacion_oxigeno,
                glucometria,
                frecuencia_cardiaca,
                presion_sistolica,
                presion_diastolica,
                evaluador,
                medicamentos_data,
                notas
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
            ) ON CONFLICT (id) DO UPDATE
            SET
                fecha = EXCLUDED.fecha,
                motivo = EXCLUDED.motivo,
                diagnostico = EXCLUDED.diagnostico,
                examen_fisico = EXCLUDED.examen_fisico,
                frecuencia_respiratoria = EXCLUDED.frecuencia_respiratoria,
                temperatura = EXCLUDED.temperatura,
                saturacion_oxigeno = EXCLUDED.saturacion_oxigeno,
                glucometria = EXCLUDED.glucometria,
                frecuencia_cardiaca = EXCLUDED.frecuencia_cardiaca,
                presion_sistolica = EXCLUDED.presion_sistolica,
                presion_diastolica = EXCLUDED.presion_diastolica,
                evaluador = EXCLUDED.evaluador,
                medicamentos_data = EXCLUDED.medicamentos_data,
                notas = EXCLUDED.notas
            RETURNING *;
        `;

			const values = [
				patientId,
				date,
				reason,
				diagnosis,
				physicalExam,
				respiratoryRate,
				temperature,
				oxygenSaturation,
				glucometry,
				heartRate,
				systolicPressure,
				diastolicPressure,
				evaluator,
				JSON.stringify(medications),
				notes,
			];

			logger.info({ values }, "Executing upsert query with values");
			const result = await client.query(upsertQuery, values);
			logger.info({ result }, "Done inserting/updating!");
			return result;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			return transactionResult.response;
		}

		const { result } = transactionResult;

		if (result.rowCount === 0) {
			logger.error("No changes were made in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to update medical consultation." })
				.build();
		}

		const updatedRecord = mapToAPIMedicalConsultation(result.rows[0]);
		logger.info({ updatedRecord }, "Successfully updated medical consultation");
		return responseBuilder
			.setStatusCode(200)
			.setBody({
				patientId: patientId,
				patientConsultation: updatedRecord.patientConsultation,
			})
			.build();
	} catch (error) {
		logger.error(
			{ error },
			"An error occurred while updating medical consultation!",
		);

		if (error.code === "23503") {
			return responseBuilder
				.setStatusCode(404)
				.setBody({
					error: "Patient or evaluator not found with the provided ID.",
				})
				.build();
		}

		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error:
					"Failed to update medical consultation due to an internal error.",
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};
