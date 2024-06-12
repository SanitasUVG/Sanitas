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
 * @param {string}  [lastNames="Galán Dona"] - The last names of the patient.
 * @param {boolean} [isWoman=false] - Whether or not the patient is a woman.
 * @param {boolean} [birthdate="1987-07-07"] - The birthdate of the patient.
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
 * @param {string} [career="22386"] - The career of the student.
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
 * @param {Object} surgicalData - The surgical event data to update for the patient.
 * @returns {Promise<void>}
 */
export async function updatePatientSurgicalHistory(patientId, surgicalData) {
  surgicalData.id = patientId;

  const response = await axios.put(`${LOCAL_API_URL}patient/surgical-history`, surgicalData);

  // Validate the response
  expect(response.status).toBe(200);
}
