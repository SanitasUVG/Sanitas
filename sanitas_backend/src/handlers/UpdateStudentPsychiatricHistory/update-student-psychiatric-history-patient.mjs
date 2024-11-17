import { getPgClient, isDoctor, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";

import {
	createResponse,
	decodeJWT,
	mapToAPIPsychiatricHistory,
	toSafeEvent,
} from "utils/index.mjs";

/**
 * Handles the HTTP POST request to update or create psychiatric history for a specific patient by students.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateStudentPsychiatricHistoryHandler = async (
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

		if (itsDoctor) {
			const msg = "Unauthorized, you're a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}
		logger.info(`${email} is not a doctor!`);

		await client.query("begin");
		const { patientId, medicalHistory } = JSON.parse(event.body);

		if (!patientId) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		const upsertQuery = `
            INSERT INTO ${SCHEMA_NAME}.antecedentes_psiquiatricos (
                id_paciente,
                depresion_data,
                ansiedad_data,
                toc_data,
                tdah_data,
                bipolaridad_data,
                otro_data
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id_paciente) DO UPDATE
            SET depresion_data = EXCLUDED.depresion_data,
                ansiedad_data = EXCLUDED.ansiedad_data,
                toc_data = EXCLUDED.toc_data,
                tdah_data = EXCLUDED.tdah_data,
                bipolaridad_data = EXCLUDED.bipolaridad_data,
                otro_data = EXCLUDED.otro_data
            RETURNING *;
        `;

		const values = [
			patientId,
			JSON.stringify(medicalHistory.depression),
			JSON.stringify(medicalHistory.anxiety),
			JSON.stringify(medicalHistory.ocd),
			JSON.stringify(medicalHistory.adhd),
			JSON.stringify(medicalHistory.bipolar),
			JSON.stringify(medicalHistory.other),
		];

		logger.info({ upsertQuery, values }, "Executing upsert query with values");
		const result = await client.query(upsertQuery, values);
		await client.query("commit");

		if (result.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to update psychiatric history." })
				.build();
		}

		logger.info("Mapping DB response into API response...");
		const updatedRecord = result.rows[0];
		const formattedResponse = mapToAPIPsychiatricHistory(updatedRecord);
		logger.info({ formattedResponse }, "Done! Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		await client.query("rollback");

		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while updating psychiatric history!",
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
				error: "Failed to update psychiatric history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		await client?.end();
	}
};
