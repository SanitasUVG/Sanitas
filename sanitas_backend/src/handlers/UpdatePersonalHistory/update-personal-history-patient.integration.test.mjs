import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/personal-history`;

describe("Update Personal Medical History integration tests", () => {
  let patientId;

  beforeAll(async () => {
    patientId = await createTestPatient(); // Create a patient and get the ID
  });

  test("Update existing personal medical history", async () => {
    const personalHistoryData = {
      patientId,
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
    };

    const response = await axios.put(API_URL, personalHistoryData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.patientId).toBe(patientId);
    expect(response.data.medicalHistory.hypertension).toEqual(
      personalHistoryData.medicalHistory.hypertension,
    );
    expect(response.data.medicalHistory.diabetesMellitus).toEqual(
      personalHistoryData.medicalHistory.diabetesMellitus,
    );
    expect(response.data.medicalHistory.hypothyroidism).toEqual(
      personalHistoryData.medicalHistory.hypothyroidism,
    );
    expect(response.data.medicalHistory.asthma).toEqual(personalHistoryData.medicalHistory.asthma);
    expect(response.data.medicalHistory.convulsions).toEqual(
      personalHistoryData.medicalHistory.convulsions,
    );
    expect(response.data.medicalHistory.myocardialInfarction).toEqual(
      personalHistoryData.medicalHistory.myocardialInfarction,
    );
    expect(response.data.medicalHistory.cancer).toEqual(personalHistoryData.medicalHistory.cancer);
    expect(response.data.medicalHistory.cardiacDiseases).toEqual(
      personalHistoryData.medicalHistory.cardiacDiseases,
    );
    expect(response.data.medicalHistory.renalDiseases).toEqual(
      personalHistoryData.medicalHistory.renalDiseases,
    );
    expect(response.data.medicalHistory.others).toEqual(personalHistoryData.medicalHistory.others);
  });

  test("Fail to update personal medical history with invalid ID", async () => {
    const familyHistoryData = {
      patientId: "999999",
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
    };

    const response = await axios.put(API_URL, familyHistoryData, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
    expect(response.data.error).toBe("No family history found for the provided ID.");
  });

  test("Fail to update personal medical history due to missing required fields", async () => {
    // Missing patientId
    const incompleteData = {
      medicalHistory: {
        hypertension: {
          version: 1,
          data: ["Father"],
        },
      },
    };

    const response = await axios.put(API_URL, incompleteData, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("Invalid input: Missing patientId.");
  });
});
