import { expect } from "@jest/globals";
import jwt from "jwt-simple";
import axios from "axios";

export const LOCAL_API_URL = "http://127.0.0.1:3000/";

/**
 * Creates a JWT.
 * @param {*} data - The payload for the JWT.
 * @returns {string} The created JWT.
 */
export function createJWT(data) {
	return jwt.encode(data, "super-duper-secret-key-:3");
}

/**
 * Creates a valid JWT for the email: doctor@gmail.com
 * @returns {string} The valid JWT.
 */
export const createDoctorJWT = () =>
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRvY3RvckBnbWFpbC5jb20ifQ.VnyYMhqM1w4R2sSiLPY2-jaYyCqDF47EpACto1Ga6EA";

/**
 * Creates an invalid JWT.
 * @returns {string} The invalid JWT.
 */
export const createInvalidJWT = () =>
	"ciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJlbWFpbCI6ImRvY3RvckBnbWFpbC5jb20ifQ.VnyYMhqM1w4R2sSiLPY2-jaYyCqDF47EpACto1Ga6";

/**
 * Creates a valid JWT for the email student@gmail.com.
 * This email should not be in the table `DOCTOR`.
 * @returns {string} The valid JWT.
 */
export const createPatientJWT = () =>
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN0dWRlbnRAZ21haWwuY29tIn0.FbVOS-5cuUnrdvoyyMmroGgorO5t9c1_SFR4RHqSkN8";

/**
 * @returns {string} The randomly generated CUI.
 */
export const generateUniqueCUI = () => {
	// Este listado contiene la cantidad de municipios
	// existentes en cada departamento para poder
	// determinar el código máximo aceptado por cada
	// uno de los departamentos.
	const munisPorDepto = [
		/* 01 - Guatemala tiene:      */ 17 /* municipios. */,
		/* 02 - El Progreso tiene:    */ 8 /* municipios. */,
		/* 03 - Sacatepéquez tiene:   */ 16 /* municipios. */,
		/* 04 - Chimaltenango tiene:  */ 16 /* municipios. */,
		/* 05 - Escuintla tiene:      */ 13 /* municipios. */,
		/* 06 - Santa Rosa tiene:     */ 14 /* municipios. */,
		/* 07 - Sololá tiene:         */ 19 /* municipios. */,
		/* 08 - Totonicapán tiene:    */ 8 /* municipios. */,
		/* 09 - Quetzaltenango tiene: */ 24 /* municipios. */,
		/* 10 - Suchitepéquez tiene:  */ 21 /* municipios. */,
		/* 11 - Retalhuleu tiene:     */ 9 /* municipios. */,
		/* 12 - San Marcos tiene:     */ 30 /* municipios. */,
		/* 13 - Huehuetenango tiene:  */ 32 /* municipios. */,
		/* 14 - Quiché tiene:         */ 21 /* municipios. */,
		/* 15 - Baja Verapaz tiene:   */ 8 /* municipios. */,
		/* 16 - Alta Verapaz tiene:   */ 17 /* municipios. */,
		/* 17 - Petén tiene:          */ 14 /* municipios. */,
		/* 18 - Izabal tiene:         */ 5 /* municipios. */,
		/* 19 - Zacapa tiene:         */ 11 /* municipios. */,
		/* 20 - Chiquimula tiene:     */ 11 /* municipios. */,
		/* 21 - Jalapa tiene:         */ 7 /* municipios. */,
		/* 22 - Jutiapa tiene:        */ 17 /* municipios. */,
	];

	const depto = randomIntBetween(1, 22);
	const muni = munisPorDepto[depto - 1];

	let numbers;
	let verificador;
	do {
		numbers = `${randomIntBetween(10000000, 1000000000)}`.substring(0, 8);
		verificador =
			numbers
				.split("")
				.map((n) => Number.parseInt(n, 10))
				.reduce((p, c, i) => p + c * (i + 2), 0) % 11;
		// Ignore the case when verificador is 10 since:
		// https://github.com/minfingt/validators/issues/5
	} while (verificador === 10);

	const formatter = new Intl.NumberFormat("es-GT", {
		minimumIntegerDigits: 2,
		maximumFractionDigits: 0,
	}).format;
	return `${numbers}${verificador}${formatter(depto)}${formatter(muni)}`;
};

