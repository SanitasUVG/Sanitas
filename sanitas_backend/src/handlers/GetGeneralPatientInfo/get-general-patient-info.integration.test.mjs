import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	generateUniqueCUI,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/general/`;

describe("Get patient integration tests", () => {
	let cui;
	let patientId;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	beforeAll(async () => {
		cui = generateUniqueCUI();
		patientId = await createTestPatient(cui);
	});

	test("Get patient that exists", async () => {
		const response = await axios.get(API_URL + patientId, {
			headers: validHeaders,
		});

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
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);

		expect(response.data.error).toBe(
			"Invalid request: No patient with the given id found.",
		);
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
