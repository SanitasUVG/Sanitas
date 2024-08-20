import { expect } from "@jest/globals";
import axios from "axios";

export const LOCAL_API_URL = "http://127.0.0.1:3000/";

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
	const timestamp = Date.now();
	const randomNum = Math.floor(Math.random() * 10000);
	return `${timestamp}${randomNum}`;
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
	birthdate = "1987-07-07",
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
		patientId: id,
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
		{ headers: createAuthorizationHeader(createDoctorJWT()) },
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
	);

	expect(response.status).toBe(200);
}
