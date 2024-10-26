import { getPgClient, SCHEMA_NAME } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils/index.mjs";

/**
 * @typedef {Object} DBMedicalHistoryMetadata
 * @property {Object} aa_medicamento_data
 * @property {Object} aa_comida_data
 * @property {Object} aa_polvo_data
 * @property {Object} aa_polen_data
 * @property {Object} aa_cambio_de_clima_data
 * @property {Object} aa_animales_data
 * @property {Object} aa_otros_data
 * @property {Object} af_hipertension_arterial_data
 * @property {Object} af_diabetes_mellitus_data
 * @property {Object} af_hipotiroidismo_data
 * @property {Object} af_asma_data
 * @property {Object} af_convulsiones_data
 * @property {Object} af_infarto_agudo_miocardio_data
 * @property {Object} af_cancer_data
 * @property {Object} af_enfermedades_cardiacas_data
 * @property {Object} af_enfermedades_renales_data
 * @property {Object} af_otros_data
 * @property {Object} ag_edad_primera_menstruacion_data
 * @property {Object} ag_ciclos_regulares_data
 * @property {Object} ag_menstruacion_dolorosa_data
 * @property {Object} ag_num_embarazos
 * @property {Object} ag_num_partos
 * @property {Object} ag_num_cesareas
 * @property {Object} ag_num_abortos
 * @property {Object} ag_medicacion_quistes_ovaricos_data
 * @property {Object} ag_medicacion_miomatosis_data
 * @property {Object} ag_medicacion_endometriosis_data
 * @property {Object} ag_medicacion_otra_condicion_data
 * @property {Object} ag_cirugia_quistes_ovaricos_data
 * @property {Object} ag_cirugia_histerectomia_data
 * @property {Object} ag_cirugia_esterilizacion_data
 * @property {Object} ag_cirugia_reseccion_masas_data
 * @property {Object} anp_fuma_data
 * @property {Object} anp_bebidas_alcoholicas_data
 * @property {Object} anp_drogas_data
 * @property {Object} ap_hipertension_arterial_data
 * @property {Object} ap_diabetes_mellitus_data
 * @property {Object} ap_hipotiroidismo_data
 * @property {Object} ap_asma_data
 * @property {Object} ap_convulsiones_data
 * @property {Object} ap_infarto_agudo_miocardio_data
 * @property {Object} ap_cancer_data
 * @property {Object} ap_enfermedades_cardiacas_data
 * @property {Object} ap_enfermedades_renales_data
 * @property {Object} ap_otros_data
 * @property {Object} ap2_depresion_data
 * @property {Object} ap2_ansiedad_data
 * @property {Object} ap2_toc_data
 * @property {Object} ap2_tdah_data
 * @property {Object} ap2_bipolaridad_data
 * @property {Object} ap2_otro_data
 * @property {Object} aq_antecedente_quirurgico_data
 * @property {Object} at2_antecedente_traumatologico_data
 */

/**
 * @typedef {Object} MedicalHistoryMetadataRecord
 * @property {string} fullname
 * @property {string} shorthand
 */

