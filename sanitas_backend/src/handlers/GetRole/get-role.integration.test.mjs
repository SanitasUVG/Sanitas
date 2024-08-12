import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}role`;

describe("Get user role integration tests", () => {
	beforeAll(() => {
		// TODO: Insert data into DB.
	});
	afterAll(() => {
		// TODO: Delete inserted data.
	});

	it("recognized a patient", async () => {
		const headers = createAuthorizationHeader(createPatientJWT());
		const response = await axios.get(API_URL, { headers });

		expect(response.status).toBe(200);
		expect(response.data).toEqual("PATIENT");
	});

	it("recognized a doctor", async () => {
		const headers = createAuthorizationHeader(createDoctorJWT());
		const response = await axios.get(API_URL, { headers });

		expect(response.status).toBe(200);
		expect(response.data).toEqual("DOCTOR");
	});

	it("can't be called by incorrect method", async () => {
		const headers = createAuthorizationHeader(createInvalidJWT());
		const response = await axios.post(
			API_URL,
			{},
			{
				headers,
				validateStatus: () => true,
			},
		);

		expect(response.status).toBe(405);
		expect(response.data).toEqual({ error: "Method Not Allowed" });
	});

	it("can't be called by a malformed JWT", async () => {
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());
		const response = await axios.get(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
