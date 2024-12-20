import { getPgClient, isDoctor, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { mapToAPITraumatologicHistory } from "utils";
import { decodeJWT } from "utils/index.mjs";

/**
 * Handles the HTTP PUT request to update or create the traumatologic history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateTraumatologicalHistoryHandler = async (event, context) => {
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
			logger.error({ err: itsDoctor.error, inputs: { email } }, msg);
			return responseBuilder.setStatusCode(500).setBody({ error: msg }).build();
		}

		if (!itsDoctor) {
			const msg = "Unauthorized, you're not a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}
		logger.info(`${email} is a doctor!`);

		const { patientId: id, medicalHistory } = JSON.parse(event.body);

		if (!id) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		const upsertQuery = `
        INSERT INTO ${SCHEMA_NAME}.antecedentes_traumatologicos (id_paciente, antecedente_traumatologico, antecedente_traumatologico_data)
        VALUES ($1, $2, $3)
        ON CONFLICT (id_paciente) DO UPDATE
        SET antecedente_traumatologico = EXCLUDED.antecedente_traumatologico,
            antecedente_traumatologico_data = COALESCE(EXCLUDED.antecedente_traumatologico_data, antecedentes_traumatologicos.antecedente_traumatologico_data)
        RETURNING *;
    `;
		const values = [id, true, JSON.stringify(medicalHistory.traumas)];
		logger.info({ upsertQuery, values }, "Inserting/Updating values in DB...");
		const result = await client.query(upsertQuery, values);
		logger.info("Done inserting/updating!");

		if (result.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({
					message: "Failed to insert or update traumatologic history.",
				})
				.build();
		}

		const updatedRecord = result.rows[0];
		const formattedResponse = mapToAPITraumatologicHistory(updatedRecord);
		logger.info({ formattedResponse }, "Done! Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = {
			httpMethod: event.httpMethod,
			path: event.path,
			headers: {
				...event.headers,
				Authorization: "[REDACTED]",
			},
			body: event.body ? JSON.stringify(event.body) : "No body",
		};

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while updating traumatologic history!",
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
					"Failed to update traumatological history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		await client?.end();
	}
};
