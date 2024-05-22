import { logger, withRequest } from "logging";
import { getPgClient } from "db-conn";

export const createFichaHandler = async (event, context) => {
  withRequest(event, context);

  if (event.httpMethod !== "POST") {
    throw new Error(`createFichaHandler solo acepta el método POST, intentaste: ${event.httpMethod}`);
  }

  const pacienteData = JSON.parse(event.body);

  logger.info(process.env, "Las variables de entorno son:");

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Conectando a la base de datos...");
    client = getPgClient(url);
    await client.connect();

    logger.info(pacienteData, "Insertando nueva ficha en la base de datos...");

    // Validar que todos los campos requeridos estén presentes
    if (!pacienteData.CUI) {
      throw new Error("CUI es requerido.");
    }
    if (!pacienteData.NOMBRES) {
      throw new Error("NOMBRES es requerido.");
    }
    if (!pacienteData.APELLIDOS) {
      throw new Error("APELLIDOS es requerido.");
    }
    if (!pacienteData.SEXO) {
      throw new Error("SEXO es requerido.");
    }
    if (!pacienteData.FECHA_NACIMIENTO) {
      throw new Error("FECHA_NACIMIENTO es requerido.");
    }

    const query = `
      INSERT INTO PACIENTE (CUI, NOMBRES, APELLIDOS, ES_MUJER, FECHA_NACIMIENTO)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [
      pacienteData.CUI,
      pacienteData.NOMBRES,
      pacienteData.APELLIDOS,
      pacienteData.SEXO === "F", 
      new Date(pacienteData.FECHA_NACIMIENTO),
    ];
    await client.query(query, values);
    logger.info("Ficha creada exitosamente.");
  } catch (error) {
    logger.error(error, "¡Se produjo un error al crear la ficha!");

    let statusCode = 400;
    let errorMessage = "Se produjo un error al crear la ficha.";

    if (error.message === "CUI es requerido.") {
      errorMessage = "CUI es requerido.";
    } else if (error.message === "NOMBRES es requerido.") {
      errorMessage = "NOMBRES es requerido.";
    } else if (error.message === "APELLIDOS es requerido.") {
      errorMessage = "APELLIDOS es requerido.";
    } else if (error.message === "SEXO es requerido.") {
      errorMessage = "SEXO es requerido.";
    } else if (error.message === "FECHA_NACIMIENTO es requerido.") {
      errorMessage = "FECHA_NACIMIENTO es requerido.";
    } else if (error.message.includes("violates unique constraint")) {
      statusCode = 409;
      errorMessage = "CUI ya existe.";
    }

    const response = {
      statusCode: statusCode,
      body: JSON.stringify({ error: errorMessage }),
    };
    return response;
  } finally {
    await client?.end();
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: "Ficha creada exitosamente." }),
  };

  logger.info(response, "Respondiendo con:");
  return response;
};
