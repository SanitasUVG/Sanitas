import { jwtDecode } from "jwt-decode";

/**
 * Decodes de data of a valid JWT.
 * This function assumes the decoded JWT doesn't have a field named `error`.
 * @param {string} jwt - The JWT token to decode.
 * @returns {*|{error: *}} The JWT token or an object with `error` if an error ocurred.
 */
export function decodeJWT(jwt) {
	try {
		return jwtDecode(jwt);
	} catch (error) {
		return { error };
	}
}

/**
 * @typedef {Object} DBPatient
 * @property {number} id
 * @property {string} cui
 * @property {boolean} es_mujer
 * @property {string} nombres
 * @property {string|null} correo
 * @property {string} apellidos
 *
 * @property {string|null} nombre_contacto1
 * @property {string|null} parentesco_contacto1
 * @property {string|null} telefono_contacto1
 *
 * @property {string|null} nombre_contacto2
 * @property {string|null} parentesco_contacto2
 * @property {string|null} telefono_contacto2
 *
 * @property {string|null} tipo_sangre
 * @property {string|null} direccion
 * @property {string | null} seguro
 * @property {string} fecha_nacimiento
 * @property {string|null} telefono
 */

/**
 * @typedef {Object} APIPatient
 * @property {number} patientId
 * @property {string} cui
 * @property {boolean} isWoman
 * @property {string|null} email
 * @property {string} names
 * @property {string} lastNames
 *
 * @property {string|null} contactName1
 * @property {string|null} contactKinship1
 * @property {string|null} contactPhone1
 *
 * @property {string|null} contactName2
 * @property {string|null} contactKinship2
 * @property {string|null} contactPhone2
 *
 * @property {string|null} bloodType
 * @property {string|null} address
 * @property {string | undefined} insurance
 * @property {Date} birthdate
 * @property {string|null} phone
 */

/**
 * @template T
 * @typedef {Object} APIMedicalHistory
 * @property {number} patientId - The patient Id associated to this medical history.
 * @property {T} medicalHistory - The medical history data, each can have it's own format.
 */

/**
 * @template T
 * @typedef {Object} APIMedicalHistoryItem
 * @property {number} version - The version of this JSON API when it was saved to the DB.
 * @property {T} data - The data this item contains.
 */

/**
 * Maps a DBPatient to an APIPatient.
 * @param {DBPatient} dbPatient The patient received from the DB.
 * @returns {APIPatient} The patient object the API must return.
 */
export function mapToAPIPatient(dbPatient) {
	const {
		id: patientId,
		cui,
		es_mujer: isWoman,
		correo: email,
		nombres: names,
		apellidos: lastNames,

		nombre_contacto1: contactName1,
		parentesco_contacto1: contactKinship1,
		telefono_contacto1: contactPhone1,

		nombre_contacto2: contactName2,
		parentesco_contacto2: contactKinship2,
		telefono_contacto2: contactPhone2,

		tipo_sangre: bloodType,
		direccion: address,
		seguro: insurance,
		fecha_nacimiento: birthdate,
		telefono: phone,
	} = dbPatient;

	return {
		patientId,
		cui,
		email,
		isWoman,
		names,
		lastNames,

		contactName1,
		contactKinship1,
		contactPhone1,

		contactName2,
		contactKinship2,
		contactPhone2,

		bloodType,
		address,
		insurance,
		birthdate,
		phone,
	};
}

/**
 * @callback AddCORSHeadersCallback
 * @param {string} [allowMethods="GET"] The methods allowed by this HTTP request. By default accepts only GET requests.
 * @param {string} [allowOrigin="*"] The origin allowed by this HTTP request. By default accepts all.
 * @param {string} [allowHeaders="Content-Type"] The allowed headers for the HTTP request. By default only Content-Type is allowed.
 * @returns {ResponseBuilder} The response builder.
 */

/**
 * @typedef {Object} ResponseBuilder
 * @property {(status: number)=>ResponseBuilder} setStatusCode - Sets the response status code.
 * @property {(bodyObj: object)=> ResponseBuilder} setBody - Sets the response body. You don't need to stringify the body, this function will take care of that for you.
 * @property {(header: string, value: string)=>ResponseBuilder} addHeader - Adds a header to the response.
 * @property {AddCORSHeadersCallback}  addCORSHeaders - Adds some headers wanted by CORS. The default method is GET, origin is * and headres is Content-Type only.
 * @property {()=> import('aws-lambda').APIGatewayProxyResult} build - Build the Response.
 */

/**
 * The starting method to create an HTTP response.
 *
 * Use the method provided by this API to build a response.
 * @returns {ResponseBuilder}
 */
