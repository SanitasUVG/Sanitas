import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientTraumatologicHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/traumatological-history/`;

async function createPatient() {
	const patientId = await createTestPatient();

	await updatePatientTraumatologicHistory(patientId, {
		medicalHistory: {
			traumas: {
				version: 1,
				data: [
					{
						whichBone: "Femur",
						year: "2023",
						treatment: "Surgery",
					},
					{
						whichBone: "Radius",
						year: "2022",
						treatment: "Casting",
					},
				],
			},
		},
	});

	return patientId;
}

describe("Get Traumatologic History integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		patientId = await createPatient();
	});

	test("Retrieve existing traumatologic history", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const traumatologicHistory = response.data;

		expect(traumatologicHistory).toBeDefined();
		expect(traumatologicHistory.patientId).toBe(patientId);
		expect(traumatologicHistory.medicalHistory.traumas.data.length).toBe(2);
		expect(traumatologicHistory.medicalHistory.traumas.data[0].whichBone).toBe(
			"Femur",
		);
	});

	test("Retrieve default traumatologic history for non-existent patient", async () => {
		const nonExistentPatientId = 999999;
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const traumatologicHistory = response.data;

		expect(traumatologicHistory).toBeDefined();
		expect(traumatologicHistory.patientId).toBe(nonExistentPatientId);
		expect(traumatologicHistory.medicalHistory.traumas.data.length).toBe(0);
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

	test("Verify JSON structure and data types of patient trauma history for GET", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		const expectedResponse = {
			patientId: expect.any(Number),
			medicalHistory: {
				traumas: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						{
							whichBone: expect.any(String),
							year: expect.any(String),
							treatment: expect.any(String),
						},
					]),
				},
			},
		};

		expect(
			response.data.medicalHistory.traumas.data.every(
				(item) =>
					Object.keys(item).length === 3 &&
					"whichBone" in item &&
					"year" in item &&
					"treatment" in item,
			),
		).toBe(true);

		expect(response.data).toEqual(expectedResponse);
	});
});
