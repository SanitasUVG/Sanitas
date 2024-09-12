import { beforeEach, describe, expect, test } from "@jest/globals";
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

const API_URL = `${LOCAL_API_URL}/patient/collaborator/`;

/**
 * Creates a valid payload for this endpoint.
 * @param {number} idPatient
 * @param {string} code
 * @returns {import("utils/index.mjs").APICollaborator}
 */
function generateValidPayload(idPatient, code = generateUniqueCUI()) {
	return {
		idPatient,
		code,
		area: "Computación",
	};
}

describe("Collaborator POST endpoint", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	/**@type {number} */
	let patientId;

	beforeEach(async () => {
		patientId = await createTestPatient();
	});

	test("can update collaborator data", async () => {
		const payload = generateValidPayload(patientId);
		const response = await axios.post(API_URL, payload, {
			headers: validHeaders,
		});

		expect(response.status).toBe(200);

		const collaborator = response.data;
		expect(collaborator.idPatient).toBe(patientId);
		expect(collaborator.code).toBe(payload.code);
		expect(collaborator.area).toBe(payload.area);
	});

	test("fails with nonexistent patient id", async () => {
		const payload = generateValidPayload(99999);
		const response = await axios.post(API_URL, payload, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		if (response.status !== 404) {
			console.log(response.data);
		}
		expect(response.status).toBe(404);

		expect(response.data.error).toEqual(
			"Patient not found with the provided ID.",
		);
	});

	test("Can't repeat collaborator code two times", async () => {
		const code = generateUniqueCUI();
		const payload = generateValidPayload(patientId, code);

		await axios.post(API_URL, payload, {
			headers: validHeaders,
		});

		payload.idPatient = await createTestPatient();
		const response = await axios.post(API_URL, payload, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toEqual(400);
		expect(response.data).toEqual({
			error: "Collaborator code already exists!",
		});
	});

	test("a doctor can't call the endpoint", async () => {
		const payload = generateValidPayload(patientId);
		const doctorHeaders = createAuthorizationHeader(createDoctorJWT());

		const response = await axios.post(API_URL, payload, {
			headers: doctorHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const payload = generateValidPayload(1);
		const invalidAuthorization = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, payload, {
			headers: invalidAuthorization,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
