import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL, updatePatientAllergicHistory } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/allergic-history/`;

describe("Get Allergic Medical History integration tests", () => {
  let patientId;

  beforeAll(async () => {
    patientId = await createTestPatient();
    await updatePatientAllergicHistory(patientId, {
      medicalHistory: {
        medication: {
          version: 1,
          data: [{ name: "Penicillin", severity: "high" }],
        },
        food: {
          version: 1,
          data: [],
        },
        dust: {
          version: 1,
          data: [{ source: "Dust" }],
        },
        pollen: {
          version: 1,
          data: [],
        },
        climateChange: {
          version: 1,
          data: [{ region: "High Altitude" }],
        },
        animals: {
          version: 1,
          data: [{ type: "Cats" }],
        },
        others: {
          version: 1,
          data: [],
        },
      },
    });
  }, 20000);

  test("Retrieve existing allergic history with valid patient ID", async () => {
    const response = await axios.get(`${API_URL}${patientId}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const medicalHistory = response.data.medicalHistory;
    expect(medicalHistory).toBeDefined();
    expect(medicalHistory.medication).toBeDefined();
  });

  test("Retrieve empty allergic history for non-existent patient", async () => {
    const nonExistentPatientId = 999999;
    const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const medicalHistory = response.data.allergicHistory;
    expect(medicalHistory).toBeDefined();
    expect(medicalHistory.medication.data.length).toBe(0);
    expect(medicalHistory.food.data.length).toBe(0);
    expect(medicalHistory.dust.data.length).toBe(0);
    expect(medicalHistory.pollen.data.length).toBe(0);
    expect(medicalHistory.climateChange.data.length).toBe(0);
    expect(medicalHistory.animals.data.length).toBe(0);
    expect(medicalHistory.others.data.length).toBe(0);
  });

  test("Fail to retrieve allergic history due to missing patient ID in the request", async () => {
    const invalidId = "invalid123";
    const response = await axios.get(`${API_URL}${invalidId}`, { validateStatus: () => true });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("Invalid input: Missing patientId.");
  });
});
