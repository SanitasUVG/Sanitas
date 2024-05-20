import axios from "axios";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";

const LOCAL_API_URL = "http://localhost:3000/check-cui/";

describe("Check cui integration tests", () => {
    beforeAll(() => {
        // Insert data into DB.
    });
    afterAll(() => {
        // Delete inserted data.
    });
    test("Check if Cui exists", async () => {
        const response = await axios.get(LOCAL_API_URL + "1234567890123");

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.exists).toBeDefined();
        expect(response.data.exists).toBe(true);
        // Check if data matches inserted data...
    });

    test("Check if Cui dont exists", async () => {
        const response = await axios.get(LOCAL_API_URL + "6234567842123");

        expect(response).toBeDefined();
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.exists).toBeDefined();
        expect(response.data.exists).toBe(false);
        // Check if data don't matches inserted data...
    });


    test("Check error response", async () => {
        const response = await axios.get(LOCAL_API_URL + "", {
            validateStatus: () => true
        });

        expect(response).toBeDefined();
        expect(response.status).toBe(403);

        // Check if user sent bad request....
    });

});
