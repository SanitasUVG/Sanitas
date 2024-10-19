import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientMedicalConsultation,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/consultation/`;

describe("Get Medical Consultation integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		patientId = await createTestPatient();
		await updatePatientMedicalConsultation(patientId, {
			patientConsultation: {
				version: 1,
				data: {
					date: "2023-01-01T00:00:00Z",
					evaluator: "doctor1@example.com",
					reason: "Routine Checkup",
					diagnosis: "Healthy",
					physicalExam: "Normal",
					temperature: 98.6,
					systolicPressure: 120,
					diastolicPressure: 80,
					oxygenSaturation: 98,
					respiratoryRate: "15 bpm",
					heartRate: 70,
					glucometry: 90,
					medications: [
						{
							diagnosis: "Seasonal allergies",
							medication: "Cetirizine",
							quantity: "10 mg daily",
						},
						{
							diagnosis: "Vitamin deficiency",
							medication: "Vitamin D",
							quantity: "2000 IU daily",
						},
					],
					notes: "No immediate concerns.",
				},
			},
		});
	}, 10000);

	test("Retrieve existing medical consultation with valid patient ID", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const medicalConsultation = response.data;
		expect(medicalConsultation).toBeDefined();
		expect(
			medicalConsultation.consultations[0].patientConsultation,
		).toBeDefined();
	}, 10000);

	test("Retrieve default medical consultation for non-existent patient", async () => {
		const nonExistentPatientId = 999999; // Assuming this ID does not exist
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const medicalConsultation = response.data;
		expect(
			medicalConsultation.consultations[0].patientConsultation.data.reason,
		).toBe("");
	});

	test("Fail to retrieve medical consultation due to missing patient ID in the request", async () => {
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
		expect(response.status).toBe(401);
		expect(response.data.error).toBe("Unauthorized, you're not a doctor!");
	});

	test("Fail because of invalid JWT", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: createAuthorizationHeader("invalid.jwt.token"),
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data.error).toBe("JWT couldn't be parsed");
	});

	test("Verify JSON structure and data types of medical consultation", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		// Define the expected JSON structure with expected types
		const expectedResponse = {
			patientId: expect.any(Number), // Use expect.any(Constructor) for type checking
			consultations: expect.arrayContaining([
				// Use expect.arrayContaining to check for an array of objects
				expect.objectContaining({
					patientConsultation: expect.objectContaining({
						data: expect.objectContaining({
							date: expect.any(String),
							evaluator: expect.any(String),
							reason: expect.any(String),
							diagnosis: expect.any(String),
							physicalExam: expect.any(String),
							temperature: expect.any(Number),
							systolicPressure: expect.any(Number),
							diastolicPressure: expect.any(Number),
							oxygenSaturation: expect.any(Number),
							respiratoryRate: expect.any(String),
							heartRate: expect.any(Number),
							glucometry: expect.any(Number),
							medications: expect.arrayContaining([
								expect.objectContaining({
									diagnosis: expect.any(String),
									medication: expect.any(String),
									quantity: expect.any(String),
								}),
							]),
							notes: expect.any(String),
						}),
					}),
				}),
			]),
		};

		// Use toEqual to perform a deep equality check
		expect(response.data).toEqual(expectedResponse);
	});
});
