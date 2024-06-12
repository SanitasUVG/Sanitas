import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL, updatePatientSurgicalHistory } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/surgical-history/`;
let patientId;

async function createPatient(hasHistory) {
  // Create a test patient first
  const patientResponse = await createTestPatient();
  patientId = patientResponse;

  // Now update their surgical history
  await updatePatientSurgicalHistory(patientId, {
    hasSurgicalEvent: hasHistory,
    surgicalEventData: [
      {
        surgeryType: "Appendectomy",
        surgeryYear: "2023",
        complications: "None",
      },
    ],
  });

  return patientId;
}

describe("Get Surgical History integration tests", () => {
  beforeAll(async () => {
    patientId = await createPatient(true);
  });

  test("Retrieve existing surgical history", async () => {
    const response = await axios.get(`${API_URL}${patientId}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const surgicalHistory = response.data;

    expect(surgicalHistory).toBeDefined();
    expect(surgicalHistory.patientId).toBe(patientId);
    expect(surgicalHistory.hasSurgicalEvent).toBeTruthy();
    expect(surgicalHistory.surgicalEventData.length).toBeGreaterThan(0);
    expect(surgicalHistory.surgicalEventData[0].surgeryType).toBe("Appendectomy");
  });

  test("Fail to retrieve surgical history for non-existent patient", async () => {
    const nonExistentPatientId = 999999; // Assuming this ID does not exist
    const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);

    const { message } = response.data;
    expect(message).toBe("No surgical history found for the provided ID.");
  });

  test("Invalid ID provided", async () => {
    const invalidId = "100000000"; // Assuming this is an invalid ID format
    const response = await axios.get(`${API_URL}${invalidId}`, { validateStatus: () => true });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);

    const { message } = response.data;
    expect(message).toBe("No surgical history found for the provided ID.");
  });

  test("Patient with hasSurgicalEvent false is not returning info.", async () => {
    patientId = await createPatient(false);
    const response = await axios.get(`${API_URL}${patientId}`, { validateStatus: () => true });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const { message } = response.data;
    expect(message).toBe("The patient has no surgical history registered.");
  }, 10000);
});
