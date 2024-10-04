import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createPatientJWT,
	createInvalidJWT,
	createTestPatient,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/student-nonpatological-history`;

function generateValidUpdate(patientId) {
	return {
		patientId,
		medicalHistory: {
			bloodType: "A+",
			smoker: {
				currently: true,
				amountPerDay: 10,
			},
			drink: {
				frequently: true,
				type: "Beer",
			},
			drugs: {
				used: false,
			},
		},
	};
}

describe("Update Non-Pathological Medical History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Successfully update non-pathological medical history", async () => {
		const nonPathologicalHistoryData = generateValidUpdate(patientId);
		const response = await axios.post(API_URL, nonPathologicalHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.patientId).toBe(patientId);
		expect(response.data.medicalHistory.bloodType).toBe(
			nonPathologicalHistoryData.medicalHistory.bloodType,
		);
	});

	test("Fail to update non-pathological history with invalid ID", async () => {
		const nonPathologicalHistoryData = generateValidUpdate("9999999"); // Invalid patient ID
		const response = await axios.post(API_URL, nonPathologicalHistoryData, {
			headers: validHeaders,
			validateStatus: () => true, // Ensures axios does not throw an error for non-2xx status
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail to update non-pathological history due to missing required fields", async () => {
		const incompleteData = {
			medicalHistory: {
				bloodType: "A+",
				smoker: {
					currently: true,
					amountPerDay: 10,
				},
			},
		}; // Missing patientId and medicalHistory

		const response = await axios.post(API_URL, incompleteData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe(
			"Invalid input: Missing or empty required fields.",
		);
	});

	test("Endpoint cannot be called with a malformed JWT", async () => {
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
