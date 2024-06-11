import { describe, expect, test } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/";

describe("Update Collaborator integration tests", () => {
  beforeAll(() => {
    // Insert data into DB.
  });
  afterAll(() => {
    // Delete inserted data.
  });

  test("Normal case: Actualizar datos de un colaborador existente", async () => {
    const collaboratorData = {
      code: "C001",
      area: "Administración",
      idPatient: 1,
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/collaborator`, collaboratorData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200); // Ensure successful request
    expect(response.data.code).toBe("C001");
    expect(response.data.area).toBe("Administración");
    expect(response.data.idPatient).toBe(1);
  });

  test("Actualizar datos de un colaborador sin proporcionar ningún campo para actualizar", async () => {
    const collaboratorData = {
      code: "C001",
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/collaborator`, collaboratorData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200); // Ensure successful request
    expect(response.data.code).toBe("C001");
  });

  test("Actualizar datos de un colaborador con código inexistente (debería fallar)", async () => {
    const collaboratorData = {
      code: "XYZ789",
      area: "Recursos Humanos",
    };

    const response = await axios.put(`${LOCAL_API_URL}/patient/collaborator`, collaboratorData, {
      validateStatus: () => true, // Ensure axios does not throw an error for non-2xx status codes
    });

    // Verify the error message
    expect(response.status).toBe(500); // Change to expected status code
    expect(response.data.error).toBe("Internal Server Error"); // Change to expected error message
  });
});
