import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}/patient/collaborator/`;

describe("Collaborator Handler", () => {
	const collaboratorId = 2;
	const fakeCollaboratorId = 9999;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	it("should return 403 if no ID is provided", async () => {
		try {
			await axios.get(API_URL); // Petición GET sin ID
		} catch (error) {
			expect(error.response.status).toBe(403);
		}
	});

	it("should return a collaborator", async () => {
		const response = await axios.get(API_URL + collaboratorId, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const collaborator = response.data;
		expect(collaborator).toBeDefined();
		expect(collaborator.code).toBe("C001");
		expect(collaborator.area).toBe("Administración");
		expect(collaborator.idPatient).toBe(2);
	});

	it("should return default data", async () => {
		const response = await axios.get(API_URL + fakeCollaboratorId, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const collaborator = response.data;
		expect(collaborator).toBeDefined();
		expect(collaborator.area).toBe(null);
		expect(collaborator.code).toBe(null);
	});

	it("Fail because of email without permissions", async () => {
		const response = await axios.get(`${API_URL}${collaboratorId}`, {
			headers: invalidEmailHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe(
			"The email doesn't belong to the patient id!",
		);
	});

	it("Fail because of invalid JWT", async () => {
		const response = await axios.get(`${API_URL}${collaboratorId}`, {
			headers: createAuthorizationHeader(createInvalidJWT()),
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data.error).toBe("JWT couldn't be parsed");
	});
});
