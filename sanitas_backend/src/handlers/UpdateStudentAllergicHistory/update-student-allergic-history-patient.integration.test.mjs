import { beforeEach, describe, expect, test } from "@jest/globals";
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
						severity: "Moderate",
					},
				],
			},
			food: {
				version: 1,
				data: [
					{
						name: "Shrimp",
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

	beforeEach(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing allergic history", async () => {
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
	});

	test("Adds new allergic data", async () => {
		const allergicHistoryData = generateValidUpdate(patientId);
		await axios.post(API_URL, allergicHistoryData, {
			headers: validHeaders,
		});

		allergicHistoryData.medicalHistory.medication.data.push({
			name: "Ibuprofen",
			severity: "Moderate",
		});
		const response = await axios.post(API_URL, allergicHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(200);

		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.medication.data.length).toBe(2);
		expect(medicalHistory.food.data[0].name).toBe(
			allergicHistoryData.medicalHistory.food.data[0].name,
		);
	});

	test("Patient can't update alergic history", async () => {
		const allergicHistoryData = generateValidUpdate(patientId);
		await axios.post(API_URL, allergicHistoryData, {
			headers: validHeaders,
		});

		allergicHistoryData.medicalHistory.medication.data = [];
		const response = await axios.post(API_URL, allergicHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(403);
		expect(response.data.error).toBe("Not authorized to update data!");
	});

	test("Fail to update allergic history with invalid ID", async () => {
		const allergicHistoryData = generateValidUpdate("999999"); // Assuming this ID does not exist
		const response = await axios.post(API_URL, allergicHistoryData, {
			headers: validHeaders,
			validateStatus: () => true, // Ensures axios does not throw an error for non-2xx status
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404); // Check for the correct status code
		expect(response.data.error).toBe("No patient with the given ID found!");
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

	test("Verify JSON structure after updating patient medical history", async () => {
		const updateData = {
			patientId: patientId,
			medicalHistory: {
				medication: {
					version: 1,
					data: [
						{
							name: "Medicación 1",
							severity: "Cutánea",
						},
						{
							name: "Medicación 2",
							severity: "Respiratoria",
						},
						{
							name: "Medicación 3",
							severity: "Ambos",
						},
					],
				},
				food: {
					version: 1,
					data: [
						{
							name: "Comida 1",
							severity: "Cutánea",
						},
					],
				},
				dust: {
					version: 1,
					data: [
						{
							name: "Polvo 1",
							severity: "Cutánea",
						},
					],
				},
				pollen: {
					version: 1,
					data: [
						{
							name: "Pollen 1",
							severity: "Respiratoria",
						},
					],
				},
				climateChange: {
					version: 1,
					data: [
						{
							name: "Clima 1",
							severity: "Cutánea",
						},
					],
				},
				animals: {
					version: 1,
					data: [
						{
							name: "Animales 1",
							severity: "Respiratoria",
						},
					],
				},
				others: {
					version: 1,
					data: [
						{
							name: "Otros 1",
							severity: "Ambos",
						},
					],
				},
			},
		};

		const response = await axios.post(API_URL, updateData, {
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
