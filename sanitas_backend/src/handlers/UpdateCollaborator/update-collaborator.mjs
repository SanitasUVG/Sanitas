import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";

// Funciones de mapeo
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

function mapToDbCollaborator(apiCollaborator) {
  const {
    code: codigo,
    area,
    idPatient: id_paciente,
  } = apiCollaborator;

  return {
    codigo,
    area,
    id_paciente,
  };
}

export const updateCollaboratorHandler = async (event, context) => {
  withRequest(event, context);

  logger.info({ event }, "Event received:");

  if (event.httpMethod !== "PUT") {
    throw new Error(`updateCollaboratorHandler solo acepta el método PUT, intentaste: ${event.httpMethod}`);
  }

  const apiCollaboratorData = JSON.parse(event.body);
  logger.info({ apiCollaboratorData }, "Parsed API Collaborator Data:");

  const collaboratorData = mapToDbCollaborator(apiCollaboratorData);
  logger.info({ collaboratorData }, "Mapped DB Collaborator Data:");

  logger.info(process.env, "Las variables de entorno son:");

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Conectando a la base de datos...");
    client = getPgClient(url);
    await client.connect();

    logger.info(collaboratorData, "Actualizando datos del colaborador en la base de datos...");

    if (!collaboratorData.codigo) {
      throw new Error("Código es requerido.");
    }

    const query = `
      UPDATE colaborador
      SET 
        area = COALESCE($2, area),
        id_paciente = COALESCE($3, id_paciente)
      WHERE codigo = $1
      RETURNING *
    `;
    const values = [
      collaboratorData.codigo,
      collaboratorData.area || null,
      collaboratorData.id_paciente || null,
    ];

    logger.info({ query, values }, "Consulta SQL y valores:");

    const result = await client.query(query, values);
    logger.info({ result }, "Query result:");

    if (result.rowCount === 0) {
      throw new Error("No se encontraron registros con el código proporcionado.");
    }

    const updatedCollaborator = result.rows[0];
    logger.info({ updatedCollaborator }, "Updated Collaborator Data:");

    const apiUpdatedCollaborator = mapToAPICollaborator(updatedCollaborator);

    logger.info("Datos del colaborador actualizados exitosamente.");

    return createResponse()
      .setStatusCode(200)
      .addCORSHeaders()
      .setBody(apiUpdatedCollaborator)
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