export function createResponse() {
	/** @type ResponseBuilder */
	const builder = {
		status: 500,
		headers: {},
		body: "",

		setStatusCode: (status) => {
			builder.status = status;
			return builder;
		},

		setBody: (bodyObj) => {
			builder.body = JSON.stringify(bodyObj);
			return builder;
		},

		addHeader: (header, value) => {
			builder.headers[header] = value;
			return builder;
		},

		addCORSHeaders: (
			allowMethods = "GET",
			allowOrigin = "*",
			allowHeaders = "Content-Type",
		) => {
			builder.addHeader("Access-Control-Allow-Headers", allowHeaders);
			builder.addHeader("Access-Control-Allow-Origin", allowOrigin);
			builder.addHeader("Access-Control-Allow-Methods", allowMethods);

			return builder;
		},

		build: () => ({
			statusCode: builder.status,
			headers: builder.headers,
			body: builder.body,
		}),
	};

	return builder;
}

/**
 * @typedef {Object} DBStudentInfo
 * @property {string} id_paciente
 * @property {string} carnet
 * @property {string} carrera
 */

/**
 * @typedef {Object} APIStudentInfo
 * @property {string} idPatient
 * @property {string} carnet
 * @property {string} career
 */

/**
 * Maps a DB Student info into an API student info.
 * @param {DBStudentInfo} dbStudentInfo - The DB student information.
 * @returns {APIStudentInfo} The API formatted student information.
 */
export function mapToAPIStudentInfo(dbStudentInfo) {
	const { id_paciente: idPatient, carnet, carrera: career } = dbStudentInfo;

	return {
		idPatient,
		carnet,
		career,
	};
}

/**
 * @typedef {Object} DBCollaborator
 * @property {string} codigo
 * @property {string} area
 * @property {number} id_paciente
 */

/**
 * @typedef {Object} APICollaborator
 * @property {string} code
 * @property {string} area
 * @property {number} idPatient
 */

/**
 * Maps a DBCollaborator to an APICollaborator.
 * @param {DBCollaborator} dbCollaborator The collaborator received from the DB.
 * @returns {APICollaborator} The collaborator object the API must return.
 */
export function mapToAPICollaboratorInfo(dbCollaborator) {
	const { codigo: code, area, id_paciente: idPatient } = dbCollaborator;
	return {
		code,
		area,
		idPatient,
	};
}

/**
 * Maps an APICollaborator into a DBCollaborator
 * @param {APICollaborator} apiCollaborator
 * @returns {DBCollaborator}
 */
export function mapToDBCollaborator(apiCollaborator) {
	const { code: codigo, area, idPatient: id_paciente } = apiCollaborator;
	return { codigo, area, id_paciente };
}

/**
 * @typedef {Object} MedicalConditionData
 * @property {number} version - The version of the data format.
 * @property {Array<string|Object>} data - An array containing the medical history data.
 *                                         This array may contain simple strings for some conditions
 *                                         and objects for others that require more detailed information.
 */

/**
 * @typedef {Object} DBData
 * @property {number} id_paciente - The unique identifier of the patient.
 * @property {null|MedicalConditionData} hipertension_arterial_data - Medical history data for hypertension.
 * @property {null|MedicalConditionData} diabetes_mellitus_data - Medical history data for diabetes mellitus.
 * @property {null|MedicalConditionData} hipotiroidismo_data - Medical history data for hypothyroidism.
 * @property {null|MedicalConditionData} asma_data - Medical history data for asthma.
 * @property {null|MedicalConditionData} convulsiones_data - Medical history data for convulsions.
 * @property {null|MedicalConditionData} infarto_agudo_miocardio_data - Medical history data for myocardial infarction.
 * @property {null|MedicalConditionData} cancer_data - Medical history data for cancer.
 * @property {null|MedicalConditionData} enfermedades_cardiacas_data - Medical history data for cardiac diseases.
 * @property {null|MedicalConditionData} enfermedades_renales_data - Medical history data for renal diseases.
 * @property {null|MedicalConditionData} otros_data - Medical history data for other conditions not listed separately.
 * @property {null|MedicalConditionData} medicamento_data - Allergic medical history data for medication.
 * @property {null|MedicalConditionData} comida_data - Allergic medical history data for food.
 * @property {null|MedicalConditionData} polvo_data - Allergic medical history data for dust.
 * @property {null|MedicalConditionData} polen_data - Allergic medical history data for pollen.
 * @property {null|MedicalConditionData} cambio_de_clima_data - Allergic medical history data for climate change.
 * @property {null|MedicalConditionData} animales_data - Allergic medical history data for animals.
 * @property {null|MedicalConditionData} otros_data - Allergic medical history data for other allergies.
 * @property {null|MedicalConditionData} depresion_data - Psychiatric medical history data for depression.
 * @property {null|MedicalConditionData} ansiedad_data - Psychiatric medical history data for anxiety.
 * @property {null|MedicalConditionData} toc_data - Psychiatric medical history data for Obsessive-Compulsive Disorder (OCD).
 * @property {null|MedicalConditionData} tdah_data - Psychiatric medical history data for Attention-Deficit/Hyperactivity Disorder (ADHD).
 * @property {null|MedicalConditionData} bipolaridad_data - Psychiatric medical history data for bipolar disorder.
 * @property {null|MedicalConditionData} otro_data - Psychiatric medical history data for other conditions not listed separately.
 */

