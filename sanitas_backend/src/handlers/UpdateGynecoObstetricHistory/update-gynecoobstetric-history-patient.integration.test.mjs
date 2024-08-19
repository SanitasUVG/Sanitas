import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/gyneco-history`;

describe("Update Gynecological Medical History integration tests", () => {
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient();
	});

	test("Update existing gynecological history", async () => {
		const gynecologicalHistoryData = {
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

		const response = await axios.put(API_URL, gynecologicalHistoryData);

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
			validateStatus: () => true,
		});

		console.log(response.data.error);

		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail to update gynecological history due to missing required fields", async () => {
		const incompleteData = {};

		const response = await axios.put(API_URL, incompleteData, {
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Invalid input: Missing patientId.");
	});
});
