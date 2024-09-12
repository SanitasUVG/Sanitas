import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createPatientJWT,
	createInvalidJWT,
	createTestPatient,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/student-psychiatric-history`;

function generateValidSubmission(patientId) {
	return {
		patientId,
		medicalHistory: {
			depression: {
				data: {
					medication: "Antidepressant",
					dose: "20mg",
					frequency: "Daily",
				},
			},
			anxiety: {
				data: {},
			},
			ocd: {
				data: {},
			},
			adhd: {
				data: {},
			},
			bipolar: {
				data: {},
			},
			other: {
				data: {},
			},
		},
	};
}

describe("Submit Psychiatric History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Submit psychiatric history successfully", async () => {
		const psychiatricHistoryData = generateValidSubmission(patientId);
		const response = await axios.post(API_URL, psychiatricHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.depression.data.medication).toBe(
			psychiatricHistoryData.medicalHistory.depression.data.medication,
		);
	});

	test("Fail to submit psychiatric history with invalid ID", async () => {
		const psychiatricHistoryData = generateValidSubmission("9999999"); // Invalid patient ID
		const response = await axios.post(API_URL, psychiatricHistoryData, {
			headers: validHeaders,
			validateStatus: () => true, // Ensures axios does not throw an error for non-2xx status
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail to submit psychiatric history due to missing required fields", async () => {
		const incompleteData = {
			medicalHistory: {
				depression: {
					data: {
						medication: "Antidepressant",
						dose: "20mg",
						frequency: "Daily",
					},
				},
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

	test("can't be called with a malformed JWT", async () => {
		const postData = generateValidSubmission(patientId);
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
