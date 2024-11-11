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
					data: [
						{
							medicine: "Medicina random 1",
							dose: "5ml",
							frequency: "3 veces al día",
						},
						{
							medicine: "Medicina random 2",
							dose: "10ml",
							frequency: "Una vez al día",
						},
					],
				},
				diabetesMellitus: {
					version: 1,
					data: [
						{
							medicine: "Medicina random 4",
							dose: "2 pastillas",
							frequency: "Cada 8 horas",
						},
					],
				},
				hypothyroidism: {
					version: 1,
					data: [
						{
							medicine: "Medicina random 4",
							dose: "2 pastillas",
							frequency: "Cada 8 horas",
						},
					],
				},
				asthma: {
					version: 1,
					data: [
						{
							medicine: "Medicina random 4",
							dose: "2 pastillas",
							frequency: "Cada 8 horas",
						},
					],
				},
				convulsions: {
					version: 1,
					data: [
						{
							medicine: "Medicina random 4",
							dose: "2 pastillas",
							frequency: "Cada 8 horas",
						},
					],
				},
				myocardialInfarction: {
					version: 1,
					data: [
						{
							surgeryYear: "1993",
						},
					],
				},
				cancer: {
					version: 1,
					data: [
						{
							typeOfCancer: "Breast",
							treatment: "Operation",
						},
					],
				},
				cardiacDiseases: {
					version: 1,
					data: [
						{
							typeOfDisease: "Hypertrophy",
							medicine: "Medicina random 5",
							dose: "5ml",
							frequency: "1 vez al día",
						},
						{
							typeOfDisease: "Hypertrophy 2",
							medicine: "Medicina random 5",
							dose: "5ml",
							frequency: "1 vez al día",
						},
					],
				},
				renalDiseases: {
					version: 1,
					data: [
						{
							typeOfDisease: "Hypertrophy 2",
							medicine: "Medicina random 5",
							dose: "5ml",
							frequency: "1 vez al día",
						},
						{
							typeOfDisease: "Hypertrophy 2",
							medicine: "Medicina random 5",
							dose: "5ml",
							frequency: "1 vez al día",
						},
					],
				},
				others: {
					version: 1,
					data: [
						{
							typeOfDisease: "Hypertrophy 2",
							medicine: "Medicina random 5",
							dose: "5ml",
							frequency: "1 vez al día",
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

	test("Verify JSON structure and data types of patient comprehensive medical history for GET", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		const expectedResponse = {
			patientId: expect.any(Number),
			medicalHistory: {
				hypertension: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							medicine: expect.any(String),
							dose: expect.any(String),
							frequency: expect.any(String),
						}),
					]),
				},
				diabetesMellitus: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							medicine: expect.any(String),
							dose: expect.any(String),
							frequency: expect.any(String),
						}),
					]),
				},
				hypothyroidism: expect.any(Object),
				asthma: expect.any(Object),
				convulsions: expect.any(Object),
				myocardialInfarction: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							surgeryYear: expect.any(String),
						}),
					]),
				},
				cancer: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							typeOfCancer: expect.any(String),
							treatment: expect.any(String),
						}),
					]),
				},
				cardiacDiseases: expect.any(Object),
				renalDiseases: expect.any(Object),
				others: expect.any(Object),
			},
		};

		expect(response.data).toEqual(expectedResponse);
	});
});
