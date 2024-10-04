import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
	updatePatientGynecologicalHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/gyneco-history/`;

async function createPatientWithGynecologicalHistory() {
	const patientId = await createTestPatient();

	await updatePatientGynecologicalHistory(patientId, {
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
	});

	return patientId;
}

describe("Get Gynecological History integration tests", () => {
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		patientId = await createPatientWithGynecologicalHistory();
	});

	test("Retrieve existing gynecological history", async () => {
		const response = await axios.get(`${API_URL}${patientId}`, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const gynecologicalHistory = response.data;

		expect(
			gynecologicalHistory.medicalHistory.firstMenstrualPeriod.data.age,
		).toBe(13);
		expect(
			gynecologicalHistory.medicalHistory.regularCycles.data.isRegular,
		).toBe(true);
		expect(
			gynecologicalHistory.medicalHistory.painfulMenstruation.data.isPainful,
		).toBe(true);
		expect(
			gynecologicalHistory.medicalHistory.painfulMenstruation.data.medication,
		).toBe("Ibuprofen");
	});

	test("Retrieve default gynecological history for non-existent patient", async () => {
		const nonExistentPatientId = 999999;
		const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const gynecologicalHistory = response.data;
		expect(gynecologicalHistory).toBeDefined();
		expect(gynecologicalHistory.patientId).toBe(nonExistentPatientId);
		expect(
			gynecologicalHistory.medicalHistory.firstMenstrualPeriod,
		).toBeDefined();
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
