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

const API_URL = `${LOCAL_API_URL}patient/student-surgical-history`;

function generateValidUpdate(patientId) {
	return {
		patientId,
		medicalHistory: {
			surgeries: {
				version: 1,
				data: [
					{
						surgeryType: "Motivo 2",
						surgeryYear: "2015",
						complications: "Complicación 2",
					},
					{
						surgeryType: "Motivo 1",
						surgeryYear: "2007",
						complications: "Complicación 1",
					},
				],
			},
		},
	};
}

describe("Update Surgical History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing surgical history", async () => {
		const surgicalHistoryData = generateValidUpdate(patientId);
		const response = await axios.post(API_URL, surgicalHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		/** @type {import("utils/defaultValues.mjs").APISurgicalHistory} */
		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.surgeries.data.length).toBe(2);
		expect(medicalHistory.surgeries.data[0].surgeryType).toBe(
			surgicalHistoryData.medicalHistory.surgeries.data[0].surgeryType,
		);
	});

	test("Fail to update surgical history with invalid ID", async () => {
		const surgicalHistoryData = {
			patientId: "999999", // Assuming this ID does not exist
			medicalHistory: {
				surgeries: [
					{
						surgeryType: "Gallbladder Removal",
						surgeryYear: "2021",
						complications: "Minor infection",
					},
				],
			},
		};

		const response = await axios.post(API_URL, surgicalHistoryData, {
			headers: validHeaders,
			validateStatus: () => true, // Ensures axios does not throw an error for non-2xx status
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404); // Check for the correct status code
		expect(response.data.error).toBe("Patient not found with the provided ID."); // Updated to match new error message
	});

	test("Fail to update surgical history due to missing required fields", async () => {
		// NOTE: Notice it doesn't have a patientId
		const incompleteData = {
			medicalHistory: {
				surgeries: [
					{
						surgeryType: "Gallbladder Removal",
						surgeryYear: "2021",
						complications: "Minor infection",
					},
				],
			},
		};

		const response = await axios.post(API_URL, incompleteData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe(
			"Invalid input: Missing or empty required fields.",
		);
	});

	test("a patient can't call the endpoint", async () => {
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

	test("can't be called by a malformed JWT", async () => {
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});

	test("Verify JSON structure after updating patient surgery history for PUT", async () => {
		const updateData = generateValidUpdate(patientId);

		const response = await axios.post(API_URL, updateData, {
			headers: validHeaders,
		});

		console.log(response.data);

		expect(response.status).toBe(200);

		expect(
			response.data.medicalHistory.surgeries.data.every(
				(item) =>
					Object.keys(item).length === 3 &&
					"surgeryType" in item &&
					"surgeryYear" in item &&
					"complications" in item,
			),
		).toBe(true);

		expect(response.data).toEqual({
			patientId: expect.any(Number),
			medicalHistory: {
				surgeries: {
					version: expect.any(Number),
					data: expect.arrayContaining([
						expect.objectContaining({
							surgeryType: expect.any(String),
							surgeryYear: expect.any(String),
							complications: expect.any(String),
						}),
					]),
				},
			},
		});
	});
});
