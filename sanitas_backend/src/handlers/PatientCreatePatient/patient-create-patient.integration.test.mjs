import { describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	generateUniqueCUI,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}/patient/create`;

function generateValidUpdate(cui) {
	return {
		cui,
		names: "Juan",
		lastNames: "Pérez",
		isWoman: false,
		birthdate: "1990-01-01",
		phone: "55247856",
		insurance: "El Roble",
	};
}

describe("Create Patient Record Integration Tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());

	test("Normal case: Create a new patient record", async () => {
		const patientData = generateValidUpdate(generateUniqueCUI());
		const response = await axios.post(API_URL, patientData, {
			headers: validHeaders,
		});

		const expectedResponse = expect.any(Number);

		expect(response.status).toBe(200);
		expect(response.data).toEqual(expectedResponse);
	});

	test("Create a new patient record without CUI (should fail)", async () => {
		const patientData = generateValidUpdate(generateUniqueCUI());
		patientData.cui = undefined;

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
			phone: "55247856",
			insurance: "El Roble",
		};
		const patientData2 = {
			cui: uniqueCUI,
			names: "Carlos",
			lastNames: "González",
			isWoman: false,
			birthdate: "1985-05-05",
			phone: "55247856",
			insurance: "El Roble",
		};

		await axios.post(API_URL, patientData1, { headers: validHeaders });

		const response = await axios.post(API_URL, patientData2, {
			headers: validHeaders,
			validateStatus: () => true, // So axios doesn't throw an error for status >= 400
		});

		// Verify the error is as expected
		expect(response.status).toBe(409);
		expect(response.data.error).toBe("CUI already exists.");
	});

	test("Can't create a new patient with incomplete data", async () => {
		const data = {
			cui: generateUniqueCUI(),
			names: "Juan",
			lastNames: "Pérez",
		};

		const response = await axios.post(API_URL, data, {
			validateStatus: () => true,
			headers: validHeaders,
		});
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Gender (isWoman) is required.");
	});

	test("a doctor can't call the endpoint", async () => {
		const postData = generateValidUpdate(generateUniqueCUI());
		const specialHeaders = createAuthorizationHeader(createDoctorJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		console.log(response.data);

		expect(response.status).toBe(401);
		expect(response.data.error).toEqual("Unauthorized, you're a doctor!");
	});

	test("can't be called by a malformed JWT", async () => {
		const postData = generateValidUpdate(generateUniqueCUI());
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