/**
 * @typedef {Object} FamiliarMedicalHistory
 * @property {null|MedicalConditionData} medicalHistory.hypertension - Medical history data for hypertension.
 * @property {null|MedicalConditionData} medicalHistory.diabetesMellitus - Medical history data for diabetes mellitus.
 * @property {null|MedicalConditionData} medicalHistory.hypothyroidism - Medical history data for hypothyroidism.
 * @property {null|MedicalConditionData} medicalHistory.asthma - Medical history data for asthma.
 * @property {null|MedicalConditionData} medicalHistory.convulsions - Medical history data for convulsions.
 * @property {null|MedicalConditionData} medicalHistory.myocardialInfarction - Medical history data for myocardial infarction.
 * @property {null|MedicalConditionData} medicalHistory.cancer - Medical history data for cancer.
 * @property {null|MedicalConditionData} medicalHistory.cardiacDiseases - Medical history data for cardiac diseases.
 * @property {null|MedicalConditionData} medicalHistory.renalDiseases - Medical history data for renal diseases.
 * @property {null|MedicalConditionData} medicalHistory.others - Medical history data for other conditions.
 */

/**
 * @typedef {Object} FamiliarMedicalHistoryAPI
 * @property {number} patientId - The unique identifier of the patient.
 * @property {FamiliarMedicalHistory} medicalHistory - An object containing formatted medical history data.
 */

/**
 * Converts the database records for a patient's medical history from the raw format to a structured API response format.
 * This function checks if each medical condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various medical conditions of a patient.
 * @returns {FamiliarMedicalHistory}  A structured object containing the patientId and a detailed medicalHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */
export function mapToAPIFamilyHistory(dbData) {
	const formatResponse = (data) => {
		if (!data) return { version: 1, data: [] };
		if (typeof data === "string") {
			try {
				return JSON.parse(data);
			} catch (_error) {
				return { version: 1, data: [] };
			}
		}
		return data;
	};

	const medicalHistory = {};

	const keys = Object.keys(dbData);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (key !== "id_paciente") {
			medicalHistory[key.replace("_data", "")] = dbData[key] ? dbData[key] : {};
		}
	}

	return {
		patientId: dbData.id_paciente,
		medicalHistory: {
			hypertension: formatResponse(dbData.hipertension_arterial_data),
			diabetesMellitus: formatResponse(dbData.diabetes_mellitus_data),
			hypothyroidism: formatResponse(dbData.hipotiroidismo_data),
			asthma: formatResponse(dbData.asma_data),
			convulsions: formatResponse(dbData.convulsiones_data),
			myocardialInfarction: formatResponse(dbData.infarto_agudo_miocardio_data),
			cancer: formatResponse(dbData.cancer_data),
			cardiacDiseases: formatResponse(dbData.enfermedades_cardiacas_data),
			renalDiseases: formatResponse(dbData.enfermedades_renales_data),
			others: formatResponse(dbData.otros_data),
		},
	};
}

// NOTE: We should not use "object" normally but this types will have to be changed when doing the JSDoc refactoring...

/**
 * @typedef {Object} PersonalMedicalHistory
 * @property {null|Object} medicalHistory.hypertension - Medical history data for hypertension.
 * @property {null|Object} medicalHistory.diabetesMellitus - Medical history data for diabetes mellitus.
 * @property {null|Object} medicalHistory.hypothyroidism - Medical history data for hypothyroidism.
 * @property {null|Object} medicalHistory.asthma - Medical history data for asthma.
 * @property {null|Object} medicalHistory.convulsions - Medical history data for convulsions.
 * @property {null|Object} medicalHistory.myocardialInfarction - Medical history data for myocardial infarction.
 * @property {null|Object} medicalHistory.cancer - Medical history data for cancer.
 * @property {null|Object} medicalHistory.cardiacDiseases - Medical history data for cardiac diseases.
 * @property {null|Object} medicalHistory.renalDiseases - Medical history data for renal diseases.
 * @property {null|Object} medicalHistory.others - Medical history data for other conditions.
 */

