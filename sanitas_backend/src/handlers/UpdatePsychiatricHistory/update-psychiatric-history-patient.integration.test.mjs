import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}/patient/psychiatric-history`;

describe("Update Psychiatric Medical History integration tests", () => {
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing psychiatric medical history", async () => {
		const psychiatricHistoryData = {
			patientId,
			medicalHistory: {
				depression: {
					version: 1,
					data: [
						{
							description: "Major depressive disorder",
							treatment: "Cognitive behavioral therapy",
							duration: "6 months",
						},
					],
				},
				anxiety: {
					version: 1,
					data: [
						{
							description: "Generalized anxiety disorder",
							treatment: "Medication and relaxation techniques",
							duration: "Ongoing",
						},
					],
				},
				ocd: {
					version: 1,
					data: [],
				},
				adhd: {
					version: 1,
					data: [],
				},
				bipolar: {
					version: 1,
					data: [
						{
							description: "Bipolar disorder type II",
							medication: "Lithium",
							frequency: "Daily",
						},
					],
				},
				other: {
					version: 1,
					data: [],
				},
			},
		};

		const response = await axios.put(API_URL, psychiatricHistoryData);
		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.patientId).toBe(patientId);
		expect(response.data.medicalHistory.depression.version).toBe(1);
	});

	test("Fail to update psychiatric medical history with invalid ID", async () => {
		const psychiatricHistoryData = {
			patientId: "9999999",
			medicalHistory: {
				depression: {
					version: 1,
					data: [
						{
							description: "Major depressive disorder",
							treatment: "Cognitive behavioral therapy",
							duration: "6 months",
						},
					],
				},
				anxiety: {
					version: 1,
					data: [],
				},
				ocd: {
					version: 1,
					data: [],
				},
				adhd: {
					version: 1,
					data: [],
				},
				bipolar: {
					version: 1,
					data: [
						{
							description: "Bipolar disorder type II",
							medication: "Lithium",
							frequency: "Daily",
						},
					],
				},
				other: {
					version: 1,
					data: [],
				},
			},
		};

		const response = await axios.put(API_URL, psychiatricHistoryData, {
			validateStatus: () => true,
		});
		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe(
			"No psychiatric history found for the provided ID.",
		);
	});

	test("Fail to update psychiatric medical history due to missing required fields", async () => {
		const incompleteData = {
			medicalHistory: {
				depression: {
					version: 1,
					data: [
						{
							description: "Major depressive disorder",
							treatment: "Cognitive behavioral therapy",
							duration: "6 months",
						},
					],
				},
			},
		};

		const response = await axios.put(API_URL, incompleteData, {
			validateStatus: () => true,
		});
		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Invalid input: Missing patientId.");
	});
});
