import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientPersonalHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/personal-history/`;

describe("Get Personal Medical History integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		patientId = await createTestPatient();
		await updatePatientPersonalHistory(patientId, {
			medicalHistory: {
				hypertension: {
					version: 1,
					data: ["Father", "Mother"],
				},
				diabetesMellitus: {
					version: 1,
					data: ["Mother", "Brother"],
				},
				hypothyroidism: {
					version: 1,
					data: ["Grandmother"],
				},
				asthma: {
					version: 1,
					data: [],
				},
				convulsions: {
					version: 1,
					data: ["Uncle"],
				},
				myocardialInfarction: {
					version: 1,
					data: [],
				},
				cancer: {
					version: 1,
					data: [
						{
							who: "Mother",
							typeOfCancer: "Breast",
						},
					],
				},
				cardiacDiseases: {
					version: 1,
					data: [
						{
							who: "Father",
							typeOfDisease: "Hypertrophy",
						},
					],
				},
				renalDiseases: {
					version: 1,
					data: [
						{
							who: "Grandfather",
							typeOfDisease: "Renal Failure",
						},
					],
				},
				others: {
					version: 1,
					data: [
						{
							who: "Brother",
							disease: "Psoriasis",
						},
					],
				},
			},
		});
	});

	test("Retrieve existing personal medical history", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const familyHistory = response.data.medicalHistory;
		expect(familyHistory).toBeDefined();
		expect(familyHistory.hypertension).toBeDefined();
	});

	test("Retrieve default family medical history for non-existent patient", async () => {
		const nonExistentPatientId = 999999; // Assuming this ID does not exist
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		/** @type {import("utils/index.mjs").FamiliarMedicalHistoryAPI} */
		const familiarHistory = response.data;

		expect(familiarHistory).toBeDefined();
		expect(familiarHistory.patientId).toBe(nonExistentPatientId);
		expect(familiarHistory.medicalHistory.hypertension.data.length).toBe(0);
		expect(familiarHistory.medicalHistory.diabetesMellitus.data.length).toBe(0);
		expect(familiarHistory.medicalHistory.hypothyroidism.data.length).toBe(0);
		expect(familiarHistory.medicalHistory.asthma.data.length).toBe(0);
		expect(familiarHistory.medicalHistory.convulsions.data.length).toBe(0);
		expect(
			familiarHistory.medicalHistory.myocardialInfarction.data.length,
		).toBe(0);
		expect(familiarHistory.medicalHistory.cancer.data.length).toBe(0);
		expect(familiarHistory.medicalHistory.cardiacDiseases.data.length).toBe(0);
		expect(familiarHistory.medicalHistory.renalDiseases.data.length).toBe(0);
		expect(familiarHistory.medicalHistory.others.data.length).toBe(0);
	});

	test("Invalid ID provided", async () => {
		const invalidId = "invalid123";
		const response = await axios.get(`${API_URL}${invalidId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);

		const { error } = response.data;
		expect(error).toBe("Invalid request: No valid patientId supplied!");
	});

	test("Fail because of email without permissions", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: invalidEmailHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe(
			"The email doesn't belong to the patient id!",
		);
	});

	test("Fail because of invalid JWT", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: createAuthorizationHeader(createInvalidJWT()),
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data.error).toBe("JWT couldn't be parsed");
	});
});
