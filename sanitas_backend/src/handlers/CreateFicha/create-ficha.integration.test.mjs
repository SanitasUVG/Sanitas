import axios from "axios";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";

const LOCAL_API_URL = "http://localhost:3000/";

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
    const uniqueCUI = generateUniqueCUI();
    const pacienteData = {
      CUI: uniqueCUI,
      NOMBRES: "Juan",
      APELLIDOS: "Pérez",
      SEXO: "M",
      FECHA_NACIMIENTO: "1990-01-01",
    };
    const response = await axios.post(`${LOCAL_API_URL}/ficha`, pacienteData);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
  });

  test("Crear una nueva ficha de paciente sin CUI (debería fallar)", async () => {
    const pacienteData = {
      NOMBRES: "Juan",
      APELLIDOS: "Pérez",
      SEXO: "M",
      FECHA_NACIMIENTO: "1990-01-01",
    };

    try {
      await axios.post(`${LOCAL_API_URL}/ficha`, pacienteData);
      throw new Error("Ficha creada sin CUI");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toBe("CUI es requerido."); // Asegúrate de que la lambda devuelva este mensaje
      } else {
        throw error;
      }
    }
  });

  test("Crear una nueva ficha de paciente con CUI duplicado (debería fallar)", async () => {
    const uniqueCUI = generateUniqueCUI();
    const pacienteData1 = {
      CUI: uniqueCUI,
      NOMBRES: "Juan",
      APELLIDOS: "Pérez",
      SEXO: "M",
      FECHA_NACIMIENTO: "1990-01-01",
    };
    const pacienteData2 = {
      CUI: uniqueCUI,
      NOMBRES: "Carlos",
      APELLIDOS: "González",
      SEXO: "M",
      FECHA_NACIMIENTO: "1985-05-05",
    };

    await axios.post(`${LOCAL_API_URL}/ficha`, pacienteData1);

    try {
      await axios.post(`${LOCAL_API_URL}/ficha`, pacienteData2);
      throw new Error("Ficha creada con CUI duplicado");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.error).toBe("CUI ya existe.");
      } else {
        throw error;
      }
    }
  });
});
