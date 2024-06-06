import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

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
    if (!pacienteData.cui) {
      throw new Error("CUI es requerido.");
    }
    if (!pacienteData.nombres) {
      throw new Error("NOMBRES es requerido.");
    }
    if (!pacienteData.apellidos) {
      throw new Error("APELLIDOS es requerido.");
    }
    if (pacienteData.esMujer === undefined) {
      throw new Error("esMujer es requerido.");
    }
    if (!pacienteData.fechaNacimiento) {
      throw new Error("FECHA_NACIMIENTO es requerido.");
    }

    const query = `
      INSERT INTO PACIENTE (CUI, NOMBRES, APELLIDOS, ES_MUJER, FECHA_NACIMIENTO)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING * 
    `;
    const values = [
      pacienteData.cui,
      pacienteData.nombres,
      pacienteData.apellidos,
      pacienteData.esMujer,
      new Date(pacienteData.fechaNacimiento),
    ];
    const query_response = await client.query(query, values);
    const id = query_response.rows[0].id;
    logger.info("Ficha creada exitosamente.");

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "POST", // Allow only POST request
      },
      body: JSON.stringify(id),
    };

    logger.info(response, "Respondiendo con:");
    return response;
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
    } else if (error.message === "esMujer es requerido.") {
      errorMessage = "esMujer es requerido.";
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
};
