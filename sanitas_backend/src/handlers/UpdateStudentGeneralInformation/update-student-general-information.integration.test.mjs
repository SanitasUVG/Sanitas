import { beforeEach, describe, expect, test } from "@jest/globals";
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

const API_URL = `${LOCAL_API_URL}/patient/general`;

describe("Update Patient Integration tests (Patient POV)", () => {
	const validHeaders = createAuthorizationHeader(createPatientJWT());

	/** @type {number} */
	let patientId;
	let originalPayload;

	const generateValidUpdate = () => {
		return {
			patientId,
			...originalPayload,
		};
	};

	beforeEach(async () => {
		originalPayload = {
			cui: generateUniqueCUI(),
			names: "Flabio Andre",
			lastNames: "Galán Dona",
			isWoman: true,
			birthdate: new Date("2003-07-08"),
		};

		patientId = await createTestPatient(
			originalPayload.cui,
			originalPayload.names,
			originalPayload.lastNames,
			originalPayload.isWoman,
			originalPayload.birthdate,
		);
	});

	test("Normal case: Add new data", async () => {
		const patientData = generateValidUpdate();
		patientData.phone = "5524-2256";
		const response = await axios.post(API_URL, patientData, {
			headers: validHeaders,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data.phone).toBe(patientData.phone);
	});

	test("Can't modify existing data", async () => {
		const patientData = generateValidUpdate();
		patientData.names = "Juan desactualizado";

		const response = await axios.post(API_URL, patientData, {
			headers: validHeaders,
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(403);
		expect(response.data.error).toBe(
			"Invalid input: Students cannot update saved info.",
		);
	});

	test("Actualizar datos de un paciente con una ID inexistente (debería fallar)", async () => {
		const patientData = {
			patientId: -1,
			names: "Nombre Nuevo",
		};

		const response = await axios.post(API_URL, patientData, {
			headers: validHeaders,
			validateStatus: () => true, // Para que axios no lance un error en caso de status >= 400
		});

		// Verificar que el error sea el esperado
		expect(response.status).toBe(404);
		expect(response.data.error).toBe("Patient not found with the provided ID.");
	});

	test("a doctor can't call the endpoint", async () => {
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
