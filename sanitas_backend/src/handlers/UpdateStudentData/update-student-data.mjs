import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";

/**
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 */
export const handler = async (event, context) => {
  withRequest(event, context);

  if (event.httpMethod !== "PUT") {
    return createResponse().addCORSHeaders().setStatusCode(405).setBody(
      `update student info only accepts PUT method, you tried: ${event.httpMethod}`,
    ).build();
  }

  logger.info("Parsing request...");
  const { patientId, carnet, career } = JSON.parse(event.body);

  if (!patientId) {
    return createResponse().addCORSHeaders().setStatusCode(400).setBody("No patientId was given!").build();
  }

  let client;
  try {
    logger.info(url, "Connecting to DB...");
    const url = process.env.POSTGRES_URL;
    client = getPgClient(url);

    await client.connect();
    logger.info("Connected to DB!");

    logger.info("Starting transaction...");
    await client.query("BEGIN");

    logger.info("Checking if already has data...");
    let sql = "SELECT id_paciente FROM estudiante WHERE id_paciente = $1";
    const { rowCount } = await client.query(sql, [patientId]);

    let studentData;
    if (rowCount < 0) {
      logger.info(patientId, "No student info found for the given ID!");
      logger.info("Creating record for information...");

      sql = "INSERT INTO estudiante (carnet, carrera, id_paciente) VALUES ($1, $2, $3) RETURNING *;";
      const response = await client.query(sql, [carnet, career, patientId]);
      studentData = response.rows[0];
      logger.info(studentData, "Record created!");
    } else {
      logger.info("Student info found! Updating...");

      sql = `UPDATE FROM estudiante SET
			carnet = COALESCE($1, carnet),
			carrera = COALESCE($2, carrera),
			WHERE id_paciente = $3;
			RETURNING *;`;

      const response = await client.query(sql, [carnet, career, patientId]);
      studentData = response.rows[0];
      logger.info(studentData, "Studen info updated!");
    }

    return createResponse().setStatusCode(200).addCORSHeaders().setBody(studentData).build();
  } catch (error) {
    logger.info("Rolling back transaction!");
    await client?.query("ROLLBACK");

    logger.info(error, "An error occurred!");
    return createResponse().setStatusCode(500).addCORSHeaders().setBody("An internal error ocurred").build();
  } finally {
    await client?.end();
    logger.info("Database connection closed!");
  }
};
