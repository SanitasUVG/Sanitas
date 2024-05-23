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
