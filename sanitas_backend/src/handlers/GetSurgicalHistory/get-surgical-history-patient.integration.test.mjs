import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL, updatePatientSurgicalHistory } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/surgical-history/`;

async function createPatient() {
  // Create a test patient first
  const patientId = await createTestPatient();

  // Now update their surgical history
  await updatePatientSurgicalHistory(patientId, {
    medicalHistory: {
      surgeries: {
        version: 1,
        data: [
          {
            surgeryType: "Appendectomy",
            surgeryYear: "2023",
            complications: "None",
          },
        ],
      },
    },
  });

  return patientId;
}

describe("Get Surgical History integration tests", () => {
  let patientId;
  beforeAll(async () => {
    patientId = await createPatient(true);
  });

  test("Retrieve existing surgical history", async () => {
    const response = await axios.get(`${API_URL}${patientId}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    /** @type {import("utils/defaultValues.mjs").APISurgicalHistory} */
    const surgicalHistory = response.data;

    expect(surgicalHistory).toBeDefined();
    expect(surgicalHistory.patientId).toBe(patientId);
    expect(surgicalHistory.medicalHistory.surgeries.data.length).toBe(1);
    expect(surgicalHistory.medicalHistory.surgeries.data[0].surgeryType).toBe("Appendectomy");
  });

  test("Retrieve default surgical history for non-existent patient", async () => {
    const nonExistentPatientId = 999999; // Assuming this ID does not exist
    const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    /** @type {import("utils/defaultValues.mjs").APISurgicalHistory} */
    const surgicalHistory = response.data;

    expect(surgicalHistory).toBeDefined();
    expect(surgicalHistory.patientId).toBe(nonExistentPatientId);
    expect(surgicalHistory.medicalHistory.surgeries.data.length).toBe(0);
  });

  test("Invalid ID provided", async () => {
    const invalidId = "abckdj";
    const response = await axios.get(`${API_URL}${invalidId}`, { validateStatus: () => true });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);

    const { error } = response.data;
    expect(error).toBe("Invalid request: No valid patientId supplied!");
  });
});
