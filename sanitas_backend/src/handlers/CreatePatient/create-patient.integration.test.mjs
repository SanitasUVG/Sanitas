import { describe, expect, test } from "@jest/globals";
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

const API_URL = `${LOCAL_API_URL}/patient`;

describe("Create Patient Record Integration Tests", () => {
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	test("Normal case: Create a new patient record", createTestPatient);

	test("Create a new patient record without CUI (should fail)", async () => {
		const patientData = {
			names: "Juan",
			lastNames: "Pérez",
			isWoman: false,
			birthdate: "1990-01-01",
		};

		const response = await axios.post(API_URL, patientData, {
			headers: validHeaders,
			validateStatus: () => true, // So axios doesn't throw an error for status >= 400
		});

		// Verify the error is as expected
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("CUI is empty");
	});

	test("Create a new patient record with duplicate CUI (should fail)", async () => {
		const uniqueCUI = generateUniqueCUI();
		const patientData1 = {
			cui: uniqueCUI,
			names: "Juan",
			lastNames: "Pérez",
			isWoman: false,
			birthdate: "1990-01-01",
		};
		const patientData2 = {
			cui: uniqueCUI,
			names: "Carlos",
			lastNames: "González",
			isWoman: false,
			birthdate: "1985-05-05",
		};

		await axios.post(API_URL, patientData1, {
			headers: validHeaders,
		});

		const response = await axios.post(API_URL, patientData2, {
			headers: validHeaders,
			validateStatus: () => true, // So axios doesn't throw an error for status >= 400
		});

		// Verify the error is as expected
		expect(response.status).toBe(409);
		expect(response.data.error).toBe("CUI already exists.");
	});

	test("a patient can't call the endpoint", async () => {
		const uniqueCUI = generateUniqueCUI();
		const postData = {
			cui: uniqueCUI,
			names: "Juan",
			lastNames: "Pérez",
			isWoman: false,
			birthdate: "1990-01-01",
		};
		const specialHeaders = createAuthorizationHeader(createPatientJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're a patient!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const uniqueCUI = generateUniqueCUI();
		const postData = {
			cui: uniqueCUI,
			names: "Juan",
			lastNames: "Pérez",
			isWoman: false,
			birthdate: "1990-01-01",
		};
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
