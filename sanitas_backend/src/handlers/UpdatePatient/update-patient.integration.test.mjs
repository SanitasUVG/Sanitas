import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}/patient/general`;

function generateValidUpdate(patientId) {
	return {
		id: patientId,
		names: "Juan Actualizado",
		lastNames: "Pérez Actualizado",
		phone: "5556789",
	};
}

describe("Update Patient integration tests", () => {
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	/** @type {number} */
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient();
	});

	afterAll(() => {
		// Delete data into DB.
	});

	test("Normal case: Actualizar datos de un paciente existente", async () => {
		const patientData = generateValidUpdate(patientId);
		const response = await axios.put(API_URL, patientData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.phone).toBe(patientData.phone);
	});

	test("Actualizar datos de un paciente sin proporcionar ningún campo para actualizar", async () => {
		const patientData = {
			id: patientId,
		};

		const response = await axios.put(API_URL, patientData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.id).toBe(patientData.id);
	});

	test("Actualizar datos de un paciente con una ID inexistente (debería fallar)", async () => {
		const patientData = {
			id: -1,
			names: "Nombre Nuevo",
		};

		const response = await axios.put(API_URL, patientData, {
			headers: validHeaders,
			validateStatus: () => true, // Para que axios no lance un error en caso de status >= 400
		});

		// Verificar que el error sea el esperado
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("No patient with the given ID found!");
	});

	test("a patient can't call the endpoint", async () => {
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createPatientJWT());

		const response = await axios.put(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're not a doctor!",
		});
	});

	test("can't be called by a malformed JWT", async () => {
		const postData = generateValidUpdate(patientId);
		const specialHeaders = createAuthorizationHeader(createInvalidJWT());

		const response = await axios.put(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
