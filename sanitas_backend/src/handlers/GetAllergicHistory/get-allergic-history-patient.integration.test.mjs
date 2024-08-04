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
  }, 10000);

  test("Retrieve existing allergic history with valid patient ID", async () => {
    const response = await axios.get(`${API_URL}${patientId}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const allergicHistory = response.data.medicalHistory;
    expect(allergicHistory).toBeDefined();
    expect(allergicHistory.medication).toBeDefined();
  }, 10000);

  test("Retrieve default allergic history for non-existent patient", async () => {
    const nonExistentPatientId = 999999; // Assuming this ID does not exist
    const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    /** @type {import("utils/index.mjs").AllergicMedicalHistoryAPI} */
    const allergicHistory = response.data;

    expect(allergicHistory).toBeDefined();
    expect(allergicHistory.patientId).toBe(nonExistentPatientId);
    expect(allergicHistory.medicalHistory.medication.data.length).toBe(0);
    expect(allergicHistory.medicalHistory.food.data.length).toBe(0);
    expect(allergicHistory.medicalHistory.dust.data.length).toBe(0);
    expect(allergicHistory.medicalHistory.pollen.data.length).toBe(0);
    expect(allergicHistory.medicalHistory.climateChange.data.length).toBe(0);
    expect(allergicHistory.medicalHistory.animals.data.length).toBe(0);
    expect(allergicHistory.medicalHistory.others.data.length).toBe(0);
  });

  test("Fail to retrieve allergic history due to missing patient ID in the request", async () => {
    const invalidId = "invalid123";
    const response = await axios.get(`${API_URL}${invalidId}`, { validateStatus: () => true });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);

    const { error } = response.data;
    expect(error).toBe("Invalid request: No valid patientId supplied!");
  }, 10000);
});
