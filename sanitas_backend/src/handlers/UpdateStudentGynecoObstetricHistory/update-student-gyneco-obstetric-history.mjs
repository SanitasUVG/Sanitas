import { getPgClient, isDoctor, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPIGynecologicalHistory,
	requestIsSuperset,
	toSafeEvent,
} from "utils/index.mjs";

/**
 * @param {import("utils/index.mjs").GynecologicalMedicalHistory} dbData - The DB saved data.
 * @param {import("utils/index.mjs").GynecologicalMedicalHistory} requestData - The request incoming data.
 */
function requestModifiesDBData(dbData, requestData) {
	logger.debug({ pregnancies: dbData.pregnancies }, "Comparing pregnancies...");
	const modifiesData = Object.keys(dbData.pregnancies.data).some((key) => {
		const dbNumber = dbData.pregnancies.data[key];

		logger.debug(
			{ key },
			"Checking if request.pregnancies.data contains key...",
		);
		if (!Object.hasOwn(requestData.pregnancies.data, key)) {
			logger.debug({ key }, "It doesn't contains the key!");
			return true;
		}
		const requestNumber = Number.parseInt(requestData.pregnancies.data[key]);

		logger.debug(
			{ requestNumber },
			`Checking if requestData.pregnancies.data[${key}] is a number...`,
		);
		if (Number.isNaN(requestNumber)) {
			return true;
		}

		const requestIsLessThanDB = requestNumber < dbNumber;
		logger.debug(
			`Comparing: ${requestNumber} < ${dbNumber}: ${requestIsLessThanDB}`,
		);
		return requestIsLessThanDB;
	});

	if (modifiesData) {
		return true;
	}

	const dotDataFields = ["firstMenstrualPeriod"];
	logger.debug({ dotDataFields }, "Comparing fields with .data!");

	const dotDataObjectFieldsModified = dotDataFields.some((field) => {
		const dbDataContainsField = Object.hasOwn(dbData, field);
		if (!dbDataContainsField) {
			logger.debug(`The DB doesn't contain ${field}!`);
			return false;
		}
		logger.debug(`The DB contains ${field}! Checking for value...`);

		return Object.keys(dbData[field].data).some((key) => {
			const dbValue = dbData[field].data[key];
			const requestValue = requestData[field]?.data[key];
			const comparison = dbValue !== requestValue;

			logger.debug(`Comparing ${dbValue} !== ${requestValue} => ${comparison}`);
			return comparison;
		});
	});

	if (dotDataObjectFieldsModified) {
		logger.debug("Some .data field is modified!");
		return true;
	}
	logger.debug("All fields with .data are equal or just add more data!");

	logger.debug("Checking diagnosedIllnesses...");
	const dbDataContainsField = Object.hasOwn(dbData, "diagnosedIllnesses");
	if (!dbDataContainsField) {
		logger.debug(
			"The DB doesn't contain a diagnosedIllnesses key, safe to proceed!",
		);
		return false;
	}
	logger.debug("The DB contains a diagnosedIllnesses key, checking values...");

	const diagnosedIllnesesChanges = Object.keys(
		dbData.diagnosedIllnesses?.data ?? {},
	).some((key) => {
		const dataFieldKeys = Object.keys(
			dbData.diagnosedIllnesses?.data[key]?.medication ?? {},
		);
		if (dataFieldKeys.length === 0) {
			logger.debug(
				`The dbData.diagnosedIllnesses.data[${key}].medication has 0 keys inside!`,
			);
			return false;
		}

		return dataFieldKeys.some((subKey) => {
			const dbValue = dbData.diagnosedIllnesses.data[key].medication[subKey];
			const requestValue =
				requestData.diagnosedIllnesses?.data[key]?.medication[subKey];
			if (dbValue == null || dbValue === "") {
				// The existing database value is empty, so adding data is allowed
				return false;
			}
			const comparison = dbValue !== requestValue;

			logger.debug(`Comparing ${dbValue} !== ${requestValue} => ${comparison}`);
			return comparison;
		});
	});

	if (diagnosedIllnesesChanges) {
		logger.debug("The request modifies diagnosedIllnesses!");
		return true;
	}
	logger.debug("The request doesn't modifies diagnosedIllnesses!");

	logger.debug("Checking hasSurgeries...");
	if (!Object.hasOwn(dbData, "hasSurgeries")) {
		logger.debug(
			"The DB doesn't contain a `hasSurgeries` key, safe to proceed!",
		);
		return false;
	}
	logger.debug("The DB contains a `hasSurgeries` key, checking values...");

	const hasSurgeriesChanges = Object.keys(dbData.hasSurgeries?.data ?? {}).some(
		(key) => {
			if (key === "ovarianCystsSurgery") {
				logger.debug(`Skipping changes check for key ${key}`);
				return false; // Ignore changes for 'ovarianCystsSurgery'
			}

			logger.debug(
				`Checking if dbData.hasSurgeries.data[${key}] is an array...`,
			);
			if (Array.isArray(dbData.hasSurgeries.data[key])) {
				const dbValue = dbData.hasSurgeries.data[key];
				const requestValue = requestData.hasSurgeries?.data[key];
				logger.debug(
					{ dbValue, requestValue },
					`dbData.hasSurgeries.data[${key}] is an array! Checking if is subset...`,
				);
				return !requestIsSuperset(dbValue, requestValue, logger);
			}

			logger.debug(
				`Checking if dbData.hasSurgeries.data[${key}] is an object...`,
			);
			if (typeof dbData.hasSurgeries.data[key] === "object") {
				logger.debug(
					`dbData.hasSurgeries.data[${key}] is an object! Checking keys...`,
				);
				const dataFieldKeys = Object.keys(dbData.hasSurgeries.data[key]);
				if (dataFieldKeys.length === 0) {
					logger.debug(
						`dbData.hasSurgeries.data[${key}] has no keys! Safe to proceed!`,
					);
					return false;
				}
				logger.debug(
					`dbData.hasSurgeries.data[${key}] has keys! Checking values...`,
				);

				return dataFieldKeys.some((subKey) => {
					const dbValue = dbData.hasSurgeries.data[key][subKey];
					const requestValue = requestData.hasSurgeries?.data[key][subKey];
					const comparison = dbValue !== requestValue;

					logger.debug(
						`Comparing ${dbValue} !== ${requestValue} => ${comparison}`,
					);
					return comparison;
				});
			}

			logger.debug(
				`Assuming dbData.hasSurgeries.data[${key}] is an ordinary value! Checking keys...`,
			);
			const dbValue = dbData.hasSurgeries.data[key];
			const requestValue = requestData.hasSurgeries.data[key];
			const comparison = dbValue !== requestValue;

			logger.debug(`Comparing ${dbValue} !== ${requestValue} => ${comparison}`);
			return comparison;
		},
	);

	if (hasSurgeriesChanges) {
		logger.debug("hasSurgeries has changed!");
	} else {
		logger.debug("hasSurgeries didn't change!");
	}
	return hasSurgeriesChanges;
}

