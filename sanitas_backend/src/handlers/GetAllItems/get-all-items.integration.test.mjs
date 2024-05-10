import axios from "axios";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";

const LOCAL_API_URL = "http://localhost:3000/";

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
