import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

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

export const CollaboratorHandler = async (event, context) => {
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

    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "PUT", // Allow only PUT request
      },
      body: JSON.stringify({
        message: "Datos del colaborador actualizados exitosamente.",
        collaborator: apiUpdatedCollaborator,
      }),
    };

    logger.info(response, "Respondiendo con:");
    return response;
  } catch (error) {
    logger.error(error, "¡Se produjo un error al actualizar los datos del colaborador!");

    let statusCode = 400;
    let errorMessage = "Se produjo un error al actualizar los datos del colaborador.";

    if (error.message === "Código es requerido.") {
      errorMessage = "Código es requerido.";
    } else if (error.message === "No se encontraron registros con el código proporcionado.") {
      errorMessage = "No se encontraron registros con el código proporcionado.";
    } else {
      // Log any unexpected errors for debugging
      logger.error(error, "Unexpected error occurred:");
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
