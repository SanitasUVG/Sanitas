import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";

// Function to map DB collaborator to API collaborator
function mapToAPICollaborator(dbCollaborator) {
  const {
    codigo: code,
    area,
    id_paciente: idPatient,
  } = dbCollaborator;

  return {
    code,
    area,
    idPatient,
  };
}

export const getCollaboratorHandler = async (event, context) => {
  withRequest(event, context);

  logger.info({ event }, "Event received:");

  if (event.httpMethod !== "GET") {
    throw new Error(`getCollaboratorHandler solo acepta el método GET, intentaste: ${event.httpMethod}`);
  }

  const { code } = event.queryStringParameters || {};
  logger.info({ code }, "Query parameter 'code':");

  if (!code) {
    return createResponse()
      .setStatusCode(400)
      .addCORSHeaders()
      .setBody({ error: "El parámetro 'code' es requerido." })
      .build();
  }

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Conectando a la base de datos...");
    client = getPgClient(url);
    await client.connect();

    logger.info({ code }, "Consultando datos del colaborador en la base de datos...");

    const query = "SELECT * FROM colaborador WHERE codigo = $1";
    const values = [code];

    logger.info({ query, values }, "Consulta SQL y valores:");

    const result = await client.query(query, values);
    logger.info({ result }, "Query result:");

    if (result.rowCount === 0) {
      return createResponse()
        .setStatusCode(404)
        .addCORSHeaders()
        .setBody({ error: "No se encontraron registros con el código proporcionado." })
        .build();
    }

    const dbCollaborator = result.rows[0];
    logger.info({ dbCollaborator }, "DB Collaborator Data:");

    const apiCollaborator = mapToAPICollaborator(dbCollaborator);

    logger.info("Datos del colaborador obtenidos exitosamente.");

    return createResponse()
      .setStatusCode(200)
      .addCORSHeaders()
      .setBody(apiCollaborator)
      .build();
  } catch (error) {
    logger.error(error, "Error querying database:");
    await client?.end();

    return createResponse()
      .setStatusCode(500)
      .addCORSHeaders()
      .setBody({ error: "Internal Server Error" })
      .build();
  }
};
