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

const API_URL = `${LOCAL_API_URL}/patient/psychiatric-history`;

function generateValidUpdate(patientId) {
	return {
		patientId,
		medicalHistory: {
			depression: {
				version: 1,
				data: {
					medication: "MEDICINE 1",
					dose: "1gm",
					frecuency: "1 by day",
					ube: false,
				},
			},
			anxiety: {
				version: 1,
				data: {
					medication: "MEDICINE 2",
					dose: "2gmr",
					frecuency: "2 by day",
					ube: true,
				},
			},
			ocd: {
				version: 1,
				data: {},
			},
			adhd: {
				version: 1,
				data: {},
			},
			bipolar: {
				version: 1,
				data: {},
			},
			other: {
				version: 1,
				data: {},
			},
		},
	};
}

describe("Update Psychiatric Medical History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient(); // Create a patient and get the ID
	});

	test("Update existing psychiatric medical history", async () => {
		const psychiatricHistoryData = generateValidUpdate(patientId);
		const response = await axios.put(API_URL, psychiatricHistoryData, {
			headers: validHeaders,
		});

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
					data: {
						medication: "MEDICINE 1",
						dose: "1gm",
						frecuency: "1 by day",
						ube: false,
					},
				},
				anxiety: {
					version: 1,
					data: {},
				},
				ocd: {
					version: 1,
					data: {},
				},
				adhd: {
					version: 1,
					data: {},
				},
				bipolar: {
					version: 1,
					data: {},
				},
				other: {
					version: 1,
					data: {},
				},
			},
		};

		const response = await axios.put(API_URL, psychiatricHistoryData, {
			headers: validHeaders,
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
					data: {
						medication: "MEDICINE 1",
						dose: "1gm",
						frecuency: "1 by day",
						ube: false,
					},
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
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createPatientJWT());

		const response = await axios.put(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're not a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.put(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