export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders();

	if (event.httpMethod !== "GET") {
		const msg = `/medical-history/metadata/{id} only accepts GET method, you tried: ${event.httpMethod}`;
		logger.error(msg);
		return responseBuilder.setStatusCode(405).setBody({ error: msg }).build();
	}

	/**@type {import("pg").Client}*/
	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info({ url }, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();

		logger.info("Checking if received all parameters...");
		const id = event.pathParameters.id;
		if (id !== 0 && !id) {
			logger.error("No ID received!");
			const response = responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid request: No patientId supplied!" })
				.build();

			return response;
		}
		logger.info("ID received!");

		const query = `
select
	p.id,
	aa.medicamento_data as aa_medicamento_data ,
	aa.comida_data as aa_comida_data ,
	aa.polvo_data as aa_polvo_data ,
	aa.polen_data as aa_polen_data ,
	aa.cambio_de_clima_data as aa_cambio_de_clima_data ,
	aa.animales_data as aa_animales_data ,
	aa.otros_data as aa_otros_data ,
	af.hipertension_arterial_data as af_hipertension_arterial_data ,
	af.diabetes_mellitus_data as af_diabetes_mellitus_data ,
	af.hipotiroidismo_data as af_hipotiroidismo_data ,
	af.asma_data as af_asma_data ,
	af.convulsiones_data as af_convulsiones_data ,
	af.infarto_agudo_miocardio_data as af_infarto_agudo_miocardio_data ,
	af.cancer_data as af_cancer_data ,
	af.enfermedades_cardiacas_data as af_enfermedades_cardiacas_data ,
	af.enfermedades_renales_data as af_enfermedades_renales_data ,
	af.otros_data as af_otros_data ,
	ag.edad_primera_menstruacion_data as ag_edad_primera_menstruacion_data ,
	ag.ciclos_regulares_data as ag_ciclos_regulares_data ,
	ag.menstruacion_dolorosa_data as ag_menstruacion_dolorosa_data ,
	ag.num_embarazos as ag_num_embarazos ,
	ag.num_partos as ag_num_partos ,
	ag.num_cesareas as ag_num_cesareas ,
	ag.num_abortos as ag_num_abortos ,
	ag.medicacion_quistes_ovaricos_data as ag_medicacion_quistes_ovaricos_data ,
	ag.medicacion_miomatosis_data as ag_medicacion_miomatosis_data ,
	ag.medicacion_endometriosis_data as ag_medicacion_endometriosis_data ,
	ag.medicacion_otra_condicion_data as ag_medicacion_otra_condicion_data ,
	ag.cirugia_quistes_ovaricos_data as ag_cirugia_quistes_ovaricos_data ,
	ag.cirugia_histerectomia_data as ag_cirugia_histerectomia_data ,
	ag.cirugia_esterilizacion_data as ag_cirugia_esterilizacion_data ,
	ag.cirugia_reseccion_masas_data as ag_cirugia_reseccion_masas_data ,
	anp.fuma_data as anp_fuma_data ,
	anp.bebidas_alcoholicas_data as anp_bebidas_alcoholicas_data ,
	anp.drogas_data as anp_drogas_data ,
	ap.hipertension_arterial_data as ap_hipertension_arterial_data ,
	ap.diabetes_mellitus_data as ap_diabetes_mellitus_data ,
	ap.hipotiroidismo_data as ap_hipotiroidismo_data ,
	ap.asma_data as ap_asma_data ,
	ap.convulsiones_data as ap_convulsiones_data ,
	ap.infarto_agudo_miocardio_data as ap_infarto_agudo_miocardio_data ,
	ap.cancer_data as ap_cancer_data ,
	ap.enfermedades_cardiacas_data as ap_enfermedades_cardiacas_data ,
	ap.enfermedades_renales_data as ap_enfermedades_renales_data ,
	ap.otros_data as ap_otros_data ,
	ap2.depresion_data as ap2_depresion_data ,
	ap2.ansiedad_data as ap2_ansiedad_data ,
	ap2.toc_data as ap2_toc_data ,
	ap2.tdah_data as ap2_tdah_data ,
	ap2.bipolaridad_data as ap2_bipolaridad_data ,
	ap2.otro_data as ap2_otro_data ,
	aq.antecedente_quirurgico_data as aq_antecedente_quirurgico_data ,
	at2.antecedente_traumatologico_data as at2_antecedente_traumatologico_data
from
	${SCHEMA_NAME}.paciente p
left join ${SCHEMA_NAME}.antecedentes_alergicos aa on
	aa.id_paciente = p.id
left join ${SCHEMA_NAME}.antecedentes_familiares af on
	af.id_paciente = p.id
left join ${SCHEMA_NAME}.antecedentes_ginecoobstetricos ag on
	ag.id_paciente = p.id
left join ${SCHEMA_NAME}.antecedentes_no_patologicos anp on
	anp.id_paciente = p.id
left join ${SCHEMA_NAME}.antecedentes_personales ap on
	ap.id_paciente = p.id
left join ${SCHEMA_NAME}.antecedentes_psiquiatricos ap2 on
	ap2.id_paciente = p.id
left join ${SCHEMA_NAME}.antecedentes_quirurgicos aq on
	aq.id_paciente = p.id
left join ${SCHEMA_NAME}.antecedentes_traumatologicos at2 on
	at2.id_paciente = p.id
where
	p.id = $1;
		`;
		const values = [id];
		logger.info({ query, values }, "Querying DB...");
		const result = await client.query(query, values);
		logger.info({ result }, "Query done!");

		if (result.rowCount <= 0) {
			const msg = "No patient found with the given id!";
			logger.error(msg);
			return responseBuilder.setStatusCode(404).setBody({ error: msg }).build();
		}

		/**@type {DBMedicalHistoryMetadata}*/
		const medicalHistoryMetadata = result.rows[0];
		const metadataKeys = Object.keys(medicalHistoryMetadata);
		const prefixes = ["aa", "af", "ag", "anp", "ap", "ap2", "aq", "at2"];
		const prefixesWithData = prefixes.filter((prefix) =>
			metadataKeys
				.filter((key) => key.startsWith(prefix))
				.some((key) => medicalHistoryMetadata[key] !== null),
		);

		logger.info(
			{ medicalHistoryMetadata, prefixesWithData },
			"This are the prefixes with data...",
		);

		const response = responseBuilder
			.setStatusCode(200)
			.setBody(prefixesWithData)
			.build();
		logger.info(response, "Responding with:");
		return response;
	} catch (error) {
		logger.error({ error }, "An error has ocurred!");

		const response = responseBuilder
			.setStatusCode(500)
			.setBody({ error: "An internal server error has ocurred!" })
			.build();
		return response;
	} finally {
		await client?.end();
		logger.info("Connection closed!");
	}
};
