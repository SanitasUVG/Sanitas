import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}check-cui/`;

describe("Check cui integration tests", () => {
	beforeAll(() => {
		// Insert data into DB.
	});
	afterAll(() => {
		// Delete inserted data.
	});
	test("Check if Cui exists", async () => {
		const response = await axios.get(`${API_URL}1234567890123`);

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data).toBeDefined();
		expect(response.data.exists).toBeDefined();
		expect(response.data.exists).toBe(true);
	});

	test("Check if Cui dont exists", async () => {
		const response = await axios.get(`${API_URL}6234567842123`);

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data).toBeDefined();
		expect(response.data.exists).toBeDefined();
		expect(response.data.exists).toBe(false);
	});

	test("Check error response", async () => {
		const response = await axios.get(API_URL, {
			validateStatus: () => true,
		});

		expect(response).toBeDefined();
		expect(response.status).toBe(403);
	});
});
