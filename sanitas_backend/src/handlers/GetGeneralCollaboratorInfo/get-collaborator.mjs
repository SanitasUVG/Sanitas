import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";

// Función para mapear el colaborador de la base de datos al formato del API
function mapToAPICollaborator(dbCollaborator) {
  const { codigo: code, area, id_paciente: idPatient } = dbCollaborator;

  return {
    code,
    area,
    idPatient,
  };
}

export const getCollaboratorHandler = async (event, context) => {
  withRequest(event, context);

  logger.info({ event }, "Evento recibido:");

  if (event.httpMethod !== "GET") {
    throw new Error(`getCollaboratorHandler solo acepta el método GET, intentaste: ${event.httpMethod}`);
  }

  const { idPatient } = event.queryStringParameters || {};

  if (!idPatient) {
    return createResponse()
      .setStatusCode(400)
      .addCORSHeaders()
      .setBody({ error: "El parámetro 'idPatient' es requerido." })
      .build();
  }

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Conectando a la base de datos...");
    client = getPgClient(url);
    await client.connect();

    logger.info({ idPatient }, "Obteniendo datos del colaborador desde la base de datos...");

    const query = `
      SELECT codigo, area, id_paciente
      FROM colaborador
      WHERE id_paciente = $1
    `;
    const values = [idPatient];

    logger.info({ query, values }, "Consulta SQL y valores:");

    const result = await client.query(query, values);
    logger.info({ result }, "Resultado de la consulta:");

    if (result.rowCount === 0) {
      return createResponse()
        .setStatusCode(404)
        .addCORSHeaders()
        .setBody({ error: "No se encontraron registros con el id de paciente proporcionado." })
        .build();
    }

    const collaborator = result.rows[0];
    const apiCollaborator = mapToAPICollaborator(collaborator);

    return createResponse()
      .setStatusCode(200)
      .addCORSHeaders()
      .setBody(apiCollaborator)
      .build();
  } catch (error) {
    logger.error(error, "Error al consultar la base de datos:");
    await client?.end();

    return createResponse()
      .setStatusCode(500)
      .addCORSHeaders()
      .setBody({ error: "Error Interno del Servidor" })
      .build();
  }
};
