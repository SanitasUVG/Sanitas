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
					data: [
						{
							medication: "Medicación 1",
							dose: "Dosis 1",
							frequency: "Frecuencia 1",
							ube: false,
						},
					],
				},
				anxiety: {
					version: 1,
					data: [
						{
							medication: "Medicación 1",
							dose: "Dosis 1",
							frequency: "Frecuencia 1",
							ube: false,
						},
					],
				},
				ocd: {
					version: 1,
					data: [
						{
							medication: "Medicación 1",
							dose: "Dosis 1",
							frequency: "Frecuencia 1",
							ube: false,
						},
					],
				},
				adhd: {
					version: 1,
					data: [
						{
							medication: "Medicación 1",
							dose: "Dosis 1",
							frequency: "Frecuencia 1",
							ube: false,
						},
					],
				},
				bipolar: {
					version: 1,
					data: [
						{
							medication: "Medicación 1",
							dose: "Dosis 1",
							frequency: "Frencuencia 1",
							ube: false,
						},
						{
							medication: "Medicación 1",
							dose: "Dosis 1",
							frequency: "Frecuencia 1",
							ube: false,
						},
					],
				},
				other: {
					version: 1,
					data: [
						{
							illness: "Illness 1",
							medication: "Medicación 1",
							dose: "Dosis 1",
							frequency: "Frecuencia 1",
							ube: false,
						},
					],
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

	test("Verify JSON structure and data types of patient mental health history for GET", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		const expectedResponse = {
			patientId: expect.any(Number),
			medicalHistory: {
				depression: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							medication: expect.any(String),
							dose: expect.any(String),
							frequency: expect.any(String),
							ube: expect.any(Boolean),
						}),
					]),
				},
				anxiety: expect.any(Object),
				ocd: expect.any(Object),
				adhd: expect.any(Object),
				bipolar: expect.any(Object),
				other: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							illness: expect.any(String),
							medication: expect.any(String),
							dose: expect.any(String),
							frequency: expect.any(String),
							ube: expect.any(Boolean),
						}),
					]),
				},
			},
		};

		for (const [key, value] of Object.entries(response.data.medicalHistory)) {
			expect(
				Array.isArray(value.data) &&
					value.data.every((item) => {
						const requiredKeys = ["medication", "dose", "frequency", "ube"];
						if (key === "other") requiredKeys.unshift("illness");
						return (
							Object.keys(item).length === requiredKeys.length &&
							requiredKeys.every((k) => k in item)
						);
					}),
			).toBe(true);
		}

		expect(response.data).toEqual(expectedResponse);
	});
});
