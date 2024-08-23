import { beforeEach, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createTestPatient,
	generateRandomCarnet,
	generateUniqueCUI,
	LOCAL_API_URL,
	updateStudentInfo,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/student`;

function generateValidUpdate(patientId) {
	return {
		patientId,
		carnet: generateRandomCarnet(),
		career: "Lic. Computación",
	};
}

describe("Update patient student data integration tests", () => {
	/** @type {number} */
	let patientId;

	let insertedPatientData;

	beforeEach(async () => {
		insertedPatientData = {
			cui: generateUniqueCUI(),
			names: "Manuela",
			lastNames: "OWO",
			isWoman: true,
		};
		const { cui, names, lastNames, isWoman } = insertedPatientData;
		patientId = await createTestPatient(cui, names, lastNames, isWoman);
	});

	test("Normal case: Actualizar datos de un paciente existente", async () => {
		const payload = generateValidUpdate(patientId);
		const received = await updateStudentInfo(
			patientId,
			payload.carnet,
			payload.career,
		);

		expect(received.patientId).toBe(patientId);
		expect(received.carnet).toBe(payload.carnet);
		expect(received.career).toBe(payload.career);
	});

	test("Can't repeat student carnet two times", async () => {
		const patient2Id = await createTestPatient();

		const headers = createAuthorizationHeader(createDoctorJWT());
		const payload = generateValidUpdate(patientId);
		await axios.put(API_URL, payload, { headers });

		payload.patientId = patient2Id;
		const response = await axios.put(API_URL, payload, {
			headers,
			validateStatus: () => true,
		});

		expect(response.status).toEqual(400);
		expect(response.data.error).toEqual("Student carnet already exists!");
	});

	test("Falla al no encontrar la ID", async () => {
		const payload = generateValidUpdate(99999999);
		const response = await axios.put(API_URL, payload, {
			validateStatus: () => true,
		});

		expect(response.status).toBe(404);
		expect(response.data.error).toBe("No patient with the given ID found!");
	});
});
