import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}health-check`;

describe("Health Check Integration Test", () => {
	beforeAll(() => {
		// Insert data into DB.
	});
	afterAll(() => {
		// Delete inserted data.
	});

	test("should return DB status: UP if the database connection is successful", async () => {
		const response = await axios.get(API_URL);
		expect(response).toBeDefined();
		expect(response.status).toBe(200);
		expect(response.data).toBeDefined();
		const statuses = response.data;
		expect(statuses).toBeInstanceOf(Array);

		const dbStatus = statuses.find((status) => status.name === "DB");
		expect(dbStatus).toBeDefined();
		expect(dbStatus.status).toBe("UP");
	});
});
