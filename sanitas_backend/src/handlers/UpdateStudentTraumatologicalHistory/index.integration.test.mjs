import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createPatientJWT,
	createInvalidJWT,
	createTestPatient,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/student-traumatological-history`;

function generateValidUpdate(patientId) {
	return {
		patientId,
		medicalHistory: {
			traumas: {
				version: 1,
				data: [
					{
						whichBone: "Femur",
						year: "2023",
						treatment: "Surgery",
					},
				],
			},
		},
	};
}

describe("Update Traumatologic History integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient();
	});

	test("Update existing traumatologic history", async () => {
		const traumatologicHistoryData = generateValidUpdate(patientId);

		const response = await axios.post(API_URL, traumatologicHistoryData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);

		const { patientId: id, medicalHistory } = response.data;
		expect(id).toBe(patientId);
		expect(medicalHistory.traumas.data.length).toBe(1);
		expect(medicalHistory.traumas.data[0].whichBone).toBe("Femur");
	});

	test("Can't modify existing data", async () => {
		const traumatologicHistoryData = generateValidUpdate(patientId);
		await axios.post(API_URL, traumatologicHistoryData, {
			headers: validHeaders,
		});

		// A student can't modify existing data...
		traumatologicHistoryData.medicalHistory.traumas.data[0].whichBone =
			"non existing bone!";
		let response = await axios.post(API_URL, traumatologicHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(403);
		expect(response.data.error).toBe(
			"Invalid input: Students cannot update saved info.",
		);

		// A student can't delete existing data...
		traumatologicHistoryData.medicalHistory.traumas.data = [];
		response = await axios.post(API_URL, traumatologicHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(403);
		expect(response.data.error).toBe(
			"Invalid input: Students cannot update saved info.",
		);
	});

	test("Fail to update traumatologic history with invalid ID", async () => {
		const traumatologicHistoryData = {
			patientId: "999999",
			medicalHistory: {
				traumas: [
					{
						whichBone: "Clavicle",
						year: "2021",
						treatment: "Casting",
					},
				],
			},
		};

		const response = await axios.post(API_URL, traumatologicHistoryData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("Fail to update traumatologic history due to missing required fields", async () => {
		const incompleteData = {
			medicalHistory: {
				traumas: [
					{
						whichBone: "Spine",
						year: "2022",
						treatment: "Physical Therapy",
					},
				],
			},
		};

		const response = await axios.post(API_URL, incompleteData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(400);
		expect(response.data.error).toBe(
			"Invalid input: Missing or empty required fields.",
		);
	});

	test("a patient can't call the endpoint", async () => {
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createDoctorJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});