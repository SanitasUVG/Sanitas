import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/student-surgical-history`;

describe("Update Student Surgical History integration tests", () => {
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing student surgical history", async () => {
		const studentSurgicalHistoryData = {
			patientId,
			medicalHistory: {
				surgeries: {
					version: 1,
					data: [
						{
							surgeryType: "Appendectomy",
							surgeryYear: "2023",
							complications: "None",
						},
					],
				},
			},
		};

		const response = await axios.post(API_URL, studentSurgicalHistoryData);

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		/** @type {import("utils/defaultValues.mjs").APISurgicalHistory} */
		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.surgeries.data.length).toBe(1);
		expect(medicalHistory.surgeries.data[0].surgeryType).toBe(
			studentSurgicalHistoryData.medicalHistory.surgeries.data[0].surgeryType,
		);
	});

	test("Fail to update student surgical history with invalid ID", async () => {
		const studentSurgicalHistoryData = {
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

		const response = await axios.post(API_URL, studentSurgicalHistoryData, {
			validateStatus: () => true, // Ensures axios does not throw an error for non-2xx status
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404); // Check for the correct status code
		expect(response.data.error).toBe("Patient not found with the provided ID."); // Updated to match new error message
	});

	test("Fail to update student surgical history due to missing required fields", async () => {
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
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe(
			"Invalid input: Missing or empty required fields.",
		);
	});
});
