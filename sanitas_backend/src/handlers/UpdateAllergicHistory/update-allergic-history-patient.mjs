import { getPgClient, isDoctor, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, decodeJWT } from "utils";
import { mapToAPIAllergicHistory, toSafeEvent } from "utils/index.mjs";

/**
 * Handles the HTTP PUT request to update or create allergic history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateAllergicHistoryHandler = async (event, context) => {
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
			const msg =
				"An error occurred while trying to check if the user is a doctor!";
			logger.error({ err: itsDoctor.error, inputs: { email } }, msg);
			return responseBuilder.setStatusCode(500).setBody({ error: msg }).build();
		}

		if (!itsDoctor) {
			const msg = "Unauthorized, you're not a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}

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
			"Received data for updating allergic history",
		);

		const upsertQuery = `
      INSERT INTO ${SCHEMA_NAME}.antecedentes_alergicos (
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

		logger.info({ values }, "Executing upsert query with values");

		const result = await client.query(upsertQuery, values);

		if (result.rowCount === 0) {
			logger.error("No changes were made in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to update allergic history." })
				.build();
		}

		const updatedRecord = result.rows[0];
		logger.info({ updatedRecord }, "Successfully updated allergic history");
		return responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPIAllergicHistory(updatedRecord))
			.build();
	} catch (error) {
		logger.error(error, "An error occurred while updating allergic history!");

		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while updating allergic history!",
		);

		if (error.code === "23503") {
			return responseBuilder
				.setStatusCode(404)
				.setBody({ error: "No allergic history found for the provided ID." })
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
		await client?.end();
	}
};