export const randomIntBetween = (minInclusive, maxExclusive) => {
	return Math.floor(
		Math.random() * (maxExclusive - minInclusive) + minInclusive,
	);
};

/**
 * @returns {string} The randomly generated email.
 */
export const generateUniqueEmail = () => {
	const timestamp = Date.now();
	const randomNum = Math.floor(Math.random() * 100000);
	return `${timestamp}${randomNum}@gmail.com`;
};

/*
 * @returns {string} The randomly generated student carnet
 */
export const generateRandomCarnet = () => {
	const timestamp = Date.now();
	const randomNum = Math.floor(Math.random() * 10_000);
	return `${randomNum}${timestamp}`.slice(0, 10);
};

/**
 * Creates an Authorization header for the axios library.
 * @param {string} jwt - The JWT token to use for authorization.
 * @returns { {Authorization: string} }
 */
export const createAuthorizationHeader = (jwt) => {
	return { Authorization: jwt };
};

/**
 * Inserts a test patient into the DB.
 *
 * @param {string} [cui=generateUniqueCUI()] - The CUI of the patient.
 * @param {string} [names="Flabio André"] - The names of the patient.
 * @param {string} [lastNames="Galán Dona"] - The last names of the patient.
 * @param {boolean} [isWoman=false] - Whether or not the patient is a woman.
 * @param {string} [birthdate="1987-07-07"] - The birthdate of the patient.
 * @returns {Promise<number>} The id of the inserted patient.
 */
export async function createTestPatient(
	cui = generateUniqueCUI(),
	names = "Flabio André",
	lastNames = "Galán Dona",
	isWoman = false,
	birthdate = new Date("1987-07-07"),
) {
	const patientData = {
		cui,
		names,
		lastNames,
		isWoman,
		birthdate,
	};
	const response = await axios.post(`${LOCAL_API_URL}/patient`, patientData);

	expect(response).toBeDefined();
	expect(response.status).toBe(200);

	return response.data;
}

/**
 * @typedef {Object} StudentInfo
 * @property {string} carnet
 * @property {string} career
 */

/**
 * Updates the student information of a given patient.
 * @param {number} id - The ID of the patient to update
 * @param {string} [carnet="22386"] - The student carnet.
 * @param {string} [career="Lic. Computación"] - The career of the student.
 * @returns {Promise<StudentInfo>} The updated student info
 */
export async function updateStudentInfo(
	id,
	carnet = "22386",
	career = "Lic. Computación",
) {
	const payload = {
		idPatient: id,
		carnet,
		career,
	};
	const response = await axios.put(`${LOCAL_API_URL}/patient/student`, payload);

	expect(response.status).toBe(200);
	return response.data;
}

/**
 * Updates the surgical history of an existing patient in the database.
 *
 * @param {number} patientId - The ID of the patient.
 * @param {import("utils/defaultValues.mjs").SurgicalHistory} surgicalData - Data of the surgical history.
 * @returns {Promise<void>}
 */
export async function updatePatientSurgicalHistory(patientId, surgicalData) {
	surgicalData.patientId = patientId;

	const response = await axios.put(
		`${LOCAL_API_URL}/patient/surgical-history`,
		surgicalData,
		{
			headers: createAuthorizationHeader(createDoctorJWT()),
		},
	);

	// Validate the response
	expect(response.status).toBe(200);
}

/**
 * @typedef {Object} MedicalHistory
 * @property {number} patientId - The unique identifier of the patient.
 * @property {Object} medicalHistory - An object containing formatted medical history data.
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
 * @property {null|MedicalConditionData} medicalHistory.medication - Allergic history data for medications.
 * @property {null|MedicalConditionData} medicalHistory.food - Allergic history data for food.
 * @property {null|MedicalConditionData} medicalHistory.dust - Allergic history data for dust.
 * @property {null|MedicalConditionData} medicalHistory.pollen - Allergic history data for pollen.
 * @property {null|MedicalConditionData} medicalHistory.climateChange - Allergic history data for weather changes.
 * @property {null|MedicalConditionData} medicalHistory.animals - Allergic history data for animals.
 * @property {null|MedicalConditionData} medicalHistory.others - Allergic history data for other conditions.
 */

