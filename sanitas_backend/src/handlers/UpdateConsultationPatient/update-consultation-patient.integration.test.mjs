import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/consultation`;

function generateValidUpdate(patientId) {
	return {
		patientId,
		patientConsultation: {
			version: 1,
			data: {
				date: "2023-10-15T14:30:00.000Z",
				evaluator: "doctor1@example.com",
				reason: "Annual Health Check-Up",
				diagnosis: "Good overall health, minor seasonal allergies",
				physicalExam:
					"Heart and lungs clear, no abnormal sounds; normal abdominal examination",
				temperature: 98.6,
				systolicPressure: 120,
				diastolicPressure: 80,
				oxygenSaturation: 98,
				respiratoryRate: "15JASDJK",
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
				notes:
					"Patient is advised to monitor allergy symptoms and consider a follow-up if they worsen.",
			},
		},
	};
}

describe("Update Medical Consultation integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidHeaders = createAuthorizationHeader(createPatientJWT());
	const invalidJWTHeaders = createAuthorizationHeader(createInvalidJWT());

	beforeAll(async () => {
		patientId = await createTestPatient(); // Mock function to create and return a new patient ID
	});

	test("Successfully update medical consultation", async () => {
		const updateData = generateValidUpdate(patientId);
		const response = await axios.put(API_URL, updateData, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);
		expect(response.data).toBeDefined();
		expect(response.data.patientId).toBe(patientId);
		expect(response.data.patientConsultation.data.temperature).toBe(98.6);
	});

	test("Fail to update medical consultation due to unauthorized access", async () => {
		const updateData = generateValidUpdate(patientId);
		const response = await axios.put(API_URL, updateData, {
			headers: invalidHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data.error).toBeDefined();
		expect(response.data.error).toBe("Unauthorized, you're not a doctor!");
	});

	test("Fail to update due to invalid patient ID", async () => {
		const updateData = generateValidUpdate(999999); // Non-existent patient ID
		const response = await axios.put(API_URL, updateData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(404);
		expect(response.data.error).toBeDefined();
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail due to invalid JWT", async () => {
		const updateData = generateValidUpdate(patientId);
		const response = await axios.put(API_URL, updateData, {
			headers: invalidJWTHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data.error).toBeDefined();
		expect(response.data.error).toBe("JWT couldn't be parsed");
	});

	test("Verify JSON structure of medical consultation", async () => {
		const updateData = generateValidUpdate(patientId);
		const response = await axios.put(API_URL, updateData, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		// Define the expected JSON structure with expected types
		const expectedResponse = {
			patientId: expect.any(Number), // Use expect.any(Constructor) for type checking
			patientConsultation: {
				version: expect.any(Number),
				data: {
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
				},
			},
		};

		// Use toEqual to perform a deep equality check
		expect(response.data).toEqual(expectedResponse);
	});
});
