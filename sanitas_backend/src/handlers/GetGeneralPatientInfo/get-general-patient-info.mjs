import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

/**
 * Get the general patient information endpoint handler.
 * This endpoint must return all the information contained inside the PATIENT table.
 */
export const handler = async (event, context) => {
  withRequest(event, context);
  if (event.httpMethod !== "GET") {
    throw new Error(
      `/patient/general/{id} only accepts GET method, you tried: ${event.httpMethod}`,
    );
  }

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Connecting to DB...");
    client = getPgClient(url);
    await client.connect();

    logger.info("Checking if received all parameters...");
    const id = event.pathParameters.id;
    if (id !== 0 && !id) {
      logger.error("No ID received!");
      const response = {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*", // Allow from anywhere
          "Access-Control-Allow-Methods": "GET", // Allow only GET request
        },
        body: JSON.stringify({ message: "Invalid request: No patientId supplied!" }),
      };

      return response;
    }
    logger.info("ID received!");

    logger.info("Querying DB...");
    const dbResponse = await client.query("SELECT * FROM paciente WHERE id = $1 LIMIT 1;", [id]);
    logger.info("Query done!");

    if (dbResponse.rowCount === 0) {
      logger.error("No record found!");
      const response = {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Allow-Origin": "*", // Allow from anywhere
          "Access-Control-Allow-Methods": "GET", // Allow only GET request
        },
        body: JSON.stringify({ message: "Invalid request: No patient with the given id found." }),
      };

      return response;
    }

    logger.info("Creating response...");
    const response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*", // Allow from anywhere
        "Access-Control-Allow-Methods": "GET", // Allow only GET request
      },
      body: JSON.stringify(mapToAPIPatient(dbResponse.rows[0])),
    };

    logger.info(response, "Responding with:");
    return response;
  } catch (error) {
    logger.error(error, "An error has ocurred!");
    const response = {
      statusCode: 500,
      body: JSON.stringify(error),
    };
    return response;
  } finally {
    await client?.end();
  }
};

/**
 * @typedef {Object} DBPatient
 * @property {number} id
 * @property {string} cui
 * @property {boolean} es_mujer
 * @property {string} nombres
 * @property {string|null} correo
 * @property {string} apellidos
 *
 * @property {string|null} nombre_contacto1
 * @property {string|null} parentesco_contacto1
 * @property {string|null} telefono_contacto1
 *
 * @property {string|null} nombre_contacto2
 * @property {string|null} parentesco_contacto2
 * @property {string|null} telefono_contacto2
 *
 * @property {string|null} tipo_sangre
 * @property {string|null} direccion
 * @property {number | null} id_seguro
 * @property {string} fecha_nacimiento
 * @property {string|null} telefono
 */

/**
 * @typedef {Object} APIPatient
 * @property {number} id
 * @property {string} cui
 * @property {boolean} isWoman
 * @property {string|null} email
 * @property {string} names
 * @property {string} lastNames
 *
 * @property {string|null} contactName1
 * @property {string|null} contactKinship1
 * @property {string|null} contactPhone1
 *
 * @property {string|null} contactName1
 * @property {string|null} contactKinship1
 * @property {string|null} contactPhone1
 *
 * @property {string|null} bloodType
 * @property {string|null} address
 * @property {number | undefined} insuranceId
 * @property {string} birthdate
 * @property {string|null} phone
 */

/**
 * Maps a DBPatient to an APIPatient.
 * @param {DBPatient} dbPatient The patient received from the DB.
 * @returns {APIPatient} The patient object the API must return.
 */
function mapToAPIPatient(dbPatient) {
  const {
    id,
    cui,
    es_mujer: isWoman,
    correo: email,
    nombres: names,
    apellidos: lastNames,

    nombre_contacto1: contactName1,
    parentesco_contacto1: contactKinship1,
    telefono_contacto1: contactPhone1,

    nombre_contacto2: contactName2,
    parentesco_contacto2: contactKinship2,
    telefono_contacto2: contactPhone2,

    tipo_sangre: bloodType,
    direccion: address,
    id_seguro: insuranceId,
    fecha_nacimiento: birthdate,
    telefono: phone,
  } = dbPatient;

  return {
    id,
    cui,
    email,
    isWoman,
    names,
    lastNames,

    contactName1,
    contactKinship1,
    contactPhone1,

    contactName2,
    contactKinship2,
    contactPhone2,

    bloodType,
    address,
    insuranceId,
    birthdate,
    phone,
  };
}