/**@type {import("src/commonTypes.mjs").AWSHandler} */
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

		logger.info({ email }, "Checking if the email is a doctor...");
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

		const { patientId, medicalHistory } = JSON.parse(event.body);
		if (!patientId) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing patientId." })
				.build();
		}

		const transactionResult = await transaction(client, logger, async () => {
			const getInfoQuery = `SELECT * FROM ${SCHEMA_NAME}.antecedentes_ginecoobstetricos WHERE id_paciente = $1;`;
			const args = [patientId];

			logger.info({ getInfoQuery, args }, "Querying DB...");
			const getResponse = await client.query(getInfoQuery, args);
			logger.info("Query done!");

			const oldData =
				getResponse.rowCount === 0
					? null
					: mapToAPIGynecologicalHistory(getResponse.rows[0]);

			logger.info(
				{ oldData, newData: medicalHistory },
				"Comparing oldData vs newData...",
			);
			if (
				getResponse.rowCount !== 0 &&
				requestModifiesDBData(oldData.medicalHistory, medicalHistory)
			) {
				logger.error(
					{ DBMedicalHistory: oldData, requestMedicalHistory: medicalHistory },
					"Request modifies DB Data!",
				);
				const response = responseBuilder
					.setStatusCode(403)
					.setBody({ error: "Not authorized to modify data!" })
					.build();
				return { response };
			}
			logger.info("Request data doesn't modify data!");

			const upsertQuery = `
    INSERT INTO ${SCHEMA_NAME}.antecedentes_ginecoobstetricos (
        id_paciente, 
        edad_primera_menstruacion, edad_primera_menstruacion_data, 
        ciclos_regulares, ciclos_regulares_data, 
        menstruacion_dolorosa, menstruacion_dolorosa_data, 
        num_embarazos, num_partos, num_cesareas, num_abortos, 
        medicacion_quistes_ovaricos, medicacion_quistes_ovaricos_data, 
        medicacion_miomatosis, medicacion_miomatosis_data, 
        medicacion_endometriosis, medicacion_endometriosis_data, 
        medicacion_otra_condicion, medicacion_otra_condicion_data, 
        cirugia_quistes_ovaricos, cirugia_quistes_ovaricos_data, 
        cirugia_histerectomia, cirugia_histerectomia_data, 
        cirugia_esterilizacion, cirugia_esterilizacion_data, 
        cirugia_reseccion_masas, cirugia_reseccion_masas_data
    )
    VALUES (
        $1, 
        $2, $3, 
        $4, $5, 
        $6, $7, 
        $8, $9, $10, $11, 
        $12, $13, 
        $14, $15, 
        $16, $17, 
        $18, $19, 
        $20, $21, 
        $22, $23, 
        $24, $25, 
        $26, $27
    )
    ON CONFLICT (id_paciente) DO UPDATE
    SET 
        edad_primera_menstruacion = EXCLUDED.edad_primera_menstruacion,
        edad_primera_menstruacion_data = EXCLUDED.edad_primera_menstruacion_data,
        ciclos_regulares = EXCLUDED.ciclos_regulares,
        ciclos_regulares_data = EXCLUDED.ciclos_regulares_data,
        menstruacion_dolorosa = EXCLUDED.menstruacion_dolorosa,
        menstruacion_dolorosa_data = EXCLUDED.menstruacion_dolorosa_data,
        num_embarazos = EXCLUDED.num_embarazos,
        num_partos = EXCLUDED.num_partos,
        num_cesareas = EXCLUDED.num_cesareas,
        num_abortos = EXCLUDED.num_abortos,
        medicacion_quistes_ovaricos = EXCLUDED.medicacion_quistes_ovaricos,
        medicacion_quistes_ovaricos_data = EXCLUDED.medicacion_quistes_ovaricos_data,
        medicacion_miomatosis = EXCLUDED.medicacion_miomatosis,
        medicacion_miomatosis_data = EXCLUDED.medicacion_miomatosis_data,
        medicacion_endometriosis = EXCLUDED.medicacion_endometriosis,
        medicacion_endometriosis_data = EXCLUDED.medicacion_endometriosis_data,
        medicacion_otra_condicion = EXCLUDED.medicacion_otra_condicion,
        medicacion_otra_condicion_data = EXCLUDED.medicacion_otra_condicion_data,
        cirugia_quistes_ovaricos = EXCLUDED.cirugia_quistes_ovaricos,
        cirugia_quistes_ovaricos_data = EXCLUDED.cirugia_quistes_ovaricos_data,
        cirugia_histerectomia = EXCLUDED.cirugia_histerectomia,
        cirugia_histerectomia_data = EXCLUDED.cirugia_histerectomia_data,
        cirugia_esterilizacion = EXCLUDED.cirugia_esterilizacion,
        cirugia_esterilizacion_data = EXCLUDED.cirugia_esterilizacion_data,
        cirugia_reseccion_masas = EXCLUDED.cirugia_reseccion_masas,
        cirugia_reseccion_masas_data = EXCLUDED.cirugia_reseccion_masas_data
    RETURNING *;
`;

			const values = [
				patientId,
				medicalHistory.firstMenstrualPeriod.data.age !== undefined,
				JSON.stringify(medicalHistory.firstMenstrualPeriod),
				medicalHistory.regularCycles.data.isRegular !== undefined,
				JSON.stringify(medicalHistory.regularCycles),
				medicalHistory.painfulMenstruation.data.isPainful !== undefined,
				JSON.stringify(medicalHistory.painfulMenstruation),
				medicalHistory.pregnancies.data.totalPregnancies,
				medicalHistory.pregnancies.data.vaginalDeliveries,
				medicalHistory.pregnancies.data.cesareanSections,
				medicalHistory.pregnancies.data.abortions,
				medicalHistory.diagnosedIllnesses.data.ovarianCysts !== undefined,
				JSON.stringify(medicalHistory.diagnosedIllnesses.data.ovarianCysts),
				medicalHistory.diagnosedIllnesses.data.uterineMyomatosis !== undefined,
				JSON.stringify(
					medicalHistory.diagnosedIllnesses.data.uterineMyomatosis,
				),
				medicalHistory.diagnosedIllnesses.data.endometriosis !== undefined,
				JSON.stringify(medicalHistory.diagnosedIllnesses.data.endometriosis),
				medicalHistory.diagnosedIllnesses.data.otherCondition !== undefined,
				JSON.stringify(medicalHistory.diagnosedIllnesses.data.otherCondition),
				medicalHistory.hasSurgeries.data.ovarianCystsSurgery !== undefined,
				JSON.stringify(medicalHistory.hasSurgeries.data.ovarianCystsSurgery),
				medicalHistory.hasSurgeries.data.hysterectomy !== undefined,
				JSON.stringify(medicalHistory.hasSurgeries.data.hysterectomy),
				medicalHistory.hasSurgeries.data.sterilizationSurgery !== undefined,
				JSON.stringify(medicalHistory.hasSurgeries.data.sterilizationSurgery),
				medicalHistory.hasSurgeries.data.breastMassResection !== undefined,
				JSON.stringify(medicalHistory.hasSurgeries.data.breastMassResection),
			];

			logger.info({ upsertQuery, values }, "Querying DB...");
			const result = await client.query(upsertQuery, values);
			logger.info("Query done!");
			return result;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with:");
			return transactionResult.response;
		}

		const { result } = transactionResult;

		if (result.rowCount === 0) {
			logger.error("No changes were made in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to update gynecological history." })
				.build();
		}

		const updatedRecord = result.rows[0];
		const formattedResponse = mapToAPIGynecologicalHistory(updatedRecord);
		const response = responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();

		logger.info({ response }, "Responding with:");
		return response;
	} catch (error) {
		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while updating gynecological history!",
		);

		let code = 500;
		let msg =
			"Failed to update gynecological history due to an internal error.";

		if (error.code === "23503") {
			code = 404;
			msg = "Patient not found with the provided ID";
		}

		return responseBuilder
			.setStatusCode(code)
			.setBody({
				error: msg,
			})
			.build();
	} finally {
		client?.end();
	}
};
