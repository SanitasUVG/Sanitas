import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

export const updatePatientHandler = async (event, context) => {
  withRequest(event, context);

  if (event.httpMethod !== "POST") {
    throw new Error(`updatePatientHandler only accepts the POST method, you tried: ${event.httpMethod}`);
  }

  const patientData = JSON.parse(event.body);

  // Logging environment variables
  logger.info(process.env, "Environment variables:");

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Connecting to the database...");
    client = getPgClient(url);
    await client.connect();

    logger.info(patientData, "Updating patient data in the database...");

    // Validating that at least one field is provided for update
    if (Object.keys(patientData).length === 0) {
      throw new Error("No fields provided for update.");
    }

    // Constructing the update query dynamically based on provided fields
    let query = "UPDATE PACIENTE SET ";
    const values = [];
    let index = 1;
    for (const key in patientData) {
      query += `${key.toUpperCase()} = $${index}, `;
      values.push(patientData[key]);
      index++;
    }
    // Removing the trailing comma and space
    query = query.slice(0, -2);
    query += ` WHERE CUI = $${index}`;
    values.push(patientData.cui);

    await client.query(query, values);
    logger.info("Patient data updated successfully.");
  } catch (error) {
    logger.error(error, "An error occurred while updating patient data.");

    let statusCode = 400;
    let errorMessage = "An error occurred while updating patient data.";

    if (error.message === "No fields provided for update.") {
      statusCode = 422; // Unprocessable Entity
      errorMessage = "At least one field is required for update.";
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
    body: JSON.stringify({ message: "Patient data updated successfully." }),
  };

  logger.info(response, "Responding with:");
  return response;
};
