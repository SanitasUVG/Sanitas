import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createTestPatient,
	LOCAL_API_URL,
	updatePatientPsychiatricHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/psychiatric-history/`;

describe("Get Psychiatric Medical History integration tests", () => {
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient();
		await updatePatientPsychiatricHistory(patientId, {
			medicalHistory: {
				depression: {
					version: 1,
					data: [{ description: "Major depressive disorder" }],
				},
				anxiety: {
					version: 1,
					data: [{ description: "Generalized anxiety disorder" }],
				},
				ocd: {
					version: 1,
					data: [{ description: "Obsessive-compulsive disorder" }],
				},
				adhd: {
					version: 1,
					data: [],
				},
				bipolar: {
					version: 1,
					data: [{ description: "Bipolar disorder type II" }],
				},
				other: {
					version: 1,
					data: [],
				},
			},
		});
	}, 10000);

	test("Retrieve existing psychiatric history with valid patient ID", async () => {
		const response = await axios.get(`${API_URL}${patientId}`);

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const psychiatricHistory = response.data.medicalHistory;
		expect(psychiatricHistory).toBeDefined();
		expect(psychiatricHistory.depression).toBeDefined();
		expect(psychiatricHistory.anxiety).toBeDefined();
		expect(psychiatricHistory.ocd).toBeDefined();
	}, 10000);

	test("Retrieve default psychiatric history for non-existent patient", async () => {
		const nonExistentPatientId = 999999; // Assuming this ID does not exist
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		/** @type {import("utils/index.mjs").PsychiatricMedicalHistoryAPI} */
		const psychiatricHistory = response.data;

		expect(psychiatricHistory).toBeDefined();
		expect(psychiatricHistory.patientId).toBe(nonExistentPatientId);
		expect(psychiatricHistory.medicalHistory.depression.data.length).toBe(0);
		expect(psychiatricHistory.medicalHistory.anxiety.data.length).toBe(0);
		expect(psychiatricHistory.medicalHistory.ocd.data.length).toBe(0);
		expect(psychiatricHistory.medicalHistory.adhd.data.length).toBe(0);
		expect(psychiatricHistory.medicalHistory.bipolar.data.length).toBe(0);
		expect(psychiatricHistory.medicalHistory.other.data.length).toBe(0);
	});

	test("Fail to retrieve psychiatric history due to missing patient ID in the request", async () => {
		const invalidId = "invalid123";
		const response = await axios.get(`${API_URL}${invalidId}`, {
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);

		const { error } = response.data;
		expect(error).toBe("Invalid request: No valid patientId supplied!");
	}, 10000);
});
