import { describe, expect, it } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}/patient/student/`;

describe("Student Handler", () => {
	const studentId = 1;
	const fakestudentId = 9999;
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	const invalidEmailHeaders = createAuthorizationHeader(createPatientJWT());

	it("should return 403 if no CARNET is provided", async () => {
		const response = await axios.get(API_URL, {
			validateStatus: () => true,
			headers: validHeaders,
		});
		expect(response.status).toBe(403);
	});

	it("should return a patient", async () => {
		const response = await axios.get(API_URL + studentId, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const user = response.data;
		expect(user).toBeDefined();
		expect(user.carnet).toBe("A01234567");
		expect(user.career).toBe("Ingeniería en CC y TI");
		expect(user.idPatient).toBe(1);
	});

	it("Returns default data when patient is not found", async () => {
		const response = await axios.get(API_URL + fakestudentId, {
			validateStatus: () => true,
			headers: validHeaders,
		});
		expect(response.status).toBe(200);
	});

	it("Invalid ID provided", async () => {
		const invalidId = "invalid123";
		const response = await axios.get(`${API_URL}${invalidId}`, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Invalid request: No valid id supplied!");
	});

	it("Fail because of email without permissions", async () => {
		const response = await axios.get(`${API_URL}${studentId}`, {
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
		const response = await axios.get(`${API_URL}${studentId}`, {
			headers: createAuthorizationHeader(createInvalidJWT()),
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data.error).toBe("JWT couldn't be parsed");
	});
});
