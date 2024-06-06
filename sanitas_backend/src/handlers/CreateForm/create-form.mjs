import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

export const createFichaHandler = async (event, context) => {
  withRequest(event, context);

  if (event.httpMethod !== "POST") {
    throw new Error(`createFichaHandler only accepts POST method, attempted: ${event.httpMethod}`);
  }

  const patientData = JSON.parse(event.body);

  logger.info(process.env, "Environment variables are:");

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Connecting to the database...");
    client = getPgClient(url);
    await client.connect();

    logger.info(patientData, "Inserting new patient record into the database...");

    // Validating that all required fields are present
    if (!patientData.cui) {
      throw new Error("CUI is required.");
    }
    if (!patientData.names) {
      throw new Error("NAMES is required.");
    }
    if (!patientData.lastNames) {
      throw new Error("LASTNAMES is required.");
    }
    if (patientData.isWoman === undefined) {
      throw new Error("isWoman is required.");
    }
    if (!patientData.birthdate) {
      throw new Error("BIRTHDATE is required.");
    }

    const query = `
      INSERT INTO PACIENTE (CUI, NOMBRES, APELLIDOS, ES_MUJER, FECHA_NACIMIENTO)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [
      patientData.cui,
      patientData.names,
      patientData.lastNames,
      patientData.isWoman,
      new Date(patientData.birthdate),
    ];
    await client.query(query, values);
    logger.info("Patient record created successfully.");
  } catch (error) {
    logger.error(error, "An error occurred while creating the patient record.");

    let statusCode = 400;
    let errorMessage = "An error occurred while creating the patient record.";

    if (error.message === "CUI is required.") {
      errorMessage = "CUI is required.";
    } else if (error.message === "NAMES is required.") {
      errorMessage = "NAMES is required.";
    } else if (error.message === "LASTNAMES is required.") {
      errorMessage = "LASTNAMES is required.";
    } else if (error.message === "isWoman is required.") {
      errorMessage = "isWoman is required.";
    } else if (error.message === "BIRTHDATE is required.") {
      errorMessage = "BIRTHDATE is required.";
    } else if (error.message.includes("violates unique constraint")) {
      statusCode = 409;
      errorMessage = "CUI already exists.";
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
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*", // Allow from anywhere
      "Access-Control-Allow-Methods": "POST", // Allow only POST request
    },
    body: JSON.stringify({ message: "Patient record created successfully." }),
  };

  logger.info(response, "Responding with:");
  return response;
};
