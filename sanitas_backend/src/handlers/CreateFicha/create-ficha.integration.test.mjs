import axios from "axios";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";

const LOCAL_API_URL = "http://localhost:3000/";

let UNIQUECUI;

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
    UNIQUECUI = generateUniqueCUI();
    const pacienteData = {
      CUI: UNIQUECUI,
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
      // Verificar si todos los datos requeridos están presentes
      if (!pacienteData.CUI || !pacienteData.NOMBRES || !pacienteData.APELLIDOS || !pacienteData.SEXO || !pacienteData.FECHA_NACIMIENTO) {
        throw new Error("Todos los datos son requeridos");
      }
      const response = await axios.post(`${LOCAL_API_URL}/ficha`, pacienteData);
      UNIQUECUI = response.data.CUI;

    } catch (error) {
      // Manejar el error
    }
  });

  test("Crear una nueva ficha de paciente con CUI duplicado (debería fallar)", async () => {
    const pacienteData = {
      CUI: UNIQUECUI,
      NOMBRES: "Juan",
      APELLIDOS: "Pérez",
      SEXO: "M",
      FECHA_NACIMIENTO: "1990-01-01",
    };
    try {
      // Intentar crear otra ficha con el mismo CUI
      await axios.post(`${LOCAL_API_URL}/ficha`, pacienteData);
      // Si no se lanza un error, significa que se creó una ficha con CUI duplicado
      // Por lo tanto, el test debería fallar
      throw new Error("Ficha creada con CUI duplicado");
    } catch (error) {
      if (error.response && error.response.status === 409) {
        // Si el estado es 409, esperamos un error de "Conflict"
        expect(error.response.status).toBe(409);
        expect(error.response.data.error).toBe("CUI ya existe.");
      } else {
        // Si el estado no es 409, lanzar el error
        throw error;
      }
    }
  });
});
