import { describe, expect, test } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/";

describe("Get Collaborator integration tests", () => {
  test("Caso normal: Obtener datos de un colaborador existente", async () => {
    const idPatient = 2;

    try {
      const response = await axios.get(`${LOCAL_API_URL}/patient/collaborator`, {
        params: { idPatient },
      });

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.data.code).toBe("C001");
      expect(response.data.area).toBe("Administración");
      expect(response.data.idPatient).toBe(idPatient);
    } catch (error) {
      expect(error.response.status).toBe(403);
    }
  });

  test("Obtener datos de un colaborador con id de paciente inexistente (debería fallar)", async () => {
    const idPatient = 9999; // ID de paciente inexistente

    try {
      const response = await axios.get(`${LOCAL_API_URL}/patient/collaborator`, {
        params: { idPatient },
      });

      expect(response).toBeDefined();
      expect(response.status).toBe(404);
      expect(response.data.error).toBe("No se encontraron registros con el id de paciente proporcionado.");
    } catch (error) {
      expect(error.response.status).toBe(403);
    }
  });
});
