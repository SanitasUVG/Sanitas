import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/traumatological-history`;

describe("Update Traumatologic History integration tests", () => {
  let patientId;

  beforeAll(async () => {
    patientId = await createTestPatient();
  });

  test("Update existing traumatologic history", async () => {
    const traumatologicHistoryData = {
      patientId,
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
    };

    const response = await axios.put(API_URL, traumatologicHistoryData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const { patientId: id, medicalHistory } = response.data;
    expect(id).toBe(patientId);
    expect(medicalHistory.traumas.data.length).toBe(1);
    expect(medicalHistory.traumas.data[0].whichBone).toBe("Femur");
  });

  test("Fail to update traumatologic history with invalid ID", async () => {
    const traumatologicHistoryData = {
      patientId: "999999",
      medicalHistory: {
        traumas: [
          {
            whichBone: "Clavicle",
            year: "2021",
            treatment: "Casting",
          },
        ],
      },
    };

    const response = await axios.put(API_URL, traumatologicHistoryData, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
    expect(response.data.error).toBe("Patient not found with the provided ID.");
  });

  test("Fail to update traumatologic history due to missing required fields", async () => {
    const incompleteData = {
      medicalHistory: {
        traumas: [
          {
            whichBone: "Spine",
            year: "2022",
            treatment: "Physical Therapy",
          },
        ],
      },
    };

    const response = await axios.put(API_URL, incompleteData, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("Invalid input: Missing or empty required fields.");
  });
});
