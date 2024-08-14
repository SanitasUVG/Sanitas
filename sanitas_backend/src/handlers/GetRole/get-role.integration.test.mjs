import { describe, expect, it } from "@jest/globals";
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

	it("can't be called by a malformed JWT", async () => {
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());
		const response = await axios.get(API_URL, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
