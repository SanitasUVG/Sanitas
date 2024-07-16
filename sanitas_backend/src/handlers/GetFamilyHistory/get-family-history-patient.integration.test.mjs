import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL, updatePatientFamilyHistory } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/family-history/`;

async function createPatientAndHistory() {
  const patientId = await createTestPatient();
  return patientId;
}

describe("Get Family Medical History integration tests", () => {
  let patientId;

  beforeAll(async () => {
    patientId = await createPatientAndHistory();
    await updatePatientFamilyHistory(patientId, {
      medicalHistory: {
        hypertension: {
          version: 1,
          data: ["Father", "Mother"],
        },
        diabetesMellitus: {
          version: 1,
          data: ["Mother", "Brother"],
        },
        hypothyroidism: {
          version: 1,
          data: ["Grandmother"],
        },
        asthma: {
          version: 1,
          data: [],
        },
        convulsions: {
          version: 1,
          data: ["Uncle"],
        },
        myocardialInfarction: {
          version: 1,
          data: [],
        },
        cancer: {
          version: 1,
          data: [
            {
              who: "Mother",
              typeOfCancer: "Breast",
            },
          ],
        },
        cardiacDiseases: {
          version: 1,
          data: [
            {
              who: "Father",
              typeOfDisease: "Hypertrophy",
            },
          ],
        },
        renalDiseases: {
          version: 1,
          data: [
            {
              who: "Grandfather",
              typeOfDisease: "Renal Failure",
            },
          ],
        },
        others: {
          version: 1,
          data: [
            {
              who: "Brother",
              disease: "Psoriasis",
            },
          ],
        },
      },
    });
  });

  test("Retrieve existing family medical history", async () => {
    const response = await axios.get(`${API_URL}${patientId}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const familyHistory = response.data.medicalHistory;
    expect(familyHistory).toBeDefined();
    expect(familyHistory.hypertension).toBeDefined();
  });

  test("Retrieve default family medical history for non-existent patient", async () => {
    const nonExistentPatientId = 999999; // Assuming this ID does not exist
    const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);

    const { message } = response.data;
    expect(message).toBe("No family history found for the provided patientId.");
  });

  test("Invalid ID provided", async () => {
    const invalidId = "invalid123";
    const response = await axios.get(`${API_URL}${invalidId}`, { validateStatus: () => true });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);

    const { error } = response.data;
    expect(error).toBe("Invalid request: No valid patientId supplied!");
  });
});
