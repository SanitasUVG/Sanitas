import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientSurgicalHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/surgical-history/`;

async function createPatient() {
	// Create a test patient first
	const patientId = await createTestPatient();

	// Now update their surgical history
	await updatePatientSurgicalHistory(patientId, {
		medicalHistory: {
			surgeries: {
				version: 1,
				data: [
					{
						surgeryType: "Motivo 2",
						surgeryYear: "2015",
						complications: "Complicación 2",
					},
					{
						surgeryType: "Motivo 1",
						surgeryYear: "2007",
						complications: "Complicación 1",
					},
				],
			},
		},
	});

	return patientId;
}

describe("Get Surgical History integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		patientId = await createPatient(true);
	});

	test("Retrieve existing surgical history", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		/** @type {import("utils/defaultValues.mjs").APISurgicalHistory} */
		const surgicalHistory = response.data;

		expect(surgicalHistory).toBeDefined();
		expect(surgicalHistory.patientId).toBe(patientId);
		expect(surgicalHistory.medicalHistory.surgeries.data.length).toBe(2);
		expect(surgicalHistory.medicalHistory.surgeries.data[0].surgeryType).toBe(
			"Motivo 2",
		);
	});

	test("Retrieve default surgical history for non-existent patient", async () => {
		const nonExistentPatientId = 999999; // Assuming this ID does not exist
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		/** @type {import("utils/defaultValues.mjs").APISurgicalHistory} */
		const surgicalHistory = response.data;

		expect(surgicalHistory).toBeDefined();
		expect(surgicalHistory.patientId).toBe(nonExistentPatientId);
		expect(surgicalHistory.medicalHistory.surgeries.data.length).toBe(0);
	});

	test("Invalid ID provided", async () => {
		const invalidId = "abckdj";
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

	test("Verify JSON structure and data types of patient surgery history for GET", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		const expectedResponse = {
			patientId: expect.any(Number),
			medicalHistory: {
				surgeries: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							surgeryType: expect.any(String),
							surgeryYear: expect.any(String),
							complications: expect.any(String),
						}),
					]),
				},
			},
		};

		expect(response.data).toEqual(expectedResponse);
	});
});
