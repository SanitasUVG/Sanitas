import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createJWT,
	createTestPatient,
	generateUniqueEmail,
	linkToTestAccount,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}account/patient`;

describe("Get linked patient integration tests", () => {
	let linkedEmail;
	let patientData;

	beforeAll(async () => {
		const patientId = await createTestPatient();
		patientData = (
			await axios.get(`${LOCAL_API_URL}patient/general/${patientId}`, {
				headers: createAuthorizationHeader(createDoctorJWT()),
			})
		).data;
		linkedEmail = generateUniqueEmail();
		await linkToTestAccount(linkedEmail, patientData.cui);
	});

	test("Get linked patient successfully!", async () => {
		const headers = createAuthorizationHeader(
			createJWT({ email: linkedEmail }),
		);
		const response = await axios.get(API_URL, { headers });

		expect(response.status).toBe(200);

		const { linkedPatientId } = response.data;
		expect(linkedPatientId).toBeDefined();
		expect(linkedPatientId).toEqual(patientData.patientId);
	});

	test("Get null for patient with no linked patient", async () => {
		const headers = createAuthorizationHeader(
			createJWT({ email: generateUniqueEmail() }),
		);
		const response = await axios.get(API_URL, { headers });

		expect(response.status).toBe(200);

		const { linkedPatientId } = response.data;
		expect(linkedPatientId).toEqual(null);
	});
});
