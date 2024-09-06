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

const API_URL = `${LOCAL_API_URL}patient/student-allergic-history`;

function generateValidUpdate(patientId) {
	return {
		patientId,
		medicalHistory: {
			medication: {
				version: 1,
				data: [
					{
						name: "Ibuprofen",
						reaction: "Hives",
						severity: "Moderate",
					},
				],
			},
			food: {
				version: 1,
				data: [
					{
						name: "Shrimp",
						reaction: "Anaphylaxis",
						severity: "Severe",
					},
				],
			},
			dust: {
				version: 1,
				data: [],
			},
			pollen: {
				version: 1,
				data: [],
			},
			climateChange: {
				version: 1,
				data: [],
			},
			animals: {
				version: 1,
				data: [],
			},
			others: {
				version: 1,
				data: [],
			},
		},
	};
}

describe("Update Allergic History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing allergic history", async () => {
		try {
			const allergicHistoryData = generateValidUpdate(patientId);
			const response = await axios.post(API_URL, allergicHistoryData, {
				headers: validHeaders,
			});

			expect(response).toBeDefined();
			expect(response.status).toBe(200);

			const { patientId: id, medicalHistory } = response.data;
			expect(id).toBe(patientId);
			expect(medicalHistory.medication.data.length).toBe(1);
			expect(medicalHistory.food.data[0].name).toBe(
				allergicHistoryData.medicalHistory.food.data[0].name,
			);
		} catch (error) {
			console.error("Test failed with error:", error.message);
			throw error;
		}
	});

	test("Fail to update allergic history with invalid ID", async () => {
		const allergicHistoryData = generateValidUpdate("999999"); // Assuming this ID does not exist
		const response = await axios.post(API_URL, allergicHistoryData, {
			headers: validHeaders,
			validateStatus: () => true, // Ensures axios does not throw an error for non-2xx status
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404); // Check for the correct status code
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail to update allergic history due to missing required fields", async () => {
		const incompleteData = {}; // Missing patientId and medicalHistory

		const response = await axios.post(API_URL, incompleteData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Invalid input: Missing patientId.");
	});

	test("Unauthorized access attempt by a doctor", async () => {
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createDoctorJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're a doctor!",
		});
	});

	test("Access with a malformed JWT", async () => {
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