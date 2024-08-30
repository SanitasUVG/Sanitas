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

const API_URL = `${LOCAL_API_URL}patient/family-history`;

describe("Update Family Medical History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing family medical history", async () => {
		const familyHistoryData = {
			patientId,
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
		};

		const response = await axios.put(API_URL, familyHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.patientId).toBe(patientId);
		expect(response.data.medicalHistory.hypertension).toEqual(
			familyHistoryData.medicalHistory.hypertension,
		);
		expect(response.data.medicalHistory.diabetesMellitus).toEqual(
			familyHistoryData.medicalHistory.diabetesMellitus,
		);
		expect(response.data.medicalHistory.hypothyroidism).toEqual(
			familyHistoryData.medicalHistory.hypothyroidism,
		);
		expect(response.data.medicalHistory.asthma).toEqual(
			familyHistoryData.medicalHistory.asthma,
		);
		expect(response.data.medicalHistory.convulsions).toEqual(
			familyHistoryData.medicalHistory.convulsions,
		);
		expect(response.data.medicalHistory.myocardialInfarction).toEqual(
			familyHistoryData.medicalHistory.myocardialInfarction,
		);
		expect(response.data.medicalHistory.cancer).toEqual(
			familyHistoryData.medicalHistory.cancer,
		);
		expect(response.data.medicalHistory.cardiacDiseases).toEqual(
			familyHistoryData.medicalHistory.cardiacDiseases,
		);
		expect(response.data.medicalHistory.renalDiseases).toEqual(
			familyHistoryData.medicalHistory.renalDiseases,
		);
		expect(response.data.medicalHistory.others).toEqual(
			familyHistoryData.medicalHistory.others,
		);
	});

	test("Fail to update family medical history with invalid ID", async () => {
		const familyHistoryData = {
			patientId: "999999",
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
		};

		const response = await axios.put(API_URL, familyHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe(
			"No family history found for the provided ID.",
		);
	});

	test("Fail to update family medical history due to missing required fields", async () => {
		// Missing patientId
		const incompleteData = {
			medicalHistory: {
				hypertension: {
					version: 1,
					data: ["Father"],
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
		const familyHistoryData = {
			patientId,
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
		};

		const patientHeaders = createAuthorizationHeader(createPatientJWT());
		const response = await axios.put(API_URL, familyHistoryData, {
			headers: patientHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're not a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const familyHistoryData = {
			patientId,
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
		};

		const invalidAuthorization = createAuthorizationHeader(createInvalidJWT());
		const response = await axios.put(API_URL, familyHistoryData, {
			headers: invalidAuthorization,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
