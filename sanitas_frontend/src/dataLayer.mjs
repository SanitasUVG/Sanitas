import axios from "axios";
import { getSession, mockGetSession } from "./cognito.mjs";
import { IS_PRODUCTION } from "./constants.mjs";
import { calculateYearsBetween, formatDate } from "./utils/date";

const DEV_URL = "http://localhost:3000";
const _BASE_URL = process.env.BACKEND_URL ?? DEV_URL;
const PROTECTED_URL = process.env.PROTECTED_URL ?? DEV_URL;

/**
 * @template Res - The result value type
 * @template Err - The error value type
 * @typedef {{result: Res}|{error: Err}} Result
 */

/**
 * @callback GetMedicalHistoryMetadataCallback
 * @param {number} patientId
 * @returns {Promise<Result<string[], *>>}
 */

/**
 * @type {GetMedicalHistoryMetadataCallback}
 */
export async function getMedicalHistoryMetadata(patientId) {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}
	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	try {
		const response = await axios.get(
			`${PROTECTED_URL}/medical-history/metadata/${patientId}`,
			{
				headers: {
					Authorization: token,
					"Content-Type": "application/json",
				},
			},
		);

		const { data: result } = response;
		return { result };
	} catch (error) {
		return { error };
	}
}

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
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}
	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	try {
		let response;
		try {
			response = await axios.post(
				`${PROTECTED_URL}/patient/search`,
				{
					requestSearch: query,
					searchType: type,
				},
				{
					headers: {
						Authorization: token,
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

			if (!r.cui) {
				throw new Error("Received patient has no `cui`!");
			}

			if (!r.nombres) {
				throw new Error("Received patient has no `names`!");
			}

			if (!r.apellidos) {
				throw new Error("Received patient has no `apellidos`!");
			}

			if (!r.fecha_nacimiento) {
				throw new Error("Received patient has no `fecha_nacimiento`!");
			}

			return {
				id: r.id,
				cui: r.cui,
				names: `${r.nombres} ${r.apellidos}`,
				age: calculateYearsBetween(r.fecha_nacimiento),
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
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	try {
		const response = await axios.get(`${PROTECTED_URL}/check-cui/${cui}`, {
			headers: { Authorization: token },
		});
		return { exists: response.data.exists, cui: cui };
	} catch (error) {
		throw new Error("Error fetching CUI:", error);
	}
};

/**
 * @callback GetRoleCallback
 * Asynchronously checks if a CUI (Unique Identity Code) exists in the system by making a GET request to the server.
 *
 * @param {string} cui - The CUI to be checked.
 * @returns {Promise<Object>} A promise that resolves to an object containing a boolean `exists` indicating if the CUI is found, and the `cui` itself.
 * @throws {Error} Throws an error if the request fails or if the server response is not OK.
 */

/**
 * @typedef {GetRoleCallback}
 */
export const getRole = async () => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/role/`;
	try {
		const { data: result } = await axios.get(url, {
			headers: { Authorization: token },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * Submits patient data to the server using a POST request.
 *
 * @callback DoctorCreatePatientCallback
 * @param {Object} patientData - The patient data to be submitted, which includes fields like CUI, names, surnames, gender, and birth date.
 * @param {string} patientData.cui - The unique identifier for the patient.
 * @param {string} patientData.names - The first and middle names of the patient.
 * @param {string} patientData.surnames - The last names of the patient.
 * @param {string} patientData.isWoman - The sex of the patient.
 * @param {string} patientData.birthDate - The birth date of the patient.
 * @returns {Promise<Result<number, *>>} A promise that resolves to the response data from the server.
 */

/**
 * @type {DoctorCreatePatientCallback}
 */
export const submitPatientData = async (patientData) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	try {
		const { data: result } = await axios.post(
			`${PROTECTED_URL}/patient`,
			patientData,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			},
		);

		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * Submits patient data to the server using a POST request.
 *
 * @callback PatientCreatePatientCallback
 * @param {Object} patientData - The patient data to be submitted, which includes fields like CUI, names, surnames, gender, and birth date.
 * @param {string} patientData.cui - The unique identifier for the patient.
 * @param {string} patientData.names - The first and middle names of the patient.
 * @param {string} patientData.surnames - The last names of the patient.
 * @param {string} patientData.isWoman - The sex of the patient.
 * @param {string} patientData.birthDate - The birth date of the patient.
 * @param {string} patientData.insurance - The insurance of the patient.
 * @param {string} patientData.phone - The phone number of the patient.
 * @returns {Promise<Result<number, *>>} A promise that resolves to the response data from the server.
 */

/**
 * @type {PatientCreatePatientCallback}
 */
export const patientCreatePatientAPI = async (patientData) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	try {
		const { data: result } = await axios.post(
			`${PROTECTED_URL}/patient/create`,
			patientData,
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: token,
				},
			},
		);

		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * @typedef {Object} APIPatient
 * @property {number} id
 * @property {string} cui
 * @property {boolean} isWoman
 * @property {string|null} email
 * @property {string} names
 * @property {string} lastNames
 *
 * @property {string|null} contactName1
 * @property {string|null} contactKinship1
 * @property {string|null} contactPhone1
 *
 * @property {string|null} contactName2
 * @property {string|null} contactKinship2
 * @property {string|null} contactPhone2
 *
 * @property {string|null} bloodType
 * @property {string|null} address
 * @property {string | undefined} insurance
 * @property {string} birthdate
 * @property {string|null} phone
 */

/**
 * Calls the API to retrieve the general information of a given patient.
 *
 * @callback GetGeneralPatientInformationAPICall
 * @param {number} id - The Id of the patient.
 * @returns {Promise<Result<APIPatient, Error>>}
 */

/**
 * @type {GetGeneralPatientInformationAPICall}
 */

export const getGeneralPatientInformation = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/general/${id}`;
	try {
		const { data: result } = await axios.get(url, {
			headers: { Authorization: token },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * Calls the API to update the general information of a given patient.
 *
 * @callback UpdateGeneralPatientInformationAPICall
 * @param {APIPatient} APIPatient - The data of the patient.
 * @returns {Promise<Result<boolean, Error>>}
 */

/**
 * @type {UpdateGeneralPatientInformationAPICall}
 */
export const updateGeneralPatientInformation = async (APIPatient) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/general`;
	try {
		const { data: result } = await axios.put(url, APIPatient, {
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * Calls the API to update the general information of a given patient.
 * This is the patient equivalent.
 *
 * @callback UpdateGeneralPatientInformationAPICall
 * @param {APIPatient} APIPatient - The data of the patient.
 * @returns {Promise<Result<boolean, Error>>}
 */

/**
 * @type {UpdateGeneralPatientInformationAPICall}
 */
export const patientUpdateGeneralInformation = async (APIPatient) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/general`;
	try {
		const { data: result } = await axios.post(url, APIPatient, {
			headers: {
				"Content-Type": "application/json",
				Authorization: token,
			},
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * @typedef {Object} APIStudentInformation
 * @property {number} idPatient
 * @property {string} career
 * @property {string} carnet
 */

/**
 * 	Callback for retrieving the student information of a patient.
 *
 * @callback GetStudentPatientInformationAPICall
 * @param {number} id - The ID of the patient.
 * @returns {Promise<Result<APIStudentInformation, Error>>}
 */

/**
 * @type {GetStudentPatientInformationAPICall}
 */
export const getStudentPatientInformation = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student/${id}`;
	try {
		const { data: result } = await axios.get(url, {
			headers: { Authorization: token },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * 	Callback for updating the student information of a patient.
 *
 * @callback UpdateStudentPatientInformationAPICall
 * @param {APIStudentInformation} APIStudentInfo
 * @returns {Promise<Result<APIStudentInformation, Error>>}
 */

/**
 * @type {UpdateStudentPatientInformationAPICall}
 */
export const updateStudentPatientInformation = async (APIStudentInfo) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student`;
	try {
		const { data: result } = await axios.put(url, APIStudentInfo, {
			headers: { Authorization: token, "Content-Type": "application/json" },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * 	Callback for updating the student information of a patient.
 * 	The patient equivalent.
 *
 * @callback UpdateStudentPatientInformationAPICall
 * @param {APIStudentInformation} APIStudentInfo
 * @returns {Promise<Result<APIStudentInformation, Error>>}
 */

/**
 * @type {UpdateStudentPatientInformationAPICall}
 */
export const patientUpdateStudentInformation = async (APIStudentInfo) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student`;
	try {
		const { data: result } = await axios.post(url, APIStudentInfo, {
			headers: { Authorization: token, "Content-Type": "application/json" },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * Fetches the traumatological history for a specific patient by their ID.
 * Handles potential errors and formats the response.
 *
 * @param {string} id - The patient's ID.
 * @returns {Promise<Object>} An object containing either the traumatological history data or an error.
 */
export const getTraumatologicalHistory = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/traumatological-history/${id}`;
	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Received unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return {
				error: `Failed to fetch data: ${error.response.status} ${error.response.statusText}`,
			};
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the traumatological history for a specific patient by sending a PUT request to the server.
 * This function constructs a payload from the traumatological events provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Array<Object>} traumatologicalEvents - An array of objects where each object contains details about a traumatological event.
 * @param {number} currentVersion - The current version of the traumatological history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateTraumatologicalHistory = async (
	patientId,
	traumatologicalEvents,
	currentVersion,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/traumatological-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: {
			traumas: {
				version: currentVersion,
				data: traumatologicalEvents.map((event) => ({
					whichBone: event.whichBone,
					year: event.year,
					treatment: event.treatment,
				})),
			},
		},
	};

	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token, "Content-Type": "application/json" },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the studentTraumatological history for a specific patient by sending a PUT request to the server.
 * This function constructs a payload from the studentTraumatological events provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Array<Object>} studentTraumatologicalEvents - An array of objects where each object contains details about a studentTraumatological event.
 * @param {number} currentVersion - The current version of the studentTraumatological history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateStudentTraumatologicalHistory = async (
	patientId,
	traumatologicalEvents,
	currentVersion,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-traumatological-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: {
			traumas: {
				version: currentVersion,
				data: traumatologicalEvents.map((event) => ({
					whichBone: event.whichBone,
					year: event.year,
					treatment: event.treatment,
				})),
			},
		},
	};

	try {
		const response = await axios.post(url, payload, {
			headers: { Authorization: token, "Content-Type": "application/json" },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Fetches the surgical history for a specific patient by their ID.
 * Handles potential errors and formats the response.
 *
 * @param {string} id - The patient's ID.
 * @returns {Promise<Object>} An object containing either the surgical history data or an error.
 */
export const getSurgicalHistory = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/surgical-history/${id}`;
	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Received unexpected status code: ${response.status}` };
		}
		const version = response.data.medicalHistory.surgeries.version;
		return { result: response.data, version };
	} catch (error) {
		if (error.response) {
			return {
				error: `Failed to fetch data: ${error.response.status} ${error.response.statusText}`,
			};
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the surgical history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the surgical events provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Array<Object>} surgicalEvents - An array of objects where each object contains details about a surgical event.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateSurgicalHistory = async (
	patientId,
	surgicalEvents,
	currentVersion,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/surgical-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: {
			surgeries: {
				version: currentVersion,
				data: surgicalEvents.map((event) => ({
					surgeryType: event.surgeryType,
					surgeryYear: event.surgeryYear,
					complications: event.complications,
				})),
			},
		},
	};

	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the surgical history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the surgical events provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Array<Object>} surgicalEvents - An array of objects where each object contains details about a surgical event.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateStudentSurgicalHistory = async (
	patientId,
	surgicalEvents,
	currentVersion,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-surgical-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: {
			surgeries: {
				version: currentVersion,
				data: surgicalEvents.map((event) => ({
					surgeryType: event.surgeryType,
					surgeryYear: event.surgeryYear,
					complications: event.complications,
				})),
			},
		},
	};

	try {
		const response = await axios.post(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Fetches the personal history for a specific patient by their ID.
 * Handles potential errors and formats the response.
 *
 * @param {string} id - The patient's ID.
 * @returns {Promise<Object>} An object containing either the personal history data or an error.
 */
export const getPersonalHistory = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/personal-history/${id}`;

	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status === 200) {
			return { result: response.data };
		}
		return { error: `Received unexpected status code: ${response.status}` };
	} catch (error) {
		if (error.response) {
			return {
				error: `Failed to fetch data: ${error.response.status} ${error.response.statusText}`,
			};
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the personal history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the personal events provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Array<Object>} personalEvents - An array of objects where each object contains details about a personal event.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updatePersonalHistory = async (
	patientId,
	personalHistoryDetails,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/personal-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: personalHistoryDetails,
	};

	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * @typedef {Object} CollaboratorAPIInformation
 * @property {number} patientId
 * @property {string} code
 * @property {string} area
 */

/**
 * 	Callback for retrieving the collaborator information of a patient.
 *
 * @callback GetCollaboratorPatientInformationAPICall
 * @param {number} id - The ID of the patient.
 * @returns {Promise<Result<CollaboratorAPIInformation, Error>>}
 */

/**
 * @type {GetCollaboratorPatientInformationAPICall}
 */
export const getCollaboratorInformation = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/collaborator/${id}`;
	try {
		const { data: result } = await axios.get(url, {
			headers: { Authorization: token },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * 	Callback for updating the student information of a patient.
 *
 * @callback UpdateCollaboratorPatientInformationAPICall
 * @param {APICollaboratorInfo} APICollaboratorInfo
 * @returns {Promise<Result<APICollaboratorInfo, Error>>}
 */

/**
 * @type {UpdateCollaboratorPatientInformationAPICall}
 */
export const updateCollaboratorInformation = async (APICollaboratorInfo) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/collaborator/`;
	try {
		const { data: result } = await axios.put(url, APICollaboratorInfo, {
			headers: { Authorization: token },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * 	Callback for updating the student information of a patient.
 * 	This is the patient equivalent.
 *
 * @callback UpdateCollaboratorPatientInformationAPICall
 * @param {APICollaboratorInfo} APICollaboratorInfo
 * @returns {Promise<Result<APICollaboratorInfo, Error>>}
 */

/**
 * @type {UpdateCollaboratorPatientInformationAPICall}
 */
export const patientUpdateCollaboratorInformation = async (
	APICollaboratorInfo,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/collaborator/`;
	try {
		const { data: result } = await axios.post(url, APICollaboratorInfo, {
			headers: { Authorization: token },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * Fetches the family history for a specific patient by their ID.
 * Handles potential errors and formats the response.
 *
 * @param {string} id - The patient's ID.
 * @returns {Promise<Object>} An object containing either the family history data or an error.
 */
export const getFamilyHistory = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/family-history/${id}`;
	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Received unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return {
				error: `Failed to fetch data: ${error.response.status} ${error.response.statusText}`,
			};
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the family history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the family history details provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Object} familyHistoryDetails - An object containing details about the patient's family history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateFamilyHistory = async (patientId, familyHistoryDetails) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/family-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: familyHistoryDetails,
	};

	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Fetches non-pathological history of a patient by sending a GET request to a specific endpoint.
 *
 * @param {number} patientId - The unique identifier for the patient.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const getNonPathologicalHistory = async (patientId) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/nonpatological-history/${patientId}`;

	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status === 200) {
			return { result: response.data };
		}
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		return { error: error.message };
	}
};

/**
 * Updates the non-pathological history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the non-pathological history details provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Object} nonPathologicalHistoryDetails - An object containing details about the patient's non-pathological history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateNonPathologicalHistory = async (
	patientId,
	nonPathologicalHistoryDetails,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/nonpatological-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: nonPathologicalHistoryDetails,
	};

	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status === 200) {
			return { result: response.data };
		}
		return { error: `Unexpected status code: ${response.status}` };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		return { error: error.message };
	}
};

export const updateStudentNonPathologicalHistory = async (
	patientId,
	nonPathologicalHistoryDetails,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-nonpatological-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: nonPathologicalHistoryDetails,
	};

	try {
		const response = await axios.post(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status === 200) {
			return { result: response.data };
		}
		return { error: `Unexpected status code: ${response.status}` };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		return { error: error.message };
	}
};

/**
 * Fetches the Allergic history for a specific patient by their ID.
 * Handles potential errors and formats the response.
 *
 * @param {string} id - The patient's ID.
 * @returns {Promise<Object>} An object containing either the allergic history data or an error.
 */
export const getAllergicHistory = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/allergic-history/${id}`;
	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Received unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return {
				error: `Failed to fetch data: ${error.response.status} ${error.response.statusText}`,
			};
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the allergic history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the family history details provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Object} allergicHistoryData - An object containing details about the patient's allergic history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateAllergicHistory = async (patientId, allergicHistoryData) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/allergic-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: allergicHistoryData,
	};

	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the allergic history of a patient by sending a POST request to a specific endpoint.
 * This function constructs a payload from the allergic history provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Object} allergicHistory - An object containing details about the patient's allergic history.
 * @param {number} currentVersion - The current version of the allergic history data.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateStudentAllergicHistory = async (
	patientId,
	allergicHistory,
	_currentVersion,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-allergic-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: allergicHistory,
	};

	try {
		const response = await axios.post(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Fetches the student's personal history by their ID.
 * Handles potential errors and formats the response.
 *
 * @param {string} patientId - The student's ID.
 * @param {Array<Object>} personalEvents - An array of objects where each object contains details about a personal event.
 * @returns {Promise<Object>} An object containing either the personal history data or an error.
 */
export const getStudentPersonalHistory = async (_id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-personal-history`;

	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status === 200) {
			return { result: response.data };
		}
		return { error: `Received unexpected status code: ${response.status}` };
	} catch (error) {
		if (error.response) {
			return {
				error: `Failed to fetch data: ${error.response.status} ${error.response.statusText}`,
			};
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the student's personal history by sending a PUT request to a specific endpoint.
 * Handles potential errors and formats the response.
 *
 * @param {string} patientId - The unique identifier for the student.
 * @param {Object} personalHistoryDetails - An object containing the personal history details to update.
 * @returns {Promise<Object>} The response data from the server or an error.
 */
export const updateStudentPersonalHistory = async (
	patientId,
	personalHistoryDetails,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-personal-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: personalHistoryDetails,
	};

	try {
		const response = await axios.post(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the student's family medical history by sending a PUT request to a specific endpoint.
 * Handles potential errors and formats the response.
 *
 * @param {string} patientId - The unique identifier for the student.
 * @param {Object} familyHistoryDetails - An object containing the family medical history details to update.
 * @returns {Promise<Object>} The response data from the server or an error.
 */
export const updateStudentFamilyHistory = async (
	patientId,
	familyHistoryDetails,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-family-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: familyHistoryDetails,
	};

	try {
		const response = await axios.post(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Fetches the Psichiatric history for a specific patient by their ID.
 * Handles potential errors and formats the response.
 *
 * @param {string} id - The patient's ID.
 * @returns {Promise<Object>} An object containing either the allergic history data or an error.
 */
export const getPsichiatricHistory = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/psychiatric-history/${id}`;
	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Received unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return {
				error: `Failed to fetch data: ${error.response.status} ${error.response.statusText}`,
			};
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the psychiatric history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the family history details provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Object} psichiatricHistoryData - An object containing details about the patient's psychiatric history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */

export const updatePsichiatricHistory = async (
	patientId,
	psichiatricHistoryData,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/psychiatric-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: psichiatricHistoryData,
	};

	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Updates the psychiatric history for a student patient by sending a POST request to a specific endpoint.
 * Constructs a payload with the patient ID and psychiatric history data and handles session validation.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Object} psychiatricHistoryData - An object containing details about the patient's psychiatric history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */

export const updateStudentPsychiatricHistory = async (
	patientId,
	psychiatricHistoryData,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);

	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-psychiatric-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: psychiatricHistoryData,
	};

	try {
		const response = await axios.post(url, payload, {
			headers: { Authorization: token },
		});

		if (response.status !== 200) {
			return { error: `Unexpected status code: ${response.status}` };
		}
		return { result: response.data };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		if (error.request) {
			return { error: "No response received" };
		}
		return { error: error.message };
	}
};

/**
 * Retrieves the gynecological history for a specific patient by making a GET request to the server.
 * It handles session validation and constructs the authorization header to perform the request.
 * @callback GetGynecologicalHistoryCallback
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */

/**
 * @type {GetGynecologicalHistoryCallback}
 */
export const getGynecologicalHistory = async (patientId) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/gyneco-history/${patientId}`;

	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status === 200) {
			return { result: response.data };
		}
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		return { error: error.message };
	}
};

/**
 * Updates the gynecological history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the gynecological history details provided and sends it to the server.
 *
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Object} gynecologicalHistoryDetails - An object containing details about the patient's gynecological history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */
export const updateGynecologicalHistory = async (
	patientId,
	gynecologicalHistoryDetails,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/gyneco-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: gynecologicalHistoryDetails,
	};

	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token },
		});
		if (response.status === 200) {
			return { result: response.data };
		}
		return { error: `Unexpected status code: ${response.status}` };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		return { error: error.message };
	}
};

/**
 * Updates the gynecological history of a patient by sending a PUT request to a specific endpoint.
 * This function constructs a payload from the gynecological history details provided and sends it to the server.
 *
 * @callback UpdateStudentGynecologialHistoryCallback
 * @param {string} patientId - The unique identifier for the patient.
 * @param {Object} gynecologicalHistoryDetails - An object containing details about the patient's gynecological history.
 * @returns {Promise<Object>} - The response data from the server as a promise. If an error occurs during the request,
 * it returns the error message or the error response from the server.
 */

/**
 * @type {UpdateStudentGynecologialHistoryCallback}
 */
export const updateStudentGynecologialHistory = async (
	patientId,
	gynecologicalHistoryDetails,
) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/student-gyneco-history`;

	const payload = {
		patientId: patientId,
		medicalHistory: gynecologicalHistoryDetails,
	};

	try {
		const { data: result } = await axios.post(url, payload, {
			headers: { Authorization: token },
		});

		return { result };
	} catch (error) {
		const errorMsg = error.response ? error.response.data : error.message;
		return { error: errorMsg };
	}
};

/**
 * @callback LinkAccountToPatientCallback
 * @param {string} cui
 * @returns {Promise<Result<number, *>>}
 */

/**
 * @type {LinkAccountToPatientCallback}
 */
export const linkAccountToPatient = async (cui) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/account/link`;

	const payload = { cui };

	try {
		const response = await axios.post(url, payload, {
			headers: { Authorization: token },
		});
		return { result: response.data };
	} catch (error) {
		return { error: error.response.data };
	}
};

/**
 * @callback GetLinkedPatientCallback
 * @returns {Promise<Result<number, *>>} If the promise is succesfull the result will contain the patientId associated to this account.
 */

/** @type {GetLinkedPatientCallback}*/
export const getLinkedPatient = async () => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(false);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/account/patient`;

	try {
		const { data: result } = await axios.get(url, {
			headers: { Authorization: token },
		});
		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * @callback ExportDataCallback
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Result<string, *>>} If the promise is successfull the result will contain the CSV contents.
 */

/**@type {ExportDataCallback}  */
export const exportData = async (startDate, endDate) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/consultations/export`;
	const params = {
		startDate: formatDate(startDate),
		endDate: formatDate(endDate),
		nowDate: formatDate(new Date()),
	};

	try {
		const { data: result } = await axios.get(url, {
			headers: { Authorization: token },
			params,
		});

		return { result };
	} catch (error) {
		return { error };
	}
};

/**
 * Fetches the appointment details for a specific patient by sending a GET request to the server.
 * This function retrieves the appointment details using the patient's ID and an authorization token.
 *
 * @callback GetAppointmentCallback
 * @param {string} id - The unique identifier of the patient for whom the appointment details are being fetched.
 * @returns {Promise<Object>} - A promise that resolves to the appointment details if the request is successful,
 * or an error object containing the error message or error response from the server if the request fails.
 */

/**
 * @type {GetAppointmentCallback}
 */
export const getAppointment = async (id) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);
	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/consultation/${id}`;

	try {
		const response = await axios.get(url, {
			headers: { Authorization: token },
		});
		if (response.status === 200) {
			return { result: response.data };
		}
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		return { error: error.message };
	}
};

/**
 * Updates the appointment details of a specific patient by sending a PUT request to the server.
 * This function constructs a payload from the appointment details and sends it to the server for updating.
 *
 * @callback UpdateAppointmentCallback
 * @param {string} id - The unique identifier of the patient whose appointment details are being updated.
 * @param {Object} appointmentDetails - An object containing details about the patient's appointment, including date, diagnosis, medications, etc.
 * @returns {Promise<Object>} - A promise that resolves to the updated appointment data if the request is successful,
 * or an error object containing the error message or error response from the server if the request fails.
 */

/**
 * @type {UpdateAppointmentCallback}
 */
export const updateAppointment = async (id, appointmentDetails) => {
	const sessionResponse = IS_PRODUCTION
		? await getSession()
		: await mockGetSession(true);

	if (sessionResponse.error) {
		return { error: sessionResponse.error };
	}

	if (!sessionResponse.result.isValid()) {
		return { error: "Invalid session!" };
	}

	const token = sessionResponse?.result?.idToken?.jwtToken ?? "no-token";
	const url = `${PROTECTED_URL}/patient/consultation`;

	const payload = {
		patientId: id,
		patientConsultation: appointmentDetails.patientConsultation,
	};

	console.log("Payload", payload);
	try {
		const response = await axios.put(url, payload, {
			headers: { Authorization: token },
		});

		if (response.status === 200) {
			return { result: response.data };
		}

		return { error: `Unexpected status code: ${response.status}` };
	} catch (error) {
		if (error.response) {
			return { error: error.response.data };
		}
		return { error: error.message };
	}
};
