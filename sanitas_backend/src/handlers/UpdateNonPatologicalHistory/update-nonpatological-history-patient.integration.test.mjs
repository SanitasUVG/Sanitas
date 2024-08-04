import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/nonpatological-history`;

describe("Update Non-Pathological Medical History integration tests", () => {
  let patientId;

  beforeAll(async () => {
    patientId = await createTestPatient(); // Create a patient and get the ID
  });

  test("Update existing non-pathological history", async () => {
    const nonPathologicalHistoryData = {
      patientId,
      medicalHistory: {
        bloodType: "AB+",
        smoker: {
          version: 1,
          data: { smokes: true, cigarettesPerDay: 5 },
        },
        drink: {
          version: 1,
          data: { drinks: true, drinksPerMonth: 10 },
        },
        drugs: {
          version: 1,
          data: { usesDrugs: true, drugType: "Cannabis" },
        },
      },
    };

    const response = await axios.put(API_URL, nonPathologicalHistoryData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.patientId).toBe(patientId);
    expect(response.data.medicalHistory.bloodType).toBe(
      nonPathologicalHistoryData.medicalHistory.bloodType,
    );
    expect(response.data.medicalHistory.smoker).toEqual(
      nonPathologicalHistoryData.medicalHistory.smoker,
    );
    expect(response.data.medicalHistory.drink).toEqual(
      nonPathologicalHistoryData.medicalHistory.drink,
    );
    expect(response.data.medicalHistory.drugs).toEqual(
      nonPathologicalHistoryData.medicalHistory.drugs,
    );
  });

  test("Fail to update non-pathological history with invalid ID", async () => {
    const nonPathologicalHistoryData = {
      patientId: "999999",
      medicalHistory: {
        bloodType: "O-",
        smoker: {
          version: 1,
          data: { smokes: false },
        },
      },
    };

    const response = await axios.put(API_URL, nonPathologicalHistoryData, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
    expect(response.data.error).toBe("Patient not found with the provided ID.");
  });

  test("Fail to update non-pathological history due to missing required fields", async () => {
    const incompleteData = {};

    const response = await axios.put(API_URL, incompleteData, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("Invalid input: Missing patientId.");
  });
});
