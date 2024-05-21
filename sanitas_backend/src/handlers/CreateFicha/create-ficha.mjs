import { logger, withRequest } from "logging";
import { getPgClient } from "db-conn";

/**
 * Handler para crear una nueva ficha de paciente.
 */
export const createFichaHandler = async (event, context) => {
  withRequest(event, context);

  if (event.httpMethod !== "POST") {
    throw new Error(
      `createFichaHandler solo acepta el método POST, intentaste: ${event.httpMethod}`,
    );
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
    
    const query = `
      INSERT INTO PACIENTE (CUI, NOMBRES, APELLIDOS, ES_MUJER, FECHA_NACIMIENTO)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [
      pacienteData.CUI,
      pacienteData.NOMBRES,
      pacienteData.APELLIDOS,
      pacienteData.SEXO === "F", // Convertir a booleano según el sexo
      new Date(pacienteData.FECHA_NACIMIENTO),
    ];
    await client.query(query, values);
    logger.info("Ficha creada exitosamente.");
    
    const response = {
      statusCode: 200,
      body: JSON.stringify({ message: "Ficha creada exitosamente." }),
    };

    logger.info(response, "Respondiendo con:");
    return response;

  } catch (error) {
    logger.error(error, "¡Se produjo un error al crear la ficha!");

    let statusCode = 400;
    let errorMessage = "Se produjo un error al crear la ficha.";

    if (error.code === '23505') { // Código de error de clave duplicada en PostgreSQL
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
