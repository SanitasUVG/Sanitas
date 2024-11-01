import { getPgClient, isDoctor, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, decodeJWT, mapToAPIPatient } from "utils/index.mjs";

/**
 * Checks if the given `requestData` modifies values from the `dbData`.
 * @param {import("utils/index.mjs").APIPatient} dbData - The data saved on the DB
 * @param {import("utils/index.mjs").APIPatient} requestData - The data from the request
 */
function checkIfUpdatesValues(dbData, requestData) {
	// NOTE: It's very likely some but not all properties can be changed by a patient.
	// For now we check all.
	const invalidPropertiesToModify = [
		"names",
		"lastNames",
		"cui",
		"isWoman",
		"bloodType",
		"email",
		"patienId",
	];

	// `birthdate` must be checked separately since they're Date objects.
	logger.info(
		`DB birthdate ${dbData.birthdate} and type: ${typeof dbData.birthdate}`,
	);
	const reqBirthdate = requestData.birthdate
		? new Date(requestData.birthdate)
		: null;
	logger.info(
		`Request birthdate ${requestData.birthdate} and type: ${typeof requestData.birthdate}`,
	);
	if (
		dbData.birthdate &&
		dbData.birthdate.getTime() !== reqBirthdate?.getTime()
	) {
		logger.error(
			{ currentProperty: "birthdate", dbData, requestData },
			"requestData changes dbData",
		);
		return true;
	}

	for (let i = 0; i < invalidPropertiesToModify.length; i++) {
		const currentProperty = invalidPropertiesToModify[i];
		if (
			Object.hasOwn(dbData, currentProperty) &&
			dbData[currentProperty] !== null &&
			dbData[currentProperty] !== requestData[currentProperty]
		) {
			logger.error(
				{ currentProperty, dbData, requestData },
				"requestData changes dbData",
			);
			return true;
		}
	}

	return false;
}

/**
 * Handles the HTTP POST request to update or create surgical history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const handler = async (event, context) => {
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

		logger.info({ eventBody: event.body }, "Parsing event body...");
		/** @type {import("utils/index.mjs").APIPatient}  */
		const patientData = JSON.parse(event.body);
		const id = patientData.patientId;
		logger.info("Event body parsed!");

		if (!id) {
			logger.error("No id provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		const transactionResult = await transaction(client, logger, async () => {
			const studentSearchValues = [id];
			const getPatientQuery = `
			SELECT * FROM ${SCHEMA_NAME}.paciente WHERE id = $1;
		`;

			logger.info(
				{ getPatientQuery, studentSearchValues },
				"Searching patient in DB...",
			);
			const patientResult = await client.query(
				getPatientQuery,
				studentSearchValues,
			);
			logger.info("Done searching!");

			if (patientResult.rowCount > 0) {
				const oldData = mapToAPIPatient(patientResult.rows[0]);
				const newData = patientData;

				logger.info({ oldData }, "Data of the patient in DB currently...");
				logger.info({ newData }, "Data coming in...");

				const requestUpdatesValues = checkIfUpdatesValues(oldData, newData);

				if (requestUpdatesValues) {
					logger.error("Student trying to update info already saved!");
					const response = responseBuilder
						.setStatusCode(403)
						.setBody({
							error: "Invalid input: Students cannot update saved info.",
						})
						.build();
					return { response };
				}
			}

			const upsertQuery = `
				UPDATE ${SCHEMA_NAME}.paciente
      SET 
        nombres = COALESCE($2, nombres),
        apellidos = COALESCE($3, apellidos),
        nombre_contacto1 = COALESCE($4, nombre_contacto1),
        parentesco_contacto1 = COALESCE($5, parentesco_contacto1),
        telefono_contacto1 = COALESCE($6, telefono_contacto1),
        nombre_contacto2 = COALESCE($7, nombre_contacto2),
        parentesco_contacto2 = COALESCE($8, parentesco_contacto2),
        telefono_contacto2 = COALESCE($9, telefono_contacto2),
        tipo_sangre = COALESCE($10, tipo_sangre),
        direccion = COALESCE($11, direccion),
        seguro = COALESCE($12, seguro),
        fecha_nacimiento = COALESCE($13, fecha_nacimiento),
        telefono = COALESCE($14, telefono),
        cui = COALESCE($15, cui),
        correo = COALESCE($16, correo),
        es_mujer = COALESCE($17, es_mujer)
      WHERE id = $1
      RETURNING *
		`;

			const values = [
				patientData.patientId,
				patientData.names,
				patientData.lastNames,
				patientData.contactName1,
				patientData.contactKinship1,
				patientData.contactPhone1,
				patientData.contactName2,
				patientData.contactKinship2,
				patientData.contactPhone2,
				patientData.bloodType,
				patientData.address,
				patientData.insurance,
				patientData.birthdate,
				patientData.phone,
				patientData.cui,
				patientData.email,
				patientData.isWoman !== null ? patientData.isWoman : null,
			];

			logger.info(
				{ upsertQuery, values },
				"Inserting/Updating values in DB...",
			);
			const result = await client.query(upsertQuery, values);
			logger.info("Done inserting/updating!");
			return result;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info({ response: transactionResult.response }, "Responding with:");
			return transactionResult.response;
		}

		const { result } = transactionResult;

		if (result.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");

			return responseBuilder
				.setStatusCode(404)
				.setBody({ error: "Patient not found with the provided ID." })
				.build();
		}

		logger.info("Mapping DB response into API response...");
		const updatedRecord = result.rows[0];
		const response = responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPIPatient(updatedRecord))
			.build();

		logger.info({ response }, "Done! Responding with:");
		return response;
	} catch (error) {
		logger.error(error, "An error occurred while updating surgical history!");

		return responseBuilder
			.setStatusCode(500)
			.setBody({
				error: "Failed to update surgical history due to an internal error.",
				details: error.message,
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};
