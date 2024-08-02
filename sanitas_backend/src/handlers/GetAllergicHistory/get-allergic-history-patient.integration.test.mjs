import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL, updatePatientmedicalHistory } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/allergic-history/`;

describe("Get Allergic Medical History integration tests", () => {
  let patientId;

  beforeAll(async () => {
    patientId = await createTestPatient();
    await updatePatientmedicalHistory(patientId, {
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
    });
  }, 20000);

  test("Retrieve existing allergic history with valid patient ID", async () => {
    const response = await axios.get(`${API_URL}${patientId}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const medicalHistory = response.data.medicalHistory;
    expect(response.data.patientId).toBe(patientId);
    expect(medicalHistory).toBeDefined();
    expect(medicalHistory.medicamento.data[0].name).toBe("Penicillin");
    expect(medicalHistory.polvo.data[0].source).toBe("Dust");
    expect(medicalHistory.cambioDeClima.data[0].region).toBe("High Altitude");
    expect(medicalHistory.animales.data[0].type).toBe("Cats");
  }, 20000);

  test("Retrieve empty allergic history for non-existent patient", async () => {
    const nonExistentPatientId = 999999;
    const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    /** @type {import("utils/index.mjs").AllergicMedicalHistoryAPI} */
    const medicalHistory = response.data.medicalHistory;

    expect(medicalHistory).toBeDefined();
    expect(medicalHistory.medicamento.data.length).toBe(0);
    expect(medicalHistory.comida.data.length).toBe(0);
    expect(medicalHistory.polvo.data.length).toBe(0);
    expect(medicalHistory.polen.data.length).toBe(0);
    expect(medicalHistory.cambioDeClima.data.length).toBe(0);
    expect(medicalHistory.animales.data.length).toBe(0);
    expect(medicalHistory.otros.data.length).toBe(0);
  }, 20000);

  test("Fail to retrieve allergic history due to missing patient ID in the request", async () => {
    const response = await axios.get(`${API_URL}`, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("Invalid input: Missing patientId.");
  });
});
