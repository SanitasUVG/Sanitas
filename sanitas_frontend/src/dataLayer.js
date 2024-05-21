import axios from "axios";

// Development
const BASE_URL = "http://localhost:3000";
// Production
// const BASE_URL = "localhost:3000"

/**
 * @template Res - The result value type
 * @template Err - The error value type
 * @typedef {{result: Res}|{error: Err}} Result
 */

/**
 * @callback SearchPatientApiFunction
 * @param {string} query - The query value to search.
 * @param {string} type - The type of query, one of "Nombres", "Carnet", "CodigoColaborador"
 * @returns {Promise<Result<import("./views/SearchPatientView").PatientPreview[], Error>>}
 */

/**
 * Talks to the API to search for patient given the query and type.
 * @type {SearchPatientApiFunction}
 */
export async function searchPatient(query, type) {
  try {
    let response;
    try {
      response = await axios.post(
        BASE_URL + "/search-patien",
        {
          request_search: query,
          search_type: type,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error) {
      throw new Error("API ERROR", { cause: error });
    }

    const result = response.data.map((r) => {
      if (!r.id) {
        throw new Error("Received patient has no `id`!");
      }

      if (!r.nombres) {
        throw new Error("Received patient has no `names`!");
      }

      if (!r.apellidos) {
        throw new Error("Received patient has no `apellidos`!");
      }

      return {
        id: r.id,
        names: `${r.nombres} ${r.apellidos}`,
      };
    });

    return { result };
  } catch (error) {
    return { error };
  }
}

/**
 * @typedef {Object} UserData
 * @property {string} cui - The CUI of the patient.
 * @property {string} names - The names of the patient.
 * @property {string} surnames - The surnames of the patient.
 * @property {string} sex - The sex of the patient.
 * @property {string} birthDate - The birth date of the patient.
 */

/**
 * Searches for user data based on the provided query (CUI).
 * @param {string} query - The CUI of the patient to be searched.
 * @returns {Promise<UserData>} A promise that resolves to an object containing the patient's data if found, or an empty object if not found.
 */
export function foundUserData(query) {
  return new Promise((resolve) => {
    /** @type {Record<string, UserData>} */
    const dummyPatients = {
      1234567891011: {
        cui: "1234567891011",
        names: "Juan",
        surnames: "Pérez",
        sex: "Masculino",
        birthDate: "1990-01-01",
      },
      1098765432109: {
        cui: "1098765432109",
        names: "Ana",
        surnames: "Lopez",
        sex: "Femenino",
        birthDate: "1992-02-02",
      },
    };

    if (dummyPatients[query]) {
      resolve(dummyPatients[query]);
    } else {
      resolve(/** @type {UserData} */ ({}));
    }
  });
}
