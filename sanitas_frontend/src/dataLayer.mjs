import axios from "axios";

// Development
// const BASE_URL = "http://localhost:3000";
// Production
// const BASE_URL = "https://jenr1d4tlh.execute-api.us-east-2.amazonaws.com/Prod/"
const BASE_URL = process.env.BACKEND_URL;

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
        BASE_URL + "/search-patient",
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
 * Asynchronously checks if a CUI (Unique Identity Code) exists in the system by making a GET request to the server.
 *
 * @param {string} cui - The CUI to be checked.
 * @returns {Promise<Object>} A promise that resolves to an object containing a boolean `exists` indicating if the CUI is found, and the `cui` itself.
 * @throws {Error} Throws an error if the request fails or if the server response is not OK.
 */
export const checkCui = async (cui) => {
  try {
    const response = await fetch(`http://localhost:3000/check-cui/${cui}`);
    if (!response.ok) {
      throw new Error("Failed to fetch data");
    }
    const data = await response.json();
    return { exists: data.exists, cui: cui };
  } catch (error) {
    throw new Error("Error fetching CUI:", error);
  }
};

/**
 * Submits patient data to the server using a POST request. This function is used to either register new patient data or update existing data.
 *
 * @param {Object} patientData - The patient data to be submitted, which includes fields like CUI, names, surnames, gender, and birth date.
 * @param {string} patientData.cui - The unique identifier for the patient.
 * @param {string} patientData.names - The first and middle names of the patient.
 * @param {string} patientData.surnames - The last names of the patient.
 * @param {string} patientData.sex - The sex of the patient, expected to be 'F' for female or 'M' for male based on a boolean condition.
 * @param {string} patientData.birthDate - The birth date of the patient.
 * @returns {Promise<Object>} A promise that resolves to the response data from the server.
 * @throws {Error} Throws an error if the server responds with an error status or if any other error occurs during the request.
 */
export const submitPatientData = async (patientData) => {
  const response = await fetch("http://localhost:3000/ficha", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      CUI: patientData.cui,
      NOMBRES: patientData.names,
      APELLIDOS: patientData.surnames,
      SEXO: patientData.sex ? "F" : "M",
      FECHA_NACIMIENTO: patientData.birthDate,
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Error registering information");
  }
  return data;
};