/**
 * @typedef {Object} PersonalMedicalHistoryAPI
 * @property {number} patientId - The unique identifier of the patient.
 * @property {PersonalMedicalHistory} medicalHistory - An object containing formatted medical history data.
 */

/**
 * Converts the database records for a patient's medical history from the raw format to a structured API response format.
 * This function checks if each medical condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various medical conditions of a patient.
 * @returns {PersonalMedicalHistory}  A structured object containing the patientId and a detailed medicalHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */
export function mapToAPIPersonalHistory(dbData) {
	const formatResponse = (data) => {
		if (!data) return { version: 1, data: [] };
		if (typeof data === "string") {
			try {
				return JSON.parse(data);
			} catch (_error) {
				return { version: 1, data: [] };
			}
		}
		return data;
	};

	const medicalHistory = {};

	const keys = Object.keys(dbData);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (key !== "id_paciente") {
			medicalHistory[key.replace("_data", "")] = dbData[key] ? dbData[key] : {};
		}
	}

	return {
		patientId: dbData.id_paciente,
		medicalHistory: {
			hypertension: formatResponse(dbData.hipertension_arterial_data),
			diabetesMellitus: formatResponse(dbData.diabetes_mellitus_data),
			hypothyroidism: formatResponse(dbData.hipotiroidismo_data),
			asthma: formatResponse(dbData.asma_data),
			convulsions: formatResponse(dbData.convulsiones_data),
			myocardialInfarction: formatResponse(dbData.infarto_agudo_miocardio_data),
			cancer: formatResponse(dbData.cancer_data),
			cardiacDiseases: formatResponse(dbData.enfermedades_cardiacas_data),
			renalDiseases: formatResponse(dbData.enfermedades_renales_data),
			others: formatResponse(dbData.otros_data),
		},
	};
}

/**
 * Converts the database records for a patient's medical history from the raw format to a structured API response format.
 * This function checks if each medical condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various medical conditions of a patient.
 * @returns {FamiliarMedicalHistory}  A structured object containing the patientId and a detailed medicalHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */

/**
 * @typedef {Object} DBTraumatologicData
 * @property {number} id_paciente - The unique identifier of the patient.
 * @property {null|string|TraumatologicData} antecedente_traumatologico_data - The JSON or object containing detailed trauma data.
 */

/**
 * @typedef {Object} TraumatologicData
 * @property {number} version - The version of the data format.
 * @property {Array.<TraumaDetail>} data - Detailed information about each trauma.
 */

/**
 * @typedef {Object} TraumaDetail
 * @property {string} whichBone - The bone that was affected.
 * @property {string} year - The year when the trauma occurred.
 * @property {string} treatment - The treatment administered.
 */

/**
 * @typedef {Object} TraumatologicMedicalHistory
 * @property {TraumatologicData} traumas - Detailed records of the patient's traumatologic incidents.
 */

/**
 * @typedef {Object} TraumatologicHistory
 * @property {number} patientId - The unique identifier of the patient.
 * @property {TraumatologicMedicalHistory} medicalHistory - Contains the detailed traumatologic history of the patient.
 */

/**
 * @param {DBTraumatologicData} dbData - The database record for traumatologic history.
 * @returns {TraumatologicHistory} Formatted response object with API-friendly field names.
 */
export function mapToAPITraumatologicHistory(dbData) {
	const {
		id_paciente: patientId,
		antecedente_traumatologico_data: traumatologicData,
	} = dbData;

	return {
		patientId: patientId,
		medicalHistory: {
			traumas: traumatologicData,
		},
	};
}

/**
 * @typedef {Object} DBSurgicalHistory
 * @property {number} id_paciente
 * @property {import("./defaultValues.mjs").SurgicalHistory} antecedente_quirurgico_data - The JSON object stored in the DB.
 */

/**
 * Maps database surgical history data to the API format.
 * @param {DBSurgicalHistory} dbData - The surgical history data from the database.
 * @returns {import('./defaultValues.mjs').APISurgicalHistory} The surgical history formatted for the API.
 */
export function mapToAPISurgicalHistory(dbData) {
	const {
		id_paciente: patientId,
		antecedente_quirurgico_data: medicalHistory,
	} = dbData;

	return {
		patientId,
		medicalHistory,
	};
}

/**
 * @typedef {Object} SmokingData
 * @property {number} version - Version number of the smoking data format.
 * @property {Array} data - Detailed data about smoking habits.
 */

/**
 * @typedef {Object} DrinkingData
 * @property {number} version - Version number of the drinking data format.
 * @property {Array} data - Detailed data about alcohol consumption.
 */

/**
 * @typedef {Object} DrugUseData
 * @property {number} version - Version number of the drug use data format.
 * @property {Array} data - Detailed data about drug use.
 */

