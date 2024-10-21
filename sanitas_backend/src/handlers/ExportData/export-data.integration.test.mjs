import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	createTestPatient,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}consultations/export`;

describe("Get consultations data endpoint", () => {
	const validHeaders = createAuthorizationHeader(createDoctorJWT());
	let patientId;

	beforeAll(async () => {
		patientId = await createTestPatient();
	});
});