/**
 * Updates the family medical history for a specific patient using a PUT request.
 * This helper function is designed to set up test conditions by populating family medical history data.
 *
 * @param {number} patientId - The unique identifier of the patient.
 * @param {MedicalHistory} familyHistoryData - The family medical history data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientFamilyHistory(patientId, familyHistoryData) {
	familyHistoryData.patientId = patientId;

	const response = await axios.put(
		`${LOCAL_API_URL}patient/family-history`,
		familyHistoryData,
		{
			headers: createAuthorizationHeader(createDoctorJWT()),
		},
	);

	expect(response.status).toBe(200);
}
/**
 * Updates the personal medical history for a specific patient using a PUT request.
 * This helper function is designed to set up test conditions by populating family medical history data.
 *
 * @param {number} patientId - The unique identifier of the patient.
 * @param {MedicalHistory} personalHistoryData - The personal medical history data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientPersonalHistory(
	patientId,
	personalHistoryData,
) {
	personalHistoryData.patientId = patientId;

	const response = await axios.put(
		`${LOCAL_API_URL}patient/personal-history`,
		personalHistoryData,
		{ headers: createAuthorizationHeader(createDoctorJWT()) },
	);

	expect(response.status).toBe(200);
}

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
 * @param {number} patientId - The unique identifier of the patient.
 * @param {TraumatologicHistory} traumatologicHistoryData - The traumatologic history data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientTraumatologicHistory(
	patientId,
	traumatologicHistoryData,
) {
	traumatologicHistoryData.patientId = patientId;

	const response = await axios.put(
		`${LOCAL_API_URL}patient/traumatological-history`,
		traumatologicHistoryData,
		{ headers: createAuthorizationHeader(createDoctorJWT()) },
	);
	expect(response.status).toBe(200);
}

/**
 * @typedef {Object} NonPathologicalMedicalHistory
 * @property {string} bloodType - The blood type of the patient.
 * @property {Object} smoker - Smoking history data.
 * @property {Object} drink - Drinking history data.
 * @property {Object} drugs - Drug use history data.
 */

/**
 * @typedef {Object} NonPathologicalHistory
 * @property {number} patientId - The unique identifier of the patient.
 * @property {NonPathologicalMedicalHistory} medicalHistory - Contains detailed non-pathological history of the patient.
 */

/**
 * Updates or creates non-pathological history for a patient.
 * @param {number} patientId - The unique identifier of the patient.
 * @param {NonPathologicalHistory} nonPathologicalHistoryData - The non-pathological history data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientNonPathologicalHistory(
	patientId,
	nonPathologicalHistoryData,
) {
	nonPathologicalHistoryData.patientId = patientId;
	await axios.put(
		`${LOCAL_API_URL}patient/nonpatological-history`,
		nonPathologicalHistoryData,
		{
			headers: createAuthorizationHeader(createDoctorJWT()),
		},
	);
}
/**
 * Updates the allergic medical history for a specific patient using a PUT request.
 * This helper function is designed to set up test conditions by populating allergic medical history data.
 *
 * @param {number} patientId - The unique identifier of the patient.
 * @param {MedicalHistory} allergicHistoryData - The allergic medical history data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientAllergicHistory(
	patientId,
	allergicHistoryData,
) {
	allergicHistoryData.patientId = patientId;

	const response = await axios.put(
		`${LOCAL_API_URL}patient/allergic-history`,
		allergicHistoryData,
		{ headers: createAuthorizationHeader(createDoctorJWT()) },
	);

	expect(response.status).toBe(200);
}

/**
 * @typedef {Object} GynecologicalHistoryData
 * @property {import("../../layers/utils/utils/index.mjs").GynecologicalHistoryEntry} firstMenstrualPeriod - Information about the first menstrual period.
 * @property {import("../../layers/utils/utils/index.mjs").GynecologicalHistoryEntry} regularCycles - Information about the regularity of menstrual cycles.
 * @property {import("../../layers/utils/utils/index.mjs").GynecologicalHistoryEntry} painfulMenstruation - Information about painful menstruation.
 * @property {import("../../layers/utils/utils/index.mjs").GynecologicalHistoryEntry} pregnancies - Information about pregnancies.
 * @property {import("../../layers/utils/utils/index.mjs").GynecologicalHistoryEntry} diagnosedIllnesses - Information about diagnosed illnesses related to gynecology.
 * @property {import("../../layers/utils/utils/index.mjs").GynecologicalHistoryEntry} hasSurgeries - Information about surgeries related to gynecology.
 */

