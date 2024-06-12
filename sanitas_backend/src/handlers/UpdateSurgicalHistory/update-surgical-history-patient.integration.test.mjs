import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/surgical-history`;

describe("Update Surgical History integration tests", () => {
  let patientId;

  beforeAll(async () => {
    patientId = await createTestPatient(); // Create a patient and get the ID
  });

  test("Update existing surgical history", async () => {
    const surgicalHistoryData = {
      id: patientId,
      hasSurgicalEvent: true,
      surgicalEventData: [
        {
          surgeryType: "Appendectomy",
          surgeryYear: "2023",
          complications: "None",
        },
      ],
    };

    const response = await axios.put(API_URL, surgicalHistoryData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.patientId).toBe(patientId);
    expect(response.data.hasSurgicalEvent).toBeTruthy();
    expect(response.data.surgicalEventData.length).toBeGreaterThan(0);
    expect(response.data.surgicalEventData[0].surgeryType).toBe("Appendectomy");
  });

  test("Fail to update surgical history with invalid ID", async () => {
    const surgicalHistoryData = {
      id: "999999", // Assuming this ID does not exist
      hasSurgicalEvent: true,
      surgicalEventData: [
        {
          surgeryType: "Gallbladder Removal",
          surgeryYear: "2021",
          complications: "Minor infection",
        },
      ],
    };

    const response = await axios.put(API_URL, surgicalHistoryData, {
      validateStatus: () => true, // Ensures axios does not throw an error for non-2xx status
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(404); // Check for the correct status code
    expect(response.data.error).toBe("Patient not found with the provided ID."); // Updated to match new error message
  });

  test("Fail to update surgical history due to missing required fields", async () => {
    const incompleteData = {
      hasSurgicalEvent: true,
      surgicalEventData: [
        {
          surgeryType: "Gallbladder Removal",
          surgeryYear: "2021",
          complications: "Minor infection",
        },
      ],
    };

    const response = await axios.put(API_URL, incompleteData, {
      validateStatus: () => true,
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("Invalid input: Missing or empty required fields.");
  });
});
