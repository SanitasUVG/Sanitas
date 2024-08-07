import { describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createTestPatient,
	generateUniqueCUI,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

describe("Create Patient Record Integration Tests", () => {
	test("Normal case: Create a new patient record", createTestPatient);

	test("Create a new patient record without CUI (should fail)", async () => {
		const patientData = {
			names: "Juan",
			lastNames: "Pérez",
			isWoman: false,
			birthdate: "1990-01-01",
		};
	
		const response = await axios.post(`${LOCAL_API_URL}/patient`, patientData, {
			validateStatus: () => true, // So axios doesn't throw an error for status >= 400
		});
	
		// Verify the error is as expected
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("CUI is required.");
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

		await axios.post(`${LOCAL_API_URL}/patient`, patientData1);

		const response = await axios.post(
			`${LOCAL_API_URL}/patient`,
			patientData2,
			{
				validateStatus: () => true, // So axios doesn't throw an error for status >= 400
			},
		);

		// Verify the error is as expected
		expect(response.status).toBe(409);
		expect(response.data.error).toBe("CUI already exists.");
	});
});