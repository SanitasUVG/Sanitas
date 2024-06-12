import { beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, generateUniqueCUI, LOCAL_API_URL } from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}student/general/`;

describe("Student Handler", () => {
  let studentId = 1;
  let fakestudentId = 9999;

  it("should return 403 if no CARNET is provided", async () => {
    try {
      await axios.get(API_URL);
    } catch (error) {
      expect(error.response.status).toBe(403);
    }
  });

  it("should return a patient", async () => {
    const response = await axios.get(API_URL + studentId);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);

    const user = response.data;
    expect(user).toBeDefined();
    expect(user.carnet).toBe("A01234567");
    expect(user.carrera).toBe("Ingeniería en CC y TI");
    expect(user.id_paciente).toBe(1);
  });

  it("should not found a patiend", async () => {
    try {
      const response = await axios.get(API_URL + fakestudentId);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
});
