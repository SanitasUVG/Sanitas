import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { mapToAPIPatient } from "utils";

function mapToDbPatient(apiPatient) {
  const {
    id,
    cui,
    isWoman: es_mujer,
    email: correo,
    names: nombres,
    lastNames: apellidos,

    contactName1: nombre_contacto1,
    contactKinship1: parentesco_contacto1,
    contactPhone1: telefono_contacto1,

    contactName2: nombre_contacto2,
    contactKinship2: parentesco_contacto2,
    contactPhone2: telefono_contacto2,

    bloodType: tipo_sangre,
    address: direccion,
    insuranceId: id_seguro,
    birthdate: fecha_nacimiento,
    phone: telefono,
  } = apiPatient;

  return {
    id,
    cui,
    es_mujer,
    correo,
    nombres,
    apellidos,
    nombre_contacto1,
    parentesco_contacto1,
    telefono_contacto1,
    nombre_contacto2,
    parentesco_contacto2,
    telefono_contacto2,
    tipo_sangre,
    direccion,
    id_seguro,
    fecha_nacimiento,
    telefono,
  };
}

export const updatePatientHandler = async (event, context) => {
  withRequest(event, context);

  if (event.httpMethod !== "PUT") {
    throw new Error(`updatePatientHandler solo acepta el método PUT, intentaste: ${event.httpMethod}`);
  }

  const apiPatientData = JSON.parse(event.body);
  const patientData = mapToDbPatient(apiPatientData);

  logger.info(process.env, "Las variables de entorno son:");

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Conectando a la base de datos...");
    client = getPgClient(url);
    await client.connect();

    logger.info(patientData, "Actualizando datos del paciente en la base de datos...");

    if (!patientData.id) {
      throw new Error("ID es requerido.");
    }

    const query = `
      UPDATE paciente
      SET 
        nombres = COALESCE($2, nombres),
        apellidos = COALESCE($3, apellidos),
        nombre_contacto1 = COALESCE($4, nombre_contacto1),
        parentesco_contacto1 = COALESCE($5, parentesco_contacto1),
        telefono_contacto1 = COALESCE($6, telefono_contacto1),
        nombre_contacto2 = COALESCE($7, nombre_contacto2),
        parentesco_contacto2 = COALESCE($8, parentesco_contacto2),
        telefono_contacto2 = COALESCE($9, telefono_contacto2),
        tipo_sangre = COALESCE($10, tipo_sangre),
        direccion = COALESCE($11, direccion),
        id_seguro = COALESCE($12, id_seguro),
        fecha_nacimiento = COALESCE($13, fecha_nacimiento),
        telefono = COALESCE($14, telefono),
        cui = COALESCE($15, cui),
        correo = COALESCE($16, correo),
        es_mujer = COALESCE($17, es_mujer)
      WHERE id = $1
      RETURNING *
    `;
    const values = [
      patientData.id,
      patientData.nombres || null,
      patientData.apellidos || null,
      patientData.nombre_contacto1 || null,
      patientData.parentesco_contacto1 || null,
      patientData.telefono_contacto1 || null,
      patientData.nombre_contacto2 || null,
      patientData.parentesco_contacto2 || null,
      patientData.telefono_contacto2 || null,
      patientData.tipo_sangre || null,
      patientData.direccion || null,
      patientData.id_seguro || null,
      patientData.fecha_nacimiento ? new Date(patientData.fecha_nacimiento) : null,
      patientData.telefono || null,
      patientData.cui || null,
      patientData.correo || null,
      patientData.es_mujer || null,
    ];

    logger.info({ query, values }, "Consulta SQL y valores:");

    const result = await client.query(query, values);

    if (result.rowCount === 0) {
      throw new Error("No se encontraron registros con el ID proporcionado.");
    }

    logger.info("Datos del paciente actualizados exitosamente.");
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "PUT", // Allow only PUT request
      },
      body: JSON.stringify(mapToAPIPatient(result.rows[0])),
    };

    logger.info(response, "Respondiendo con:");
    return response;
  } catch (error) {
    logger.error(error, "¡Se produjo un error al actualizar los datos del paciente!");

    let statusCode = 400;
    let errorMessage = "Se produjo un error al actualizar los datos del paciente.";

    if (error.message === "ID es requerido.") {
      errorMessage = "ID es requerido.";
    } else if (error.message === "No se encontraron registros con el ID proporcionado.") {
      errorMessage = "No se encontraron registros con el ID proporcionado.";
    }

    const response = {
      statusCode: statusCode,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "PUT", // Allow only PUT request
      },
      body: JSON.stringify({ error: errorMessage }),
    };
    return response;
  } finally {
    await client?.end();
  }
};
