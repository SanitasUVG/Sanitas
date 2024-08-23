import { describe, expect, test } from "@jest/globals";
import axios from "axios";
import { LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}/patient/collaborator/`;

describe("Collaborator PUT endpoint", () => {
	const collaboratorId = 2;
	const fakeCollaboratorId = 9999;

	test("should return 403 if no ID is provided", async () => {
		try {
			await axios.get(API_URL); // Petición GET sin ID
		} catch (error) {
			expect(error.response.status).toBe(403);
		}
	});

	test("should return a collaborator", async () => {
		const response = await axios.get(API_URL + collaboratorId);

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const collaborator = response.data;
		expect(collaborator).toBeDefined();
		expect(collaborator.code).toBe("C001");
		expect(collaborator.area).toBe("Administración");
		expect(collaborator.patientId).toBe(2);
	});

	test("should not find a collaborator", async () => {
		try {
			await axios.get(API_URL + fakeCollaboratorId);
		} catch (error) {
			expect(error.response.status).toBe(404);
		}
	});
});
