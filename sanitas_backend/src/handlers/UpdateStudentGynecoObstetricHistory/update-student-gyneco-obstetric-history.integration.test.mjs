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

const API_URL = `${LOCAL_API_URL}patient/student-gyneco-history`;

function generateEmptyUpdate(patientId) {
	return {
		patientId,
		medicalHistory: {
			firstMenstrualPeriod: {
				version: 1,
				data: {
					age: 13,
				},
			},
			regularCycles: {
				version: 1,
				data: {
					isRegular: true,
				},
			},
			painfulMenstruation: {
				version: 1,
				data: { isPainful: true, medication: "Ibuprofen" },
			},
			pregnancies: {
				version: 1,
				data: {
					totalPregnancies: 2,
					vaginalDeliveries: 1,
					cesareanSections: 1,
					abortions: 0,
				},
			},
			diagnosedIllnesses: {
				version: 1,
				data: {
					ovarianCysts: {
						medication: {},
					},
					uterineMyomatosis: {
						medication: {},
					},
					endometriosis: {
						medication: {},
					},
					otherCondition: null,
				},
			},
			hasSurgeries: {
				version: 1,
				data: {
					ovarianCystsSurgery: [],
					hysterectomy: {},
					sterilizationSurgery: {},
					breastMassResection: [],
				},
			},
		},
	};
}

function generateValidUpdate(patientId) {
	return {
		patientId,
		medicalHistory: {
			firstMenstrualPeriod: {
				version: 1,
				data: { age: 13 },
			},
			regularCycles: {
				version: 1,
				data: { isRegular: true },
			},
			painfulMenstruation: {
				version: 1,
				data: { isPainful: true, medication: "Ibuprofen" },
			},
			pregnancies: {
				version: 1,
				data: {
					totalPregnancies: 2,
					vaginalDeliveries: 1,
					cesareanSections: 1,
					abortions: 0,
				},
			},
			diagnosedIllnesses: {
				version: 1,
				data: {
					ovarianCysts: {
						medication: {
							medication: "Med B",
							dosage: "250mg",
							frequency: "Twice a day",
						},
					},
					uterineMyomatosis: {
						medication: {
							medication: "Med C",
							dosage: "100mg",
							frequency: "Once a day",
						},
					},
					endometriosis: {
						medication: { medication: "", dosage: "", frequency: "" },
					},
					otherCondition: [
						{
							medication: {
								illness: "illness A",
								medication: "Med D",
								dosage: "500mg",
								frequency: "Once a day",
							},
						},
					],
				},
			},
			hasSurgeries: {
				version: 1,
				data: {
					ovarianCystsSurgery: [{ year: 2018, complications: false }],
					hysterectomy: { year: 2019, complications: true },
					sterilizationSurgery: { year: 2021, complications: false },
					breastMassResection: [{ year: 2020, complications: true }],
				},
			},
		},
	};
}

describe("Update Patient Gynecological Medical History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	let patientId;

	beforeEach(async () => {
		patientId = await createTestPatient();
	});

	test("Update existing gynecological history", async () => {
		const gynecologicalHistoryData = generateValidUpdate(patientId);
		const response = await axios.post(API_URL, gynecologicalHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.patientId).toBe(patientId);
		expect(
			response.data.medicalHistory.painfulMenstruation.data.medication,
		).toBe("Ibuprofen");
	});

	test("Fail to update existing data", async () => {
		const gynecologicalHistoryData = generateValidUpdate(patientId);
		await axios.post(API_URL, gynecologicalHistoryData, {
			headers: validHeaders,
		});

		// Patient can't send a lower number...
		gynecologicalHistoryData.medicalHistory.pregnancies.data.totalPregnancies = 0;
		let response = await axios.post(API_URL, gynecologicalHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(403);
		expect(response.data.error).toBe("Not authorized to modify data!");

		// Patient can't delete data...
		gynecologicalHistoryData.medicalHistory.diagnosedIllnesses.data.otherCondition =
			[];
		response = await axios.post(API_URL, gynecologicalHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(403);
		expect(response.data.error).toBe("Not authorized to modify data!");
	});

	test("Can add a new diagnostic or operation", async () => {
		let gynecologicalHistoryData = generateEmptyUpdate(patientId);
		await axios.post(API_URL, gynecologicalHistoryData, {
			headers: validHeaders,
		});

		gynecologicalHistoryData = generateValidUpdate(patientId);
		const response = await axios.post(API_URL, gynecologicalHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		if (response.status !== 200) {
			console.error(response);
		}

		expect(response.status).toBe(200);
	});

	test("Fail to update gynecological history with invalid ID", async () => {
		const invalidData = generateValidUpdate(9999999);
		const response = await axios.post(API_URL, invalidData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Patient not found with the provided ID");
	});

	test("Fail to update gynecological history due to missing required fields", async () => {
		const incompleteData = {};

		const response = await axios.post(API_URL, incompleteData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Invalid input: Missing patientId.");
	});

	test("a doctor can't call the endpoint", async () => {
		const data = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createDoctorJWT());

		const response = await axios.post(API_URL, data, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const data = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, data, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
