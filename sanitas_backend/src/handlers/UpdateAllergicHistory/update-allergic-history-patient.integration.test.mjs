import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/allergic-history`;

describe("Update Allergic Medical History integration tests", () => {
  let patientId;

  beforeAll(async () => {
    patientId = await createTestPatient(); // Create a patient and get the ID
  });

  test("Update existing allergic medical history", async () => {
    const allergicHistoryData = {
      patientId,
      allergicHistory: {
        medicamento: {
          version: 1,
          data: [{ name: "Penicillin", severity: "high" }],
        },
        comida: {
          version: 1,
          data: [],
        },
        polvo: {
          version: 1,
          data: [{ source: "Dust" }],
        },
        polen: {
          version: 1,
          data: [],
        },
        cambioDeClima: {
          version: 1,
          data: [{ region: "High Altitude" }],
        },
        animales: {
          version: 1,
          data: [{ type: "Cats" }],
        },
        otros: {
          version: 1,
          data: [],
        },
      },
    };

    const response = await axios.put(API_URL, allergicHistoryData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.patientId).toBe(patientId);
    expect(response.data.medicalHistory.medicamento).toEqual(
      allergicHistoryData.medicalHistory.medicamento,
    );
    expect(response.data.medicalHistory.comida).toEqual(
      allergicHistoryData.medicalHistory.comida,
    );
    expect(response.data.medicalHistory.polvo).toEqual(
      allergicHistoryData.medicalHistory.polvo,
    );
    expect(response.data.medicalHistory.polen).toEqual(
      allergicHistoryData.medicalHistory.polen,
    );
    expect(response.data.medicalHistory.cambioDeClima).toEqual(
      allergicHistoryData.medicalHistory.cambioDeClima,
    );
    expect(response.data.medicalHistory.animales).toEqual(
      allergicHistoryData.medicalHistory.animales,
    );
    expect(response.data.medicalHistory.otros).toEqual(
      allergicHistoryData.medicalHistory.otros,
    );
  });

  test("Fail to update allergic medical history with invalid ID", async () => {
    const allergicHistoryData = {
      patientId: "9999999",
      allergicHistory: {
        medicamento: {
          version: 1,
          data: [{ name: "Penicillin", severity: "high" }],
        },
        comida: {
          version: 1,
          data: [],
        },
        polvo: {
          version: 1,
          data: [{ source: "Dust" }],
        },
        polen: {
          version: 1,
          data: [],
        },
        cambioDeClima: {
          version: 1,
          data: [{ region: "High Altitude" }],
        },
        animales: {
          version: 1,
          data: [{ type: "Cats" }],
        },
        otros: {
          version: 1,
          data: [],
        },
      },
    };

    const response = await axios.put(API_URL, allergicHistoryData, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
    expect(response.data.error).toBe("No allergic history found for the provided ID.");
  });

  test("Fail to update allergic medical history due to missing required fields", async () => {
    // Missing patientId
    const incompleteData = {
      allergicHistory: {
        medicamento: {
          version: 1,
          data: [{ name: "Penicillin", severity: "high" }],
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
