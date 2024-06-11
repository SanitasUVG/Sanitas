import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/";

describe("Update Collaborator integration tests", () => {
  beforeAll(() => {
    // Insert data into DB.
  });

  afterAll(() => {
    // Delete data into DB.
  });

  test("Normal case: Actualizar datos de un colaborador existente", async () => {
    const collaboratorData = {
      code: "C001",
      area: "Administración",
      idPatient: 1,
    };

    const response = await axios.put(`${LOCAL_API_URL}/collaborator`, collaboratorData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.message).toBe("Datos del colaborador actualizados exitosamente.");
  });

  test("Actualizar datos de un colaborador sin proporcionar ningún campo para actualizar", async () => {
    const collaboratorData = {
      code: "C001",
    };

    const response = await axios.put(`${LOCAL_API_URL}/collaborator`, collaboratorData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.message).toBe("Datos del colaborador actualizados exitosamente.");
  });

  test("Actualizar datos de un colaborador con código inexistente (debería fallar)", async () => {
    const collaboratorData = {
      code: "XYZ789",
      area: "Recursos Humanos",
    };

    const response = await axios.put(`${LOCAL_API_URL}/collaborator`, collaboratorData, {
      validateStatus: () => true, // Para que axios no lance un error en caso de status >= 400
    });

    // Verificar que el error sea el esperado
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("No se encontraron registros con el código proporcionado.");
  });
});
