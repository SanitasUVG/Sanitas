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

const API_URL = `${LOCAL_API_URL}patient/student-family-history`;

function generateValidUpdate(patientId) {
	return {
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
}

describe("Update Family Medical History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	let patientId;

	beforeEach(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing family medical history", async () => {
		const familyHistoryData = generateValidUpdate(patientId);
		const response = await axios.post(API_URL, familyHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.hypertension.data.length).toBe(2);
		expect(medicalHistory.hypertension.data).toEqual(
			familyHistoryData.medicalHistory.hypertension.data,
		);
	});

	test("Add another medical record", async () => {
		const familyHistoryData = generateValidUpdate(patientId);
		await axios.post(API_URL, familyHistoryData, {
			headers: validHeaders,
		});

		// Can add cancer
		familyHistoryData.medicalHistory.cancer.data.push({
			who: "Aunt",
			typeOfCancer: "Lung",
		});
		let response = await axios.post(API_URL, familyHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const { medicalHistory: cancerMedicalHistory } = response.data;
		expect(response.data.patientId).toBe(patientId);
		expect(cancerMedicalHistory.cancer.data.length).toBe(2);
		expect(cancerMedicalHistory.cancer.data).toEqual(
			familyHistoryData.medicalHistory.cancer.data,
		);

		// Can add items in any order...
		familyHistoryData.medicalHistory.hypertension.data.unshift("Grandfather");
		response = await axios.post(API_URL, familyHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.hypertension.data.length).toBe(3);
		expect(medicalHistory.hypertension.data).toEqual(
			familyHistoryData.medicalHistory.hypertension.data,
		); 
	}, 10000);

	test("Fail on modifying existing data", async () => {
		const familyHistoryData = generateValidUpdate(patientId);
		await axios.post(API_URL, familyHistoryData, {
			headers: validHeaders,
		});

		familyHistoryData.medicalHistory.cancer.data = [];
		const response = await axios.post(API_URL, familyHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(403);
		expect(response.data.error).toBe("Not authorized to update data!");
	});

	test("Fail to update family medical history with invalid ID", async () => {
		const familyHistoryData = generateValidUpdate("999999"); // Assuming this ID does not exist
		const response = await axios.post(API_URL, familyHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404); // Check for the correct status code
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail to update family medical history due to missing required fields", async () => {
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
