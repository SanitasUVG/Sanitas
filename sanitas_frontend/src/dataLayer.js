// Development
const BASE_URL = 'localhost:3000'
// Production
// const BASE_URL = "localhost:3000"

/**
 * Dummy fetch data function
 */
export function fetchData() {
  return []
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
      { id: 12376, names: 'Flavio Galán' },
      { id: 4323, names: 'Xavier López' },
      { id: 32546, names: 'Madeline Nahomy' },
      { id: 8765, names: 'Bianca Calderón' },
      { id: 90123, names: 'Daniel Dubón' },
    ])
  })
}

/**
 * Searches for user data based on the provided query (CUI).
 * @param {string} query - The CUI of the patient to be searched.
 * @returns {Promise<Object>} A promise that resolves to an object containing the patient's data if found, or an empty object if not found.
 */
export function foundUserData(query) {
  return new Promise((resolve) => {
    const dummyPatients = {
      1234567891011: {
        cui: '1234567891011',
        names: 'Juan',
        surnames: 'Pérez',
        sex: 'Masculino',
        birthDate: '1990-01-01',
      },
      1098765432109: {
        cui: '1098765432109',
        names: 'Ana',
        surnames: 'Lopez',
        sex: 'Femenino',
        birthDate: '1992-02-02',
      },
    }

    if (dummyPatients[query]) {
      resolve(dummyPatients[query])
    } else {
      resolve({})
    }
  })
}
