import { describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}/patient/collaborator/`;

/**
 * Creates a valid payload for this endpoint.
 * @param {number} idPatient
 * @returns {import("utils/index.mjs").APICollaborator}
 */
function generateValidPayload(idPatient) {
	return {
		idPatient,
		code: "C002",
		area: "Computación",
	};
}

describe("Collaborator PUT endpoint", () => {
	test("can update collaborator data", async () => {
		const payload = generateValidPayload(1);
		const headers = createAuthorizationHeader(createDoctorJWT());
		const response = await axios.put(API_URL, payload, { headers });

		expect(response.status).toBe(200);

		const collaborator = response.data;
		expect(collaborator.idPatient).toBe(1);
		expect(collaborator.code).toBe(payload.code);
		expect(collaborator.area).toBe(payload.area);
	});

	test("fails with nonexistent patient id", async () => {
		const payload = generateValidPayload(99999);
		payload.code = "CU004";
		const headers = createAuthorizationHeader(createDoctorJWT());
		const response = await axios.put(API_URL, payload, {
			headers,
			validateStatus: () => true,
		});

		if (response.status !== 404) {
			console.log(response.data);
		}
		expect(response.status).toBe(404);

		const responseBody = response.data;
		expect(responseBody.error).toEqual(
			"Patient not found with the provided ID.",
		);
	});

	test("Can't repeat collaborator code two times", async () => {
		const headers = createAuthorizationHeader(createDoctorJWT());
		const payload = generateValidPayload(1);
		payload.code = "C0876";

		await axios.put(API_URL, payload, {
			headers,
		});

		payload.idPatient = 2;
		const response = await axios.put(API_URL, payload, {
			headers,
			validateStatus: () => true,
		});

		expect(response.status).toEqual(400);
		expect(response.data).toEqual({
			error: "Collaborator code already exists!",
		});
	});

	test("a patient can't call the endpoint", async () => {
		const payload = generateValidPayload(1);
		const patientHeaders = createAuthorizationHeader(createPatientJWT());

		const response = await axios.put(API_URL, payload, {
			headers: patientHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're not a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const payload = generateValidPayload(1);
		const invalidAuthorization = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.put(API_URL, payload, {
			headers: invalidAuthorization,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
