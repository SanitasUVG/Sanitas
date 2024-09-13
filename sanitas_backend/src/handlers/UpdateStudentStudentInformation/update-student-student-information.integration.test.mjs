import { beforeEach, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	generateRandomCarnet,
	generateUniqueCUI,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/student`;

function generateValidUpdate(idPatient, carnet = generateRandomCarnet()) {
	return {
		idPatient,
		carnet,
		career: "Lic. Computación",
	};
}

describe("Update patient student data integration tests", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());
	/** @type {number} */
	let idPatient;

	let insertedPatientData;

	beforeEach(async () => {
		insertedPatientData = {
			cui: generateUniqueCUI(),
			names: "Manuela",
			lastNames: "OWO",
			isWoman: true,
		};
		const { cui, names, lastNames, isWoman } = insertedPatientData;
		idPatient = await createTestPatient(cui, names, lastNames, isWoman);
	});

	test("Normal case: Actualizar datos de un paciente existente", async () => {
		const payload = generateValidUpdate(idPatient);
		const received = await axios.post(API_URL, payload, {
			headers: validHeaders,
		});

		const { data } = received;
		console.log("Received", data);

		expect(data.idPatient).toBe(idPatient);
		expect(data.carnet).toBe(payload.carnet);
		expect(data.career).toBe(payload.career);
	});

	test("Can't repeat student carnet two times", async () => {
		const patient2Id = await createTestPatient();

		const payload = generateValidUpdate(idPatient);
		await axios.post(API_URL, payload, { headers: validHeaders });

		payload.idPatient = patient2Id;
		const response = await axios.post(API_URL, payload, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toEqual(400);
		expect(response.data.error).toEqual("Student carnet already exists!");
	});

	test("Falla al no encontrar la ID", async () => {
		const payload = generateValidUpdate(99999999);
		const response = await axios.post(API_URL, payload, {
			validateStatus: () => true,
			headers: validHeaders,
		});

		expect(response.status).toBe(404);
		expect(response.data.error).toBe("No patient with the given ID found!");
	});

	test("a doctor can't call the endpoint", async () => {
		const payload = generateValidUpdate(idPatient);
		const doctorHeaders = createAuthorizationHeader(createDoctorJWT());

		const response = await axios.post(API_URL, payload, {
			headers: doctorHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const payload = generateValidUpdate(1);
		const invalidAuthorization = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.post(API_URL, payload, {
			headers: invalidAuthorization,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
