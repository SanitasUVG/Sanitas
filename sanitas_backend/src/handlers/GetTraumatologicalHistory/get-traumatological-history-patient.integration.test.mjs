import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL, updatePatientTraumatologicHistory } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/traumatological-history/`;

async function createPatient() {
  const patientId = await createTestPatient();

  await updatePatientTraumatologicHistory(patientId, {
    medicalHistory: {
      traumas: {
        version: 1,
        data: [
          {
            whichBone: "Femur",
            year: "2023",
            treatment: "Surgery",
          },
        ],
      },
    },
  });

  return patientId;
}

describe("Get Traumatologic History integration tests", () => {
  let patientId;
  beforeAll(async () => {
    patientId = await createPatient();
  });

  test("Retrieve existing traumatologic history", async () => {
    const response = await axios.get(`${API_URL}${patientId}`);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const traumatologicHistory = response.data;

    expect(traumatologicHistory).toBeDefined();
    expect(traumatologicHistory.patientId).toBe(patientId);
    expect(traumatologicHistory.medicalHistory.traumas.data.length).toBe(1);
    expect(traumatologicHistory.medicalHistory.traumas.data[0].whichBone).toBe("Femur");
  });

  test("Retrieve default traumatologic history for non-existent patient", async () => {
    const nonExistentPatientId = 999999;
    const response = await axios.get(`${API_URL}${nonExistentPatientId}`, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const traumatologicHistory = response.data;

    expect(traumatologicHistory).toBeDefined();
    expect(traumatologicHistory.patientId).toBe(nonExistentPatientId);
    expect(traumatologicHistory.medicalHistory.traumas.data.length).toBe(0);
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
