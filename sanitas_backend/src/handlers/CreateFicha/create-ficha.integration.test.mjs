import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/";

// Función para generar un CUI único
const generateUniqueCUI = () => {
  const timestamp = Date.now();
  const randomNum = Math.floor(Math.random() * 10000);
  return `${timestamp}${randomNum}`;
};

describe("Create Ficha integration tests", () => {
  beforeAll(() => {
    // Preparar el entorno de prueba si es necesario, como insertar datos en la base de datos.
  });

  afterAll(() => {
    // Limpiar el entorno de prueba si es necesario, como eliminar los datos insertados en la base de datos.
  });

  test("Normal case: Crear una nueva ficha de paciente", async () => {
    const UNIQUECUI = generateUniqueCUI();
    const pacienteData = {
      cui: UNIQUECUI,
      nombres: "Juan",
      apellidos: "Pérez",
      esMujer: false,
      fechaNacimiento: "1990-01-01",
    };
    const response = await axios.post(`${LOCAL_API_URL}/patient`, pacienteData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });

  test("Crear una nueva ficha de paciente sin CUI (debería fallar)", async () => {
    const pacienteData = {
      nombres: "Juan",
      apellidos: "Pérez",
      esMujer: false,
      fechaNacimiento: "1990-01-01",
    };

    const response = await axios.post(`${LOCAL_API_URL}/patient`, pacienteData, {
      validateStatus: () => true, // Para que axios no lance un error en caso de status >= 400
    });

    // Verificar que el error sea el esperado
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("CUI es requerido.");
  });

  test("Crear una nueva ficha de paciente con CUI duplicado (debería fallar)", async () => {
    const uniqueCUI = generateUniqueCUI();
    const pacienteData1 = {
      cui: uniqueCUI,
      nombres: "Juan",
      apellidos: "Pérez",
      esMujer: false,
      fechaNacimiento: "1990-01-01",
    };
    const pacienteData2 = {
      cui: uniqueCUI,
      nombres: "Carlos",
      apellidos: "González",
      esMujer: false,
      fechaNacimiento: "1985-05-05",
    };

    await axios.post(`${LOCAL_API_URL}/patient`, pacienteData1);

    const response = await axios.post(`${LOCAL_API_URL}/patient`, pacienteData2, {
      validateStatus: () => true, // Para que axios no lance un error en caso de status >= 400
    });

    // Verificar que el error sea el esperado
    expect(response.status).toBe(409);
    expect(response.data.error).toBe("CUI ya existe.");
  });
});
