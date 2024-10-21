import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientMedicalConsultation,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}consultations/export`;

describe("Get consultations data endpoint tests", () => {
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient();
		updatePatientMedicalConsultation(patientId, {
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
		});
	});

	test("Endpoint returns CSV", async () => {
		const response = await axios.get(API_URL, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		if (response.status !== 200) {
			console.log(response.data);
		}

		expect(response.status).toBe(200);
		expect(response.data).toEqual(expect.any(String));
	});

	test("Can't call endpoint if is not doctor!", async () => {
		const patientHeaders = createAuthorizationHeader(createPatientJWT());
		const response = await axios.get(API_URL, {
			headers: patientHeaders,
			validateStatus: () => true,
		});

		if (response.status !== 403) {
			console.log(response.data);
		}

		expect(response.status).toBe(403);
		expect(response.data.error).toBe("Unauthorized, you're not a doctor!");
	});

	test("Fail because of invalid JWT", async () => {
		const response = await axios.get(API_URL, {
			headers: createAuthorizationHeader(createInvalidJWT()),
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data.error).toBe("JWT couldn't be parsed");
	});
});
