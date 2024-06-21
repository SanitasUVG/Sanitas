import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";
import { createTestPatient } from "../testHelpers.mjs";

const LOCAL_API_URL = "http://localhost:3000/";

describe("Update Patient integration tests", () => {
  /** @type {number} */
  let patientId;

  beforeAll(async () => {
    patientId = await createTestPatient();
  });

  afterAll(() => {
    // Delete data into DB.
  });

  test("Normal case: Actualizar datos de un paciente existente", async () => {
    const patientData = {
      id: patientId,
      names: "Juan Actualizado",
      lastNames: "Pérez Actualizado",
      phone: "5556789",
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/general`, patientData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.phone).toBe(patientData.phone);
  });

  test("Actualizar datos de un paciente sin proporcionar ningún campo para actualizar", async () => {
    const patientData = {
      id: patientId,
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/general`, patientData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(patientData.id);
  });

  test("Actualizar datos de un paciente con una ID inexistente (debería fallar)", async () => {
    const patientData = {
      id: -1,
      names: "Nombre Nuevo",
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/general`, patientData, {
      validateStatus: () => true, // Para que axios no lance un error en caso de status >= 400
    });

    // Verificar que el error sea el esperado
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("No se encontraron registros con el ID proporcionado.");
  });
});
