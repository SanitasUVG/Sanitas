import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientNonPathologicalHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/nonpatological-history/`;

async function createPatientWithNonPathologicalHistory() {
	const patientId = await createTestPatient();

	await updatePatientNonPathologicalHistory(patientId, {
		medicalHistory: {
			bloodType: "A-",
			smoker: {
				version: 1,
				data: {
					smokes: true,
					cigarettesPerDay: 1,
					years: 1,
				},
			},
			drink: {
				version: 1,
				data: {
					drinks: true,
					drinksPerMonth: 2,
				},
			},
			drugs: {
				version: 1,
				data: {
					usesDrugs: true,
					drugType: "Droga 1",
					frequency: "2 veces a la semana",
				},
			},
		},
	});

	return patientId;
}

describe("Get Non-Pathological History integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		patientId = await createPatientWithNonPathologicalHistory();
	});

	test("Retrieve existing non-pathological history", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const nonPathologicalHistory = response.data;

		expect(nonPathologicalHistory).toBeDefined();
		expect(nonPathologicalHistory.patientId).toBe(patientId);
		expect(nonPathologicalHistory.medicalHistory.bloodType).toBe("A-");
		expect(nonPathologicalHistory.medicalHistory.smoker.data.smokes).toBe(true);
	});

	test("Retrieve default non-pathological history for non-existent patient", async () => {
		const nonExistentPatientId = 999999;
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const nonPathologicalHistory = response.data;

		expect(nonPathologicalHistory).toBeDefined();
		expect(nonPathologicalHistory.patientId).toBe(nonExistentPatientId);
		expect(nonPathologicalHistory.medicalHistory.bloodType).toBeDefined(); // Assuming defaults are set in your genDefaultNonPathologicalHistory
	});

	test("Invalid ID provided", async () => {
		const invalidId = "invalid123";
		const response = await axios.get(`${API_URL}${invalidId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);

		const { error } = response.data;
		expect(error).toBe("Invalid request: No valid patientId supplied!");
	});

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

	test("Verify JSON structure and data types of patient lifestyle medical history for GET", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		const expectedResponse = {
			patientId: expect.any(Number),
			medicalHistory: {
				bloodType: expect.any(String),
				smoker: {
					version: expect.any(Number),
					data: {
						smokes: expect.any(Boolean),
						cigarettesPerDay: expect.any(Number),
						years: expect.any(Number),
					},
				},
				drink: {
					version: expect.any(Number),
					data: {
						drinks: expect.any(Boolean),
						drinksPerMonth: expect.any(Number),
					},
				},
				drugs: {
					version: expect.any(Number),
					data: {
						usesDrugs: expect.any(Boolean),
						drugType: expect.any(String),
						frequency: expect.any(String),
					},
				},
			},
		};

		expect(response.data).toEqual(expectedResponse);
	});
});
