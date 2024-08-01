import { expect } from "@jest/globals";
import axios from "axios";

export const LOCAL_API_URL = "http://localhost:3000/";

/**
 * Backend namespace for JSDoc
 * @namespace backend
 */

/**
 * @memberof Backend
 * @returns {string} The randomly generated CUI.
 */
export const generateUniqueCUI = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `${timestamp}${randomNum}`;
};

/**
 * Inserts a test patient into the DB.
 *
 * @memberof Backend
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
export async function updateStudentInfo(id, carnet = "22386", career = "Lic. Computación") {
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

  const response = await axios.put(`${LOCAL_API_URL}/patient/surgical-history`, surgicalData);

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

  const response = await axios.put(`${LOCAL_API_URL}patient/family-history`, familyHistoryData);

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
export async function updatePatientPersonalHistory(patientId, personalHistoryData) {
  personalHistoryData.patientId = patientId;

  const response = await axios.put(`${LOCAL_API_URL}patient/personal-history`, personalHistoryData);

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
export async function updatePatientTraumatologicHistory(patientId, traumatologicHistoryData) {
  traumatologicHistoryData.patientId = patientId;

  const response = await axios.put(
    `${LOCAL_API_URL}patient/traumatological-history`,
    traumatologicHistoryData,
  );
  expect(response.status).toBe(200);
}
/**
 * Updates the allergic medical history for a specific patient using a PUT request.
 * This helper function is designed to set up test conditions by populating allergic medical history data.
 *
 * @param {number} patientId - The unique identifier of the patient.
 * @param {MedicalHistory} allergicHistoryData - The allergic medical history data to be updated.
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
export async function updatePatientAllergicHistory(patientId, allergicHistoryData) {
  allergicHistoryData.patientId = patientId;

  const response = await axios.put(`${LOCAL_API_URL}patient/allergic-history`, allergicHistoryData);

  expect(response.status).toBe(200);
}
