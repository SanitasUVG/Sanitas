import { describe, expect, test } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/";

describe("Get Collaborator integration tests", () => {
  beforeAll(() => {
    // Insert data into DB.
  });

  afterAll(() => {
    // Delete inserted data.
  });

  test("Normal case: Obtener datos de un colaborador existente", async () => {
    const code = "C001";

    const response = await axios.get(`${LOCAL_API_URL}/patient/collaborator`, {
      params: { code },
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    expect(response.data.code).toBe("C001");
    expect(response.data.area).toBe("Administración"); // Update according to your test data
    expect(response.data.idPatient).toBe(1); // Update according to your test data
  });

  test("Obtener datos de un colaborador con código inexistente (debería fallar)", async () => {
    const code = "XYZ789";

    const response = await axios.get(`${LOCAL_API_URL}/patient/collaborator`, {
      params: { code },
      validateStatus: () => true, // To avoid axios throwing error for non-2xx status codes
    });

    expect(response).toBeDefined();
    expect(response.status).toBe(404);
    expect(response.data.error).toBe("No se encontraron registros con el código proporcionado.");
  });
});
