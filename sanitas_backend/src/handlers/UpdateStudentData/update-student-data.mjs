import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, mapToAPIStudentInfo } from "utils";

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

  logger.info({ body: event.body }, "Parsing request...");
  const { patientId, carnet, career } = JSON.parse(event.body);

  if (!patientId) {
    logger.error("No patient ID provided!");
    return createResponse().addCORSHeaders().setStatusCode(400).setBody({ error: "No patientId was given!" }).build();
  }

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, "Connecting to DB...");
    client = getPgClient(url);

    await client.connect();
    logger.info("Connected to DB!");

    logger.info("Starting transaction...");
    await client.query("BEGIN");

    let sql = "SELECT id FROM paciente WHERE id = $1";
    let params = [patientId];

    logger.info({ sql, params }, "Checking if patient exists...");
    let { rowCount } = await client.query(sql, params);

    if (rowCount <= 0) {
      logger.error("No patient with the given ID found!");
      await client.query("COMMIT");
      return createResponse().setStatusCode(400).addCORSHeaders().setBody({
        error: "No patient with the given ID found!",
      }).build();
    }

    sql = "SELECT id_paciente FROM estudiante WHERE id_paciente = $1";
    params = [patientId];
    logger.info({ sql, params }, "Checking if already has data in...");
    rowCount = (await client.query(sql, [patientId])).rowCount;

    let studentData;
    if (rowCount <= 0) {
      logger.info(patientId, "No student info found for the given ID!");

      sql = "INSERT INTO estudiante (carnet, carrera, id_paciente) VALUES ($1, $2, $3) RETURNING *;";
      params = [carnet, career, patientId];

      logger.info({ sql, params }, "Creating record for information...");
      const response = await client.query(sql, [carnet, career, patientId]);

      studentData = response.rows[0];
      logger.info(studentData, "Record created!");
    } else {
      sql = `UPDATE estudiante SET
			carnet = COALESCE($1, carnet),
			carrera = COALESCE($2, carrera)
			WHERE id_paciente = $3
			RETURNING *;`;
      params = [carnet, career, patientId];

      logger.info({ sql, params }, "Student info found! Updating...");
      const response = await client.query(sql, [carnet, career, patientId]);

      studentData = response.rows[0];
      logger.info(studentData, "Studen info updated!");
    }

    logger.info("Comitting transaction...");
    await client.query("COMMIT");
    logger.info("Transaction comitted!");

    return createResponse().setStatusCode(200).addCORSHeaders().setBody(mapToAPIStudentInfo(studentData)).build();
  } catch (error) {
    logger.warn("Rolling back transaction!");
    await client?.query("ROLLBACK");

    logger.error(error, "An error occurred!");
    return createResponse().setStatusCode(500).addCORSHeaders().setBody("An internal error ocurred").build();
  } finally {
    await client?.end();
    logger.info("Database connection closed!");
  }
};
