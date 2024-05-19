// Development
const BASE_URL = "localhost:3000";
// Production
// const BASE_URL = "localhost:3000"

/**
 * Dummy fetch data function
 */
export function fetchData() {
  return [];
}

/**
 * Talks to the API to search for patient given the query and type.
 * @param {string} query - The query value to search.
 * @param {string} type - The type of query, one of "names", "carnet", "codigo"
 * @returns {Promise<import("src/views/SearchPatientView").PatientPreview[]>}
 */
export function searchPatient(query, type) {
  // TODO: Refactor to call the API endpoint when it's completed.

  return new Promise((res) => {
    res([
      { id: 12376, names: "Flavio Galán" },
      { id: 4323, names: "Xavier López" },
      { id: 32546, names: "Madeline Nahomy" },
      { id: 8765, names: "Bianca Calderón" },
      { id: 90123, names: "Daniel Dubón" },
    ]);
  });
}
