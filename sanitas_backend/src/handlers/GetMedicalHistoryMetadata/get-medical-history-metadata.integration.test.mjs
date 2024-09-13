import { beforeEach, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createTestPatient,
	LOCAL_API_URL,
	updatePatientFamilyHistory,
	updatePatientSurgicalHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}medical-history/metadata`;

describe("Get medical history metadata integration tests", () => {
	let patientId;

	beforeEach(async () => {
		patientId = await createTestPatient();
	});

	test("Empty prefix array on patient with no medical history", async () => {
		const response = await axios.get(`${API_URL}/${patientId}`);

		expect(response.status).toBe(200);
		expect(response.data).toEqual([]);
	});

	test("Fail on nonexisting id", async () => {
		const response = await axios.get(`${API_URL}/3005`, {
			validateStatus: () => true,
		});

		expect(response.status).toEqual(404);
		expect(response.data.error).toEqual("No patient found with the given id!");
	});

	test("Returns prefixes according to medical history", async () => {
		await updatePatientSurgicalHistory(patientId, {
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
		});

		await updatePatientFamilyHistory(patientId, {
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
		});

		const response = await axios.get(`${API_URL}/${patientId}`);
		expect(response.status).toBe(200);

		expect(response.data.length).toEqual(2);
		expect(response.data).toEqual(["af", "aq"]);
	});
});
