import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/";

describe("Update Patient Integration Tests", () => {
  beforeAll(() => {
    // Insert data into DB.
  });

  afterAll(() => {
    // Delete data into DB.
  });

  test("Normal case: Update patient data", async () => {
    const patientData = {
      cui: "1234567890123",
      nombres: "Juan",
      apellidos: "Pérez",
      telefono: "1234567890", // updating the phone number
    };
    const response = await axios.post(`${LOCAL_API_URL}/patient/update`, patientData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });

  test("Update patient data without any fields (should fail)", async () => {
    const patientData = {}; // Empty object, should fail as no fields provided for update

    const response = await axios.post(`${LOCAL_API_URL}/patient/update`, patientData, {
      validateStatus: () => true,
    });

    expect(response.status).toBe(422); // Expecting Unprocessable Entity status
    expect(response.data.error).toBe("At least one field is required for update.");
  });
});
