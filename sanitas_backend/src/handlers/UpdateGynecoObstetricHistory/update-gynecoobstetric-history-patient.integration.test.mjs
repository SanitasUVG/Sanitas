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

const API_URL = `${LOCAL_API_URL}patient/gyneco-history`;

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

describe("Update Gynecological Medical History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient();
	});

	test("Update existing gynecological history", async () => {
		const gynecologicalHistoryData = generateValidUpdate(patientId);
		const response = await axios.put(API_URL, gynecologicalHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.patientId).toBe(patientId);
		expect(
			response.data.medicalHistory.painfulMenstruation.data.medication,
		).toBe("Ibuprofen");
	});

	test("Fail to update gynecological history with invalid ID", async () => {
		const invalidData = {
			patientId: "999999",
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

		const response = await axios.put(API_URL, invalidData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail to update gynecological history due to missing required fields", async () => {
		const incompleteData = {};

		const response = await axios.put(API_URL, incompleteData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Invalid input: Missing patientId.");
	});

	test("a patient can't call the endpoint", async () => {
		const data = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createPatientJWT());

		const response = await axios.put(API_URL, data, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're not a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const data = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.put(API_URL, data, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});

	test("Verify JSON structure after updating patient gynecological medical history for PUT", async () => {
		const updateData = {
			patientId: patientId,
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
					data: {
						isPainful: true,
						medication: "Medicamento 1",
					},
				},
				pregnancies: {
					version: 1,
					data: {
						totalPregnancies: 3,
						vaginalDeliveries: 1,
						cesareanSections: 1,
						abortions: 1,
					},
				},
				diagnosedIllnesses: {
					version: 1,
					data: {
						ovarianCysts: {
							medication: {
								medication: "Medicamento 1",
								dosage: "Dosis 1",
								frequency: "Frecuencia 1",
							},
						},
						uterineMyomatosis: {
							medication: {
								medication: "Medicamento 1",
								dosage: "Dosis 1",
								frequency: "Frecuencia 1",
							},
						},
						endometriosis: {
							medication: {
								medication: "Medicamento 1",
								dosage: "Dosis 1",
								frequency: "Frecuencia 1",
							},
						},
						otherCondition: [
							{
								medication: {
									illness: "Otro Diagnóstico 1",
									medication: "Medicament 1",
									dosage: "Dosis 1",
									frequency: "Frecuencia 1",
								},
							},
						],
					},
				},
				hasSurgeries: {
					version: 1,
					data: {
						hysterectomy: {
							year: 1993,
							complications: true,
						},

						sterilizationSurgery: {
							year: 2005,
							complications: true,
						},

						ovarianCystsSurgery: [
							{
								year: 2006,
								complications: true,
							},
							{
								year: 2010,
								complications: true,
							},
							{
								year: 2011,
								complications: true,
							},
						],
						breastMassResection: [
							{
								year: 2007,
								complications: true,
							},
							{
								year: 2008,
								complications: true,
							},
						],
					},
				},
			},
		};

		const response = await axios.put(API_URL, updateData, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		const expectedResponse = {
			patientId: expect.any(Number),
			medicalHistory: {
				firstMenstrualPeriod: {
					version: expect.any(Number),
					data: {
						age: expect.any(Number),
					},
				},
				regularCycles: {
					version: expect.any(Number),
					data: {
						isRegular: expect.any(Boolean),
					},
				},
				painfulMenstruation: {
					version: expect.any(Number),
					data: {
						isPainful: expect.any(Boolean),
						medication: expect.any(String),
					},
				},
				pregnancies: {
					version: expect.any(Number),
					data: {
						totalPregnancies: expect.any(Number),
						vaginalDeliveries: expect.any(Number),
						cesareanSections: expect.any(Number),
						abortions: expect.any(Number),
					},
				},
				diagnosedIllnesses: {
					version: expect.any(Number),
					data: expect.any(Object),
				},
				hasSurgeries: {
					version: expect.any(Number),
					data: {
						hysterectomy: expect.objectContaining({
							year: expect.any(Number),
							complications: expect.any(Boolean),
						}),
						sterilizationSurgery: expect.objectContaining({
							year: expect.any(Number),
							complications: expect.any(Boolean),
						}),
						ovarianCystsSurgery: expect.arrayContaining([
							expect.objectContaining({
								year: expect.any(Number),
								complications: expect.any(Boolean),
							}),
						]),
						breastMassResection: expect.arrayContaining([
							expect.objectContaining({
								year: expect.any(Number),
								complications: expect.any(Boolean),
							}),
						]),
					},
				},
			},
		};

		expect(response.data).toEqual(expectedResponse);
	});
});
