import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createInvalidJWT,
	createAuthorizationHeader,
	createDoctorJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/allergic-history`;

describe("Update Allergic Medical History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing allergic medical history", async () => {
		const allergicHistoryData = {
			patientId,
			medicalHistory: {
				medication: {
					version: 1,
					data: [{ name: "Penicillin", severity: "high" }],
				},
				food: {
					version: 1,
					data: [],
				},
				dust: {
					version: 1,
					data: [{ source: "Dust" }],
				},
				pollen: {
					version: 1,
					data: [],
				},
				climateChange: {
					version: 1,
					data: [{ region: "High Altitude" }],
				},
				animals: {
					version: 1,
					data: [{ type: "Cats" }],
				},
				others: {
					version: 1,
					data: [],
				},
			},
		};

		const response = await axios.put(API_URL, allergicHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.patientId).toBe(patientId);
		expect(response.data.medicalHistory.medication).toEqual(
			allergicHistoryData.medicalHistory.medication,
		);
		expect(response.data.medicalHistory.food).toEqual(
			allergicHistoryData.medicalHistory.food,
		);
		expect(response.data.medicalHistory.dust).toEqual(
			allergicHistoryData.medicalHistory.dust,
		);
		expect(response.data.medicalHistory.pollen).toEqual(
			allergicHistoryData.medicalHistory.pollen,
		);
		expect(response.data.medicalHistory.climateChange).toEqual(
			allergicHistoryData.medicalHistory.climateChange,
		);
		expect(response.data.medicalHistory.animals).toEqual(
			allergicHistoryData.medicalHistory.animals,
		);
		expect(response.data.medicalHistory.others).toEqual(
			allergicHistoryData.medicalHistory.others,
		);
	});

	test("Fail to update allergic medical history with invalid ID", async () => {
		const allergicHistoryData = {
			patientId: "9999999",
			medicalHistory: {
				medication: {
					version: 1,
					data: [{ name: "Penicillin", severity: "high" }],
				},
				food: {
					version: 1,
					data: [],
				},
				dust: {
					version: 1,
					data: [{ source: "Dust" }],
				},
				pollen: {
					version: 1,
					data: [],
				},
				climateChange: {
					version: 1,
					data: [{ region: "High Altitude" }],
				},
				animals: {
					version: 1,
					data: [{ type: "Cats" }],
				},
				others: {
					version: 1,
					data: [],
				},
			},
		};

		const response = await axios.put(API_URL, allergicHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe(
			"No allergic history found for the provided ID.",
		);
	});

	test("Fail to update allergic medical history due to missing required fields", async () => {
		// Missing patientId
		const incompleteData = {
			medicalHistory: {
				medication: {
					version: 1,
					data: [{ name: "Penicillin", severity: "high" }],
				},
			},
		};

		const response = await axios.put(API_URL, incompleteData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Invalid input: Missing patientId.");
	});

	test("a patient can't call the endpoint", async () => {
		const allergicHistoryData = {
			patientId,
			medicalHistory: {
				medication: {
					version: 1,
					data: [{ name: "Penicillin", severity: "high" }],
				},
				food: {
					version: 1,
					data: [],
				},
				dust: {
					version: 1,
					data: [{ source: "Dust" }],
				},
				pollen: {
					version: 1,
					data: [],
				},
				climateChange: {
					version: 1,
					data: [{ region: "High Altitude" }],
				},
				animals: {
					version: 1,
					data: [{ type: "Cats" }],
				},
				others: {
					version: 1,
					data: [],
				},
			},
		};

		const patientHeader = createAuthorizationHeader(createPatientJWT());
		const response = await axios.put(API_URL, allergicHistoryData, {
			headers: patientHeader,
			validateStatus: () => true,
		});

		expect(response.status).toEqual(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're not a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const allergicHistoryData = {
			patientId,
			medicalHistory: {
				medication: {
					version: 1,
					data: [{ name: "Penicillin", severity: "high" }],
				},
				food: {
					version: 1,
					data: [],
				},
				dust: {
					version: 1,
					data: [{ source: "Dust" }],
				},
				pollen: {
					version: 1,
					data: [],
				},
				climateChange: {
					version: 1,
					data: [{ region: "High Altitude" }],
				},
				animals: {
					version: 1,
					data: [{ type: "Cats" }],
				},
				others: {
					version: 1,
					data: [],
				},
			},
		};

		const invalidHeader = createAuthorizationHeader(createInvalidJWT());
		const response = await axios.put(API_URL, allergicHistoryData, {
			headers: invalidHeader,
			validateStatus: () => true,
		});

		expect(response.status).toEqual(400);
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

		const response = await axios.put(API_URL, updateData, {
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
