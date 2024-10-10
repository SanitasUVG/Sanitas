import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientPsychiatricHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/psychiatric-history/`;

describe("Get Psychiatric Medical History integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		patientId = await createTestPatient();
		await updatePatientPsychiatricHistory(patientId, {
			medicalHistory: {
				depression: {
					version: 1,
					data: {
						medication: "MEDICINE 1",
						dose: "1gm",
						frecuency: "1 by day",
						ube: false,
					},
				},
				anxiety: {
					version: 1,
					data: {
						medication: "MEDICINE 2",
						dose: "2gmr",
						frecuency: "2 by day",
						ube: true,
					},
				},
				ocd: {
					version: 1,
					data: {},
				},
				adhd: {
					version: 1,
					data: {},
				},
				bipolar: {
					version: 1,
					data: {},
				},
				other: {
					version: 1,
					data: {},
				},
			},
		});
	}, 10000);

	test("Retrieve existing psychiatric history with valid patient ID", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const psychiatricHistory = response.data.medicalHistory;
		expect(psychiatricHistory).toBeDefined();
		expect(psychiatricHistory.depression).toBeDefined();
		expect(psychiatricHistory.anxiety).toBeDefined();
		expect(psychiatricHistory.ocd).toBeDefined();
	}, 10000);

	test("Retrieve default psychiatric history for non-existent patient", async () => {
		const nonExistentPatientId = 999999; // Assuming this ID does not exist
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		/** @type {import("utils/index.mjs").PsychiatricMedicalHistoryAPI} */
		const psychiatricHistory = response.data;

		expect(psychiatricHistory).toBeDefined();
		expect(psychiatricHistory.patientId).toBe(nonExistentPatientId);
	});

	test("Fail to retrieve psychiatric history due to missing patient ID in the request", async () => {
		const invalidId = "invalid123";
		const response = await axios.get(`${API_URL}${invalidId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);

		const { error } = response.data;
		expect(error).toBe("Invalid request: No valid patientId supplied!");
	}, 10000);

	test("Fail because of email without permissions", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: invalidEmailHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe(
			"The email doesn't belong to the patient id!",
		);
	});

	test("Fail because of invalid JWT", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: createAuthorizationHeader(createInvalidJWT()),
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data.error).toBe("JWT couldn't be parsed");
	});
});
