import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/";

describe("Update Patient integration tests", () => {
  beforeAll(() => {
    // Insert data into DB.
  });

  afterAll(() => {
    // Delete data into DB.
  });

  test("Normal case: Actualizar datos de un paciente existente", async () => {
    const patientData = {
      cui: "1234567890123",
      names: "Juan Actualizado",
      lastNames: "Pérez Actualizado",
      phone: "5556789",
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/general`, patientData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.message).toBe("Datos del paciente actualizados exitosamente.");
  });

  test("Actualizar datos de un paciente sin proporcionar ningún campo para actualizar", async () => {
    const patientData = {
      cui: "1234567890123",
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/general`, patientData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.message).toBe("Datos del paciente actualizados exitosamente.");
  });

  test("Actualizar datos de un paciente con CUI inexistente (debería fallar)", async () => {
    const patientData = {
      cui: "9876543210987",
      names: "Nombre Nuevo",
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/general`, patientData, {
      validateStatus: () => true, // Para que axios no lance un error en caso de status >= 400
    });

    // Verificar que el error sea el esperado
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("No se encontraron registros con el CUI proporcionado.");
  });
});
