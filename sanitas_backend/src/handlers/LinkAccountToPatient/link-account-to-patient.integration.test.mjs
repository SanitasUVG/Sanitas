import { describe, expect, test, beforeEach } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createJWT,
	createTestPatient,
	generateUniqueCUI,
	generateUniqueEmail,
	linkToTestAccount,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}account/link`;

/**
 * Gets the data of a patient given the ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
async function getPatientData(id) {
	return (
		await axios.get(`${LOCAL_API_URL}patient/general/${id}`, {
			headers: createAuthorizationHeader(createDoctorJWT()),
		})
	).data;
}

describe("Link patient to an account integration tests", () => {
	let patientData;
	let patientId;
	beforeEach(async () => {
		patientId = await createTestPatient();
		patientData = await getPatientData(patientId);
	});

	test("Link existing patient to new account", async () => {
		const { linkedPatientId } = await linkToTestAccount(
			generateUniqueEmail(),
			patientData.cui,
		);
		expect(linkedPatientId).toEqual(patientId);
	});

	test("Fail if patient doesn't exists", async () => {
		const payload = {
			cui: generateUniqueCUI(), // Random CUI, so a patient with it is really unlikely
		};
		const jwtData = createJWT({ email: generateUniqueEmail() });
		const headers = createAuthorizationHeader(jwtData);

		const response = await axios.post(API_URL, payload, {
			headers,
			validateStatus: () => true,
		});

		// Verify the error is as expected
		expect(response.status).toBe(404);

		// NOTE: This error message is used on the frontend!
		expect(response.data.error).toBe("No patient with the given CUI found!");
	});

	test("Fail if a patient is already linked", async () => {
		const payload = {
			cui: patientData.cui,
		};
		const jwtData = createJWT({ email: generateUniqueEmail() });
		let headers = createAuthorizationHeader(jwtData);

		await axios.post(API_URL, payload, {
			headers,
			validateStatus: () => true,
		});

		headers = createAuthorizationHeader(
			createJWT({ email: generateUniqueEmail() }),
		);
		const response = await axios.post(API_URL, payload, {
			headers,
			validateStatus: () => true,
		});

		expect(response.status).toEqual(409);
		expect(response.data.error).toEqual(
			"Patient is already linked to another account!",
		);
	});
});
