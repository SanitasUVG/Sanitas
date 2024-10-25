import { getPgClient, isDoctor, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { decodeJWT, mapToAPIPsychiatricHistory } from "utils/index.mjs";

/**
 * Handles the HTTP PUT request to update or create psychiatric history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updatePsychiatricHistoryHandler = async (event, context) => {
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

		logger.info(
			{ patientId, medicalHistory },
			"Received data for updating psychiatric history",
		);

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
      VALUES (
        $1, $2, $3, $4, $5, $6, $7
      )
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

		logger.info({ values }, "Executing upsert query with values");

		const result = await client.query(upsertQuery, values);

		if (result.rowCount === 0) {
			logger.error("No changes were made in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to update psychiatric history." })
				.build();
		}

		const updatedRecord = result.rows[0];
		logger.info({ updatedRecord }, "Successfully updated psychiatric history");
		return responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPIPsychiatricHistory(updatedRecord))
			.build();
	} catch (error) {
		logger.error(
			{ error },
			"An error occurred while updating psychiatric history!",
		);

		if (error.code === "23503") {
			return responseBuilder
				.setStatusCode(404)
				.setBody({ error: "No psychiatric history found for the provided ID." })
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
		if (client) {
			await client.end();
		}
	}
};
