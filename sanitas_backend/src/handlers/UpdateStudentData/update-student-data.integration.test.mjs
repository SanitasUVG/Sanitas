import { beforeEach, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient, generateUniqueCUI, updateStudentInfo } from "../testHelpers.mjs";

const LOCAL_API_URL = "http://localhost:3000/patient/student";

describe("Update patient student data integration tests", () => {
  /** @type {number} */
  let patientId;

  let insertedPatientData;

  beforeEach(async () => {
    insertedPatientData = {
      cui: generateUniqueCUI(),
      names: "Manuela",
      lastNames: "OWO",
      isWoman: true,
    };
    const { cui, names, lastNames, isWoman } = insertedPatientData;
    patientId = await createTestPatient(cui, names, lastNames, isWoman);
  });

  test("Normal case: Actualizar datos de un paciente existente", async () => {
    const payload = {
      id: patientId,
      carnet: "22386",
      career: "Lic. Computación",
    };

    const received = await updateStudentInfo(patientId);

    expect(received.carnet).toBe(payload.carnet);
    expect(received.career).toBe(payload.career);
  });

  test("Actualizar solamente carnet", async () => {
    const payload = {
      id: patientId,
      carnet: "22386",
    };

    const response = await axios.put(LOCAL_API_URL, payload);

    expect(response.status).toBe(200);

    const { data: received } = response;
    expect(received.carnet).toBe(payload.carnet);
    expect(received.career).toBeNull();
  });

  test("Actualizar solamente carrera", async () => {
    const payload = {
      id: patientId,
      career: "Lic. Química",
    };

    const response = await axios.put(LOCAL_API_URL, payload);

    expect(response.status).toBe(200);

    const { data: received } = response;
    expect(received.career).toBe(payload.carnet);
    expect(received.carnet).toBeNull();
  });

  test("Falla al no encontrar la ID", async () => {
    const payload = {
      patientId: -1,
      carnet: "22386",
      career: "22386",
    };

    const response = await axios.put(LOCAL_API_URL, payload, { validateStatus: () => true });

    expect(response.status).toBe(400);
    expect(response.data).toBe("No patient with the given ID found!");
  });
});