/**
 * @typedef {Object} NonPathologicalMedicalHistory
 * @property {number} id_paciente - The patient ID.
 * @property {string} tipo_sangre - The blood type of the patient.
 * @property {string} fuma_data - JSON string containing smoking history data.
 * @property {string} bebidas_alcoholicas_data - JSON string containing alcohol consumption data.
 * @property {string} drogas_data - JSON string containing drug use data.
 */

/**
 * @typedef {Object} APIFormattedNonPathologicalHistory
 * @property {number} patientId - The patient ID.
 * @property {Object} medicalHistory - Formatted medical history data.
 * @property {SmokingData} medicalHistory.smoker - Details about smoking habits.
 * @property {DrinkingData} medicalHistory.drink - Details about alcohol consumption.
 * @property {DrugUseData} medicalHistory.drugs - Details about drug use.
 * @property {string} medicalHistory.bloodType - The blood type of the patient.
 */

/**
 * Maps database non-pathological history data to the API format.
 * @param {NonPathologicalMedicalHistory} dbData - The non-pathological history data from the database.
 * @returns {APIFormattedNonPathologicalHistory} The non-pathological history formatted for the API.
 */
export function mapToAPINonPathologicalHistory(dbData) {
	const formatResponse = (data) => {
		if (!data) return { version: 1, data: [] };
		if (typeof data === "string") {
			try {
				return JSON.parse(data);
			} catch (_error) {
				return { version: 1, data: [] };
			}
		}
		return data;
	};

	const nonPathologicalHistory = {};

	const keys = Object.keys(dbData);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		switch (key) {
			case "fuma_data":
				nonPathologicalHistory.smoker = formatResponse(dbData[key]);
				break;
			case "bebidas_alcoholicas_data":
				nonPathologicalHistory.drink = formatResponse(dbData[key]);
				break;
			case "drogas_data":
				nonPathologicalHistory.drugs = formatResponse(dbData[key]);
				break;
			case "tipo_sangre":
				nonPathologicalHistory.bloodType = dbData[key];
				break;
			default:
				break;
		}
	}

	return {
		patientId: dbData.id_paciente,
		medicalHistory: nonPathologicalHistory,
	};
}
/**
 * @typedef {Object} AllergicMedicalHistory
 * @property  {null|MedicalConditionData} medicalHistory.medication - Allergic medical history data for medication.
 * @property  {null|MedicalConditionData} medicalHistory.food - Allergic medical history data for food.
 * @property  {null|MedicalConditionData} medicalHistory.dust - Allergic medical history data for dust.
 * @property  {null|MedicalConditionData} medicalHistory.pollen - Allergic medical history data for pollen.
 * @property  {null|MedicalConditionData} medicalHistory.climateChange - Allergic medical history data for climate change.
 * @property  {null|MedicalConditionData} medicalHistory.animals - Allergic medical history data for animals.
 * @property  {null|MedicalConditionData} medicalHistory.others - Allergic medical history data for other allergies.
 */

/**
 * @typedef {Object} AllergicMedicalHistoryAPI
 * @property {number} patientId - The unique identifier of the patient.
 * @property {AllergicMedicalHistory} medicalHistory - An object containing formatted allergic medical history data.
 */

/**
 * Converts the database records for a patient's allergic medical history from the raw format to a structured API response format.
 * This function checks if each allergic condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various allergic conditions of a patient.
 * @returns {AllergicMedicalHistory} A structured object containing the patientId and a detailed allergicHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */
export function mapToAPIAllergicHistory(dbData) {
	const formatResponse = (data) => {
		if (!data) return { version: 1, data: [] };
		if (typeof data === "string") {
			try {
				return JSON.parse(data);
			} catch (_error) {
				return { version: 1, data: [] };
			}
		}
		return data;
	};

	const medicalHistory = {};
	const keys = Object.keys(dbData);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (key !== "id_paciente") {
			medicalHistory[key.replace("_data", "")] = dbData[key] ? dbData[key] : {};
		}
	}

	return {
		patientId: dbData.id_paciente,
		medicalHistory: {
			medication: formatResponse(dbData.medicamento_data),
			food: formatResponse(dbData.comida_data),
			dust: formatResponse(dbData.polvo_data),
			pollen: formatResponse(dbData.polen_data),
			climateChange: formatResponse(dbData.cambio_de_clima_data),
			animals: formatResponse(dbData.animales_data),
			others: formatResponse(dbData.otros_data),
		},
	};
}

