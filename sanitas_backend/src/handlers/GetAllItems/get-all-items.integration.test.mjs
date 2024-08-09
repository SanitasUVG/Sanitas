import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { LOCAL_API_URL } from "../testHelpers.mjs";

describe("Get All Items integration tests", () => {
	beforeAll(() => {
		// Insert data into DB.
	});
	afterAll(() => {
		// Delete inserted data.
	});
	test("Normal case", async () => {
		const response = await axios.get(LOCAL_API_URL);

		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		// Check if data matches inserted data...
	});
});
