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
 * @param {string} [nombres="Flabio André"] - The names of the patient.
 * @param {string}  [apellidos="Galán Dona"] - The last names of the patient.
 * @param {boolean} [esMujer=false] - Whether or not the patient is a woman.
 * @param {boolean} [fechaNacimiento="1987-07-07"] - The birthdate of the patient.
 * @returns {number} The id of the inserted patient.
 */
export async function createTestPatient(
  cui = generateUniqueCUI(),
  nombres = "Flabio André",
  apellidos = "Galán Dona",
  esMujer = false,
  fechaNacimiento = "1987-07-07",
) {
  const patientData = {
    cui,
    nombres,
    apellidos,
    esMujer,
    fechaNacimiento,
  };
  const response = await axios.post(`${LOCAL_API_URL}/patient`, patientData);

  expect(response).toBeDefined();
  expect(response.status).toBe(200);

  return response.data;
}