/**
 * @typedef {Object} GynecologicalHistoryDB
 * @property {number} id_paciente - The unique identifier of the patient.
 * * @property {GynecologicalHistoryEntry} edad_primera_menstruacion_data - Data about the first menstrual period.
 * @property {GynecologicalHistoryEntry} ciclos_regulares_data - Data about the regularity of menstrual cycles.
 * @property {GynecologicalHistoryEntry} menstruacion_dolorosa_data - Data about painful menstruation.
 * @property {GynecologicalHistoryEntry} num_embarazos - Data about pregnancies including detailed breakdown.
 * @property {GynecologicalHistoryEntry} num_partos - Data about pregnancies including detailed breakdown.
 * @property {GynecologicalHistoryEntry} num_cesareas - Data about pregnancies including detailed breakdown.
 * @property {GynecologicalHistoryEntry} num_abortos - Data about pregnancies including detailed breakdown.
 * @property {GynecologicalIllnessEntry} medicacion_quistes_ovaricos_data - Data about ovarian cysts.
 * @property {GynecologicalIllnessEntry} medicacion_miomatosis_data - Data about uterine myomatosis.
 * @property {GynecologicalIllnessEntry} medicacion_endometriosis_data - Data about endometriosis.
 * @property {GynecologicalIllnessEntry} medicacion_otra_condicion_data - Data about other diagnosed conditions.
 * @property {GynecologicalSurgeryEntry[]} cirugia_quistes_ovaricos_data - Data about surgeries for ovarian cysts.
 * @property {GynecologicalSurgeryEntry} cirugia_histerectomia_data - Data about hysterectomy surgeries.
 * @property {GynecologicalSurgeryEntry} cirugia_esterilizacion_data - Data about sterilization surgeries.
 * @property {GynecologicalSurgeryEntry[]} cirugia_reseccion_masas_data - An array of data about breast mass resection surgeries.
 */

/**
 * @typedef {Object} GynecologicalHistoryEntry
 * @property {number} version - The version of the data format.
 * @property {Object} data - Detailed data about the gynecological condition or treatment.
 */

/**
 * @typedef {Object} PregnancyData
 * @property {number} totalPregnancies - Total number of pregnancies.
 * @property {number} vaginalDeliveries - Number of vaginal deliveries.
 * @property {number} cesareanSections - Number of cesarean sections.
 * @property {number} abortions - Number of abortions.
 */

/**
 * @typedef {Object} GynecologicalSurgeryEntry
 * @property {number} year - The year the surgery took place.
 * @property {boolean} complications - Indicates whether there were complications.
 */

/**
 * @typedef {Object} GynecologicalIllnessMedication
 * @property {number} medication - The year the surgery took place.
 * @property {boolean} dosage - Indicates whether there were complications.
 * @property {boolean} frequency - Indicates whether there were complications.

 */

/**
 * @typedef {Object} GynecologicalIllnessEntry
 * @property {GynecologicalIllnessMedication} medication - The year the surgery took place.
 */

/**
 * @typedef {Object} GynecologicalMedicalHistory
 * @property {GynecologicalHistoryEntry} medicalHistory.firstMenstrualPeriod - Data about the first menstrual period.
 * @property {GynecologicalHistoryEntry} medicalHistory.regularCycles - Data about the regularity of menstrual cycles.
 * @property {GynecologicalHistoryEntry} medicalHistory.painfulMenstruation - Data about painful menstruation.
 * @property {GynecologicalHistoryEntry} medicalHistory.pregnancies - Data about pregnancies including detailed breakdown.
 * @property {GynecologicalHistoryEntry} medicalHistory.diagnosedIllnesses - Data about diagnosed gynecological illnesses.
 * @property {GynecologicalIllnessEntry} medicalHistory.diagnosedIllnesses.ovarianCysts - Data about ovarian cysts.
 * @property {GynecologicalIllnessEntry} medicalHistory.diagnosedIllnesses.uterineMyomatosis - Data about uterine myomatosis.
 * @property {GynecologicalIllnessEntry} medicalHistory.diagnosedIllnesses.endometriosis - Data about endometriosis.
 * @property {GynecologicalIllnessEntry} medicalHistory.diagnosedIllnesses.otherCondition - Data about other diagnosed conditions.
 * @property {GynecologicalHistoryEntry} medicalHistory.hasSurgeries - Data about surgeries related to gynecological issues.
 * @property {GynecologicalSurgeryEntry[]} medicalHistory.hasSurgeries.ovarianCystsSurgery - Data about surgeries for ovarian cysts.
 * @property {GynecologicalSurgeryEntry} medicalHistory.hasSurgeries.hysterectomy - Data about hysterectomy surgeries.
 * @property {GynecologicalSurgeryEntry} medicalHistory.hasSurgeries.sterilizationSurgery - Data about sterilization surgeries.
 * @property {GynecologicalSurgeryEntry[]} medicalHistory.hasSurgeries.breastMassResection - An array of data about breast mass resection surgeries.
 */

