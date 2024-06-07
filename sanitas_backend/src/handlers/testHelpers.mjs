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
 * @returns {number} The id of the inserted patient.
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
