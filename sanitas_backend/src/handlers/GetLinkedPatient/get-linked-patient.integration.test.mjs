import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import {
	createTestPatient,
	LOCAL_API_URL,
	updatePatientFamilyHistory,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}account/patient`;

describe("Get linked patient integration tests", () => {

	beforeAll(async () => {})

	// TODO: Implement integration tests...
});
