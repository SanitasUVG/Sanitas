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

const API_URL = `${LOCAL_API_URL}patient/student-personal-history`;

function generateValidUpdate(patientId) {
	return {
		patientId,
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
						surgeryYear: 2012,
					},
					{
						surgeryYear: 2013,
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
	};
}

describe("Update Personal History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	let patientId;

	beforeEach(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing personal history", async () => {
		const personalHistoryData = generateValidUpdate(patientId);
		const response = await axios.post(API_URL, personalHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.hypertension.data.length).toBe(2);
		expect(medicalHistory.hypertension.data[0].medicine).toBe(
			personalHistoryData.medicalHistory.hypertension.data[0].medicine,
		);
	});

	test("Add another medical record", async () => {
		const personalHistoryData = generateValidUpdate(patientId);
		await axios.post(API_URL, personalHistoryData, {
			headers: validHeaders,
		});

		personalHistoryData.medicalHistory.cancer.data.push({
			typeOfCancer: "Bone",
			treatment: "None",
		});
		const response = await axios.post(API_URL, personalHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.hypertension.data.length).toBe(2);
		expect(medicalHistory.cancer.data.length).toBe(2);
		expect(medicalHistory.hypertension.data[0].medicine).toBe(
			personalHistoryData.medicalHistory.hypertension.data[0].medicine,
		);
	});

	test("Fail on modifying existing data", async () => {
		const personalHistoryData = generateValidUpdate(patientId);
		await axios.post(API_URL, personalHistoryData, {
			headers: validHeaders,
		});

		personalHistoryData.medicalHistory.cancer.data = [];
		const response = await axios.post(API_URL, personalHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(403);
		expect(response.data.error).toBe("Not authorized to update data!");
	});

	test("Fail to update personal history with invalid ID", async () => {
		const personalHistoryData = generateValidUpdate("999999"); // Assuming this ID does not exist
		const response = await axios.post(API_URL, personalHistoryData, {
			headers: validHeaders,
			validateStatus: () => true, // Ensures axios does not throw an error for non-2xx status
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404); // Check for the correct status code
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail to update personal history due to missing required fields", async () => {
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
