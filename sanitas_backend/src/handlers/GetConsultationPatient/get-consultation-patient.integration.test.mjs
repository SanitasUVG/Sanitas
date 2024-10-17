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
		expect(medicalConsultation.patientConsultation).toBeDefined();
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
		expect(medicalConsultation.patientConsultation.data.reason).toBe("");
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
		expect(response.status).toBe(403);
		expect(response.data.error).toBe(
			"Access denied: user is not authorized to view this information.",
		);
	});

	test("Fail because of invalid JWT", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: createAuthorizationHeader("invalid.jwt.token"),
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data.error).toBe("JWT couldn't be parsed");
	});

	test("Verify JSON structure of medical consultation", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);
		const responseData = response.data;

		// Check top-level structure
		expect(typeof responseData).toBe("object");
		expect(responseData).toHaveProperty("patientId");
		expect(responseData).toHaveProperty("patientConsultation");

		// Check patientConsultation structure
		const { patientConsultation } = responseData;
		expect(typeof patientConsultation).toBe("object");
		expect(patientConsultation).toHaveProperty("version");
		expect(typeof patientConsultation.version).toBe("number");
		expect(patientConsultation).toHaveProperty("data");

		// Check data structure
		const { data } = patientConsultation;
		expect(typeof data).toBe("object");
		const expectedFields = [
			"date",
			"evaluator",
			"reason",
			"diagnosis",
			"physicalExam",
			"temperature",
			"systolicPressure",
			"diastolicPressure",
			"oxygenSaturation",
			"respiratoryRate",
			"heartRate",
			"glucometry",
			"medications",
			"notes",
		];
		for (let i = 0; i < expectedFields.length; i++) {
			expect(data).toHaveProperty(expectedFields[i]);
		}

		// Verify medications is an array with correct structure
		expect(Array.isArray(data.medications)).toBe(true);
		expect(data.medications.length).toBeGreaterThanOrEqual(1);
		for (let i = 0; i < data.medications.length; i++) {
			const medication = data.medications[i];
			expect(typeof medication).toBe("object");
			expect(medication).toHaveProperty("diagnosis");
			expect(medication).toHaveProperty("medication");
			expect(medication).toHaveProperty("quantity");
			expect(typeof medication.diagnosis).toBe("string");
			expect(typeof medication.medication).toBe("string");
			expect(typeof medication.quantity).toBe("string");
		}
	});
});