/**
 * @typedef {Object} APIGynecologicalHistory
 * @property {number} patientId - The ID of the patient.
 * @property {GynecologicalMedicalHistory} medicalHistory - The medical history structured data.
 */

/**
 * Maps database gynecological history data to the API format.
 * @param {GynecologicalHistoryDB} dbData - The raw database data.
 * @returns {APIGynecologicalHistory} The formatted gynecological history for API response.
 */

export function mapToAPIGynecologicalHistory(dbData) {
	return {
		patientId: dbData.id_paciente,
		medicalHistory: {
			firstMenstrualPeriod: dbData.edad_primera_menstruacion_data,
			regularCycles: dbData.ciclos_regulares_data,
			painfulMenstruation: dbData.menstruacion_dolorosa_data,
			pregnancies: {
				version: 1,
				data: {
					totalPregnancies: dbData.num_embarazos,
					vaginalDeliveries: dbData.num_partos,
					cesareanSections: dbData.num_cesareas,
					abortions: dbData.num_abortos,
				},
			},
			diagnosedIllnesses: {
				version: 1,
				data: {
					ovarianCysts: dbData.medicacion_quistes_ovaricos_data,
					uterineMyomatosis: dbData.medicacion_miomatosis_data,
					endometriosis: dbData.medicacion_endometriosis_data,
					otherCondition: dbData.medicacion_otra_condicion_data,
				},
			},
			hasSurgeries: {
				version: 1,
				data: {
					ovarianCystsSurgery: dbData.cirugia_quistes_ovaricos_data,
					hysterectomy: dbData.cirugia_histerectomia_data,
					sterilizationSurgery: dbData.cirugia_esterilizacion_data,
					breastMassResection: dbData.cirugia_reseccion_masas_data,
				},
			},
		},
	};
}

/**
 * @typedef {Object} PsychiatricMedicalHistory
 * @property {null|MedicalConditionData} medicalHistory.depression - Psychiatric medical history data for depression.
 * @property {null|MedicalConditionData} medicalHistory.anxiety - Psychiatric medical history data for anxiety.
 * @property {null|MedicalConditionData} medicalHistory.ocd - Psychiatric medical history data for OCD (Obsessive-Compulsive Disorder).
 * @property {null|MedicalConditionData} medicalHistory.adhd - Psychiatric medical history data for ADHD (Attention-Deficit/Hyperactivity Disorder).
 * @property {null|MedicalConditionData} medicalHistory.bipolar - Psychiatric medical history data for bipolar disorder.
 * @property {null|MedicalConditionData} medicalHistory.other - Psychiatric medical history data for other conditions.
 */

/**
 * @typedef {Object} PsychiatricMedicalHistoryAPI
 * @property {number} patientId - The unique identifier of the patient.
 * @property {PsychiatricMedicalHistory} medicalHistory - An object containing formatted psychiatric medical history data.
 */

/**
 * Converts the database records for a patient's psychiatric medical history from the raw format to a structured API response format.
 * This function checks if each psychiatric condition data exists; if not, it returns a default structure with an empty array.
 * It handles the transformation of nested data where applicable.
 *
 * @param {DBData} dbData - The raw database data containing fields for various psychiatric conditions of a patient.
 * @returns {PsychiatricMedicalHistory} A structured object containing the patientId and a detailed psychiatricHistory,
 *                   where each condition is formatted according to the MedicalConditionData specification.
 */
export function mapToAPIPsychiatricHistory(dbData) {
	const formatResponse = (data) => {
		if (!data) return { version: 1, data: [] };
		if (typeof data === "string") {
			try {
				return JSON.parse(data);
			} catch (_error) {
				return { version: 1, data: [] };
			}
		}
		return data;
	};

	const medicalHistory = {};
	const keys = Object.keys(dbData);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		if (key !== "id_paciente") {
			// Asegúrate de que el campo no sea undefined antes de intentar reemplazar
			if (key) {
				medicalHistory[key.replace("_data", "")] = dbData[key]
					? formatResponse(dbData[key])
					: {};
			}
		}
	}

	return {
		patientId: dbData.id_paciente,
		medicalHistory: {
			depression: formatResponse(dbData.depresion_data),
			anxiety: formatResponse(dbData.ansiedad_data),
			ocd: formatResponse(dbData.toc_data),
			adhd: formatResponse(dbData.tdah_data),
			bipolar: formatResponse(dbData.bipolaridad_data),
			other: formatResponse(dbData.otro_data),
		},
	};
}

/**
 * Function to compare the DB data to the request data.
 * @param {*[]} dbData
 * @returns {boolean} True if the request data edits/deletes dbData.
 */