/**
 * @typedef {Object} GynecologicalHistory
 * @property {number} patientId - The unique identifier of the patient.
 * @property {GynecologicalHistoryData} medicalHistory - Detailed gynecological history of the patient.
 */

/**
 * Updates or creates gynecological history for a patient.
 * @param {number} patientId - The unique identifier of the patient.
 * @param {GynecologicalHistory} gynecologicalHistoryData - The gynecological history data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientGynecologicalHistory(
	patientId,
	gynecologicalHistoryData,
) {
	gynecologicalHistoryData.patientId = patientId;
	await axios.put(
		`${LOCAL_API_URL}patient/gyneco-history`,
		gynecologicalHistoryData,
		{
			headers: createAuthorizationHeader(createDoctorJWT()),
		},
	);
}
/**
 * @typedef {Object} PsychiatricMedicalHistory
 * @property {number} patientId - The unique identifier of the patient.
 * @property {Object} medicalHistory - An object containing formatted psychiatric medical history data.
 * @property {null|MedicalConditionData} medicalHistory.depression - Psychiatric medical history data for depression.
 * @property {null|MedicalConditionData} medicalHistory.anxiety - Psychiatric medical history data for anxiety.
 * @property {null|MedicalConditionData} medicalHistory.ocd - Psychiatric medical history data for OCD (Obsessive-Compulsive Disorder).
 * @property {null|MedicalConditionData} medicalHistory.adhd - Psychiatric medical history data for ADHD (Attention-Deficit/Hyperactivity Disorder).
 * @property {null|MedicalConditionData} medicalHistory.bipolar - Psychiatric medical history data for bipolar disorder.
 * @property {null|MedicalConditionData} medicalHistory.other - Psychiatric medical history data for other conditions.
 */

/**
 * Updates the psychiatric medical history for a specific patient using a PUT request.
 * This helper function is designed to set up test conditions by populating psychiatric medical history data.
 *
 * @param {number} patientId - The unique identifier of the patient.
 * @param {PsychiatricMedicalHistory} psychiatricHistoryData - The psychiatric medical history data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientPsychiatricHistory(
	patientId,
	psychiatricHistoryData,
) {
	psychiatricHistoryData.patientId = patientId;

	const response = await axios.put(
		`${LOCAL_API_URL}patient/psychiatric-history`,
		psychiatricHistoryData,
		{ headers: createAuthorizationHeader(createDoctorJWT()) },
	);

	expect(response.status).toBe(200);
}

/**
 * Links an email to a patient.
 * @param {string} accountEmail - The email of the "cognito" account.
 * @param {string} patientCUI - The CUI of the patient.
 * @returns {Promise<*>} The patient Id.
 */
export async function linkToTestAccount(accountEmail, patientCUI) {
	const response = await axios.post(
		`${LOCAL_API_URL}account/link`,
		{ cui: patientCUI },
		{ headers: createAuthorizationHeader(createJWT({ email: accountEmail })) },
	);

	expect(response.status).toBe(200);
	return response.data;
}

/**
 * Updates the medical consultation for a specific patient using a PUT request.
 * This helper function is designed to set up test conditions by populating medical consultation data.
 *
 * @param {number} patientId - The unique identifier of the patient.
 * @param {Object} consultationData - The medical consultation data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientMedicalConsultation(
	patientId,
	consultationData,
) {
	consultationData.patientId = patientId;

	const response = await axios.put(
		`${LOCAL_API_URL}patient/consultation`,
		consultationData,
		{
			headers: createAuthorizationHeader(createDoctorJWT()),
		},
	);

	expect(response.status).toBe(200);
}
