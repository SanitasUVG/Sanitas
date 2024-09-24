import { getPgClient, isDoctor, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPIGynecologicalHistory,
	requestIsSubset,
} from "utils/index.mjs";

/**
 * @param {import("utils/index.mjs").GynecologicalMedicalHistory} dbData - The DB saved data.
 * @param {import("utils/index.mjs").GynecologicalMedicalHistory} requestData - The request incoming data.
 */
function requestModifiesDBData(dbData, requestData) {
	// Comparing fields that contain a `.data` which is an object!
	const dotDataObjectFieldsModified = [
		"firstMenstrualPeriod",
		"regularCycles",
		"painfulMenstruation",
		"pregnancies",
	].some((field) => {
		const dbDataContainsField = Object.hasOwn(dbData, field);
		if (!dbDataContainsField) {
			return false;
		}

		return Object.keys(dbData[field].data).some(
			(key) => dbData[field].data[key] !== requestData[field]?.data[key],
		);
	});

	if (dotDataObjectFieldsModified) {
		return true;
	}

	// Comparing fields that have inside the `.data` arrays and objects!
	const someArraysFieldsModified = ["diagnosedIllnesses", "hasSurgeries"].some(
		(field) => {
			const dbDataContainsField = Object.hasOwn(dbData, field);
			if (!dbDataContainsField) {
				return false;
			}

			return Object.keys(dbData[field].data).some((key) => {
				if (Array.isArray(dbData[field].data[key])) {
					return !requestIsSubset(
						dbData[field].data[key],
						requestData[field]?.data[key],
					);
				}

				if (typeof dbData[field].data[key] === "object") {
					return Object.keys(dbData[field].data[key]).some(
						(subKey) =>
							dbData[field].data[key][subKey] !==
							requestData[field]?.data[key][subKey],
					);
				}

				return dbData[field].data[key] !== requestData[field].data[key];
			});
		},
	);

	return someArraysFieldsModified;
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

		logger.info({ email }, "Checking if the email is a doctor...");
		const itsDoctor = await isDoctor(client, email);
		if (itsDoctor.error) {
			const msg = "An error occurred while trying to check if user is doctor!";
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

		const { patientId, medicalHistory } = JSON.parse(event.body);
		if (!patientId) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing patientId." })
				.build();
		}

		const transactionResult = await transaction(client, logger, async () => {
			const getInfoQuery =
				"SELECT * FROM antecedentes_ginecoobstetricos WHERE id_paciente = $1;";
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
    INSERT INTO antecedentes_ginecoobstetricos (
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
		logger.error(
			{ error },
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
