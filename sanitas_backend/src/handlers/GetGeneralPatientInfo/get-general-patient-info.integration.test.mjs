import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createTestPatient,
	generateUniqueCUI,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/general/`;

describe("Get patient integration tests", () => {
	let cui;
	let patientId;

	beforeAll(async () => {
		cui = generateUniqueCUI();
		patientId = await createTestPatient(cui);
	});

	test("Get patient that exists", async () => {
		const response = await axios.get(API_URL + patientId);

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const user = response.data;
		expect(user).toBeDefined();
		expect(user.patientId).toBe(patientId);
		expect(user.cui).toBe(cui);
		expect(user.isWoman).toBe(false);
		expect(user.names).toBe("Flabio André");
		expect(user.lastNames).toBe("Galán Dona");
	});

	test("Fail when retrieving patient that doesn't exists", async () => {
		// Para que axios no lance un error en caso de status >= 400
		const response = await axios.get(`${API_URL}999123999`, {
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);

		const { message } = response.data;
		expect(message).toBe(
			"Invalid request: No patient with the given id found.",
		);
	});
});
