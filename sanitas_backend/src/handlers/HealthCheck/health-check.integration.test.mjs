import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
const LOCAL_API_URL = "http://localhost:3000/health-check";

describe("Health Check Integration Test", () => {
	beforeAll(() => {
		// Insert data into DB.
	});
	afterAll(() => {
		// Delete inserted data.
	});

	test("should return DB status: UP if the database connection is successful", async () => {
		const response = await axios.get(LOCAL_API_URL);
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
