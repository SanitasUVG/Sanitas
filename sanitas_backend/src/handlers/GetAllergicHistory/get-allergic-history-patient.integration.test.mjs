import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientAllergicHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/allergic-history/`;

describe("Get Allergic Medical History integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		patientId = await createTestPatient();
		await updatePatientAllergicHistory(patientId, {
			medicalHistory: {
				medication: {
					version: 1,
					data: [{ name: "Penicillin", severity: "high" }],
				},
				food: {
					version: 1,
					data: [],
				},
				dust: {
					version: 1,
					data: [{ source: "Dust" }],
				},
				pollen: {
					version: 1,
					data: [],
				},
				climateChange: {
					version: 1,
					data: [{ region: "High Altitude" }],
				},
				animals: {
					version: 1,
					data: [{ type: "Cats" }],
				},
				others: {
					version: 1,
					data: [],
				},
			},
		});
	}, 10000);

	test("Retrieve existing allergic history with valid patient ID", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const allergicHistory = response.data.medicalHistory;
		expect(allergicHistory).toBeDefined();
		expect(allergicHistory.medication).toBeDefined();
	}, 10000);

	test("Retrieve default allergic history for non-existent patient", async () => {
		const nonExistentPatientId = 999999; // Assuming this ID does not exist
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		/** @type {import("utils/index.mjs").AllergicMedicalHistoryAPI} */
		const allergicHistory = response.data;

		expect(allergicHistory).toBeDefined();
		expect(allergicHistory.patientId).toBe(nonExistentPatientId);
		expect(allergicHistory.medicalHistory.medication.data.length).toBe(0);
		expect(allergicHistory.medicalHistory.food.data.length).toBe(0);
		expect(allergicHistory.medicalHistory.dust.data.length).toBe(0);
		expect(allergicHistory.medicalHistory.pollen.data.length).toBe(0);
		expect(allergicHistory.medicalHistory.climateChange.data.length).toBe(0);
		expect(allergicHistory.medicalHistory.animals.data.length).toBe(0);
		expect(allergicHistory.medicalHistory.others.data.length).toBe(0);
	});

	test("Fail to retrieve allergic history due to missing patient ID in the request", async () => {
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

	test("Verify JSON structure and data types of patient medical history", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		const expectedResponse = {
			patientId: expect.any(Number),
			medicalHistory: {
				medication: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							name: expect.any(String),
							severity: expect.any(String),
						}),
					]),
				},
				food: expect.any(Object),
				dust: expect.any(Object),
				pollen: expect.any(Object),
				climateChange: expect.any(Object),
				animals: expect.any(Object),
				others: expect.any(Object),
			},
		};

		expect(response.data).toEqual(expectedResponse);
	});
});
