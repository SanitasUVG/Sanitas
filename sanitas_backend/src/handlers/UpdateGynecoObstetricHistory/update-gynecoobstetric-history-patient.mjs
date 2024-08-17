import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, mapToAPIGynecologicalHistory } from "utils/index.mjs";

export const updateGynecologicalHistoryHandler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("PUT");

	if (event.httpMethod !== "PUT") {
		return responseBuilder
			.setStatusCode(405)
			.setBody({ error: "Method Not Allowed" })
			.build();
	}

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = await getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const { patientId, medicalHistory } = JSON.parse(event.body);
		if (!patientId) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing patientId." })
				.build();
		}

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
			JSON.stringify(medicalHistory.diagnosedIllnesses.data.uterineMyomatosis),
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

		const result = await client.query(upsertQuery, values);

		if (result.rowCount === 0) {
			logger.error("No changes were made in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({ message: "Failed to update gynecological history." })
				.build();
		}

		const updatedRecord = result.rows[0];
		const formattedResponse = mapToAPIGynecologicalHistory(updatedRecord);
		return responseBuilder
			.setStatusCode(200)
			.setBody(formattedResponse)
			.build();
	} catch (error) {
		logger.error(
			{ error },
			"An error occurred while updating gynecological history!",
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
					"Failed to update gynecological history due to an internal error.",
			})
			.build();
	} finally {
		if (client) {
			await client.end();
		}
	}
};