export function requestDataEditsDBData(requestData, dbData) {
	let deletesData = false;
	dbData.some((dbElem, i) => {
		const requestElem = requestData[i];

		Object.keys(dbElem).some((key) => {
			if (Object.hasOwn(requestElem, key)) {
				if (					
					dbElem[key] !== requestElem[key] &&
					dbElem[key].localeCompare("") !== 0
				) {
					deletesData = true;
					return deletesData;
				}
			}
		});

		return deletesData;
	});
	return deletesData;
}

/**
 * Checks if the requestArray contains all elements from the savedArray. It may or may not contain extra elements.
 *
 * The properties inside each array element will be compared using the `comparator` function.
 * This means if you have to arrays `d` and `e` the `comparator` function will be used like so:
 * ```
 * comparator(d[i][someProperty], e[i][someProperty])
 * ```
 *
 * By default the comparator function is implemented like so:
 * ```
 * (a,b) => a===b
 * ```
 * @param {*[]} requestArray - The array coming from the request.
 * @param {*[]} savedArray - The array saved in the DB.
 * @param {import("pino").Logger} logger - The logger for the request.
 * @param {(savedValue: *, requestValue: *) => boolean} [comparator=(a,b)=>a===b] - The array saved in the DB.
 * @returns {boolean} True if the requestArray contains at minimum the same elements as the savedArray, false otherwise.
 */
export function requestIsSubset(
	savedArray,
	requestArray,
	logger,
	comparator = (a, b) => a === b,
) {
	// We shallow copy because we modify the search area every time we find a match
	const reqArray = [...requestArray];
	return savedArray.every((savedValue) => {
		const properties = Object.keys(savedValue);

		for (let i = 0; i < reqArray.length; i++) {
			const requestValue = reqArray[i];
			logger.info({ requestValue, savedValue }, "Comparing values...");
			if (
				properties.every((prop) =>
					comparator(requestValue[prop], savedValue[prop]),
				)
			) {
				reqArray.splice(i, 1);
				return true;
			}
		}

		logger.error(
			{ savedValue, requestArray },
			"savedValue not found in requestArray!",
		);
		return false;
	});
}

/**
 * @typedef {Object} MedicalRecord
 * @property {string|null} medication - Name of the medication.
 * @property {string|null} dosage - Dose of the drug.
 * @property {string|null} frequency - Dosage frequency of the drug.
 */

/**
 * Checks for unauthorized changes to medical records.
 * @param {MedicalRecord[]} newData - New medical data provided.
 * @param {MedicalRecord[]} oldData - Existing medical data in the database.
 * @returns {boolean} True if unauthorized changes are detected.
 */
export function checkForUnauthorizedChanges(newData, oldData) {
	if (oldData.length === 0 && newData.length > 0) {
		return false;
	}

	return newData.some((newItem, index) => {
		const oldItem = oldData[index] || {};

		if (!(isEmpty(oldItem) || areFieldsEqual(newItem, oldItem))) {
			return true;
		}

		return false;
	});
}

/**
 * Checks if the student is trying to update fields that are already filled.
 * @param {Object} newData - New data from the request.
 * @param {Object} oldData - Existing data from the database.
 * @returns {boolean} True if the new data tries to overwrite non-empty fields.
 */
export function checkForUnauthorizedChangesPathological(newData, oldData) {
	return Object.keys(newData).some((key) => {
		const newInfo = newData[key].data;
		const oldInfo = oldData[key]?.data;
		if (!oldInfo) return false; // If there was no old data, no unauthorized update is possible.

		return Object.keys(newInfo).some((field) => {
			const newValue = newInfo[field];
			const oldValue = oldInfo[field];
			return oldValue && newValue !== oldValue;
		});
	});
}

/**
 * Determines if a medical record is empty.
 * @param {MedicalRecord} item - The medical record to evaluate.
 * @returns {boolean} True if the record is empty.
 */
function isEmpty(item) {
	return (
		!item ||
		(isEmptyValue(item.medication) &&
			isEmptyValue(item.dose) &&
			isEmptyValue(item.frequency))
	);
}

/**
 * Checks if a specific value is empty.
 * @param {string|null|undefined} value - Value to evaluate.
 * @returns {boolean}True if the value is empty.
 */
function isEmptyValue(value) {
	return [null, "", undefined, "-", 0, false].includes(value);
}

/**
 * Compares two medical records to check if they are the same.
 * @param {MedicalRecord} newItem - New medical record.
 * @param {MedicalRecord} oldItem - Existing medical record.
 * @returns {boolean} True if both records are equal.
 */
function areFieldsEqual(newItem, oldItem) {
	return (
		newItem.medication === oldItem.medication &&
		newItem.dose === oldItem.dose &&
		newItem.frequency === oldItem.frequency
	);
}
