import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse } from "utils";
import { mapToAPIAllergicHistory } from "utils/index.mjs";

/**
 * Handles the HTTP PUT request to update or create allergic history for a specific patient.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event
 * @param {import('aws-lambda').APIGatewayProxyResult} context
 * @returns {Promise<import('aws-lambda').APIGatewayProxyResult>} The API response object with status code and body.
 */
export const updateAllergicHistoryHandler = async (event, context) => {
  withRequest(event, context);
  const responseBuilder = createResponse().addCORSHeaders("PUT");

  if (event.httpMethod !== "PUT") {
    return responseBuilder.setStatusCode(405).setBody({ error: "Method Not Allowed" }).build();
  }

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info({ url }, "Connecting to DB...");
    client = getPgClient(url);
    await client.connect();
    logger.info("Connected!");

    const { patientId, allergicHistory } = JSON.parse(event.body);

    if (!patientId) {
      logger.error("No patientId provided!");
      return responseBuilder
        .setStatusCode(400)
        .setBody({ error: "Invalid input: Missing patientId." })
        .build();
    }

    logger.info({ patientId, allergicHistory }, "Received data for updating allergic history");

    const upsertQuery = `
      INSERT INTO antecedentes_alergicos (
        id_paciente,
        medicamento,
        medicamento_data,
        comida,
        comida_data,
        polvo,
        polvo_data,
        polen,
        polen_data,
        cambio_de_clima,
        cambio_de_clima_data,
        animales,
        animales_data,
        otros,
        otros_data
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      )
      ON CONFLICT (id_paciente) DO UPDATE
      SET medicamento = EXCLUDED.medicamento,
          medicamento_data = EXCLUDED.medicamento_data,
          comida = EXCLUDED.comida,
          comida_data = EXCLUDED.comida_data,
          polvo = EXCLUDED.polvo,
          polvo_data = EXCLUDED.polvo_data,
          polen = EXCLUDED.polen,
          polen_data = EXCLUDED.polen_data,
          cambio_de_clima = EXCLUDED.cambio_de_clima,
          cambio_de_clima_data = EXCLUDED.cambio_de_clima_data,
          animales = EXCLUDED.animales,
          animales_data = EXCLUDED.animales_data,
          otros = EXCLUDED.otros,
          otros_data = EXCLUDED.otros_data
      RETURNING *;
    `;

    const values = [
      patientId,
      allergicHistory.medicamento || false,
      JSON.stringify(allergicHistory.medicamentoData || {}),
      allergicHistory.comida || false,
      JSON.stringify(allergicHistory.comidaData || {}),
      allergicHistory.polvo || false,
      JSON.stringify(allergicHistory.polvoData || {}),
      allergicHistory.polen || false,
      JSON.stringify(allergicHistory.polenData || {}),
      allergicHistory.cambioDeClima || false,
      JSON.stringify(allergicHistory.cambioDeClimaData || {}),
      allergicHistory.animales || false,
      JSON.stringify(allergicHistory.animalesData || {}),
      allergicHistory.otros || false,
      JSON.stringify(allergicHistory.otrosData || {}),
    ];

    logger.info({ values }, "Executing upsert query with values");

    const result = await client.query(upsertQuery, values);

    if (result.rowCount === 0) {
      logger.error("No changes were made in the DB!");
      return responseBuilder
        .setStatusCode(404)
        .setBody({ message: "Failed to update allergic history." })
        .build();
    }

    const updatedRecord = result.rows[0];
    logger.info({ updatedRecord }, "Successfully updated allergic history");
    return responseBuilder.setStatusCode(200).setBody(mapToAPIAllergicHistory(updatedRecord)).build();
  } catch (error) {
    logger.error({ error }, "An error occurred while updating allergic history!");

    if (error.code === "23503") {
      return responseBuilder
        .setStatusCode(404)
        .setBody({ error: "No allergic history found for the provided ID." })
        .build();
    }

    return responseBuilder
      .setStatusCode(500)
      .setBody({
        error: "Failed to update allergic history due to an internal error.",
        details: error.message,
      })
      .build();
  } finally {
    if (client) {
      await client.end();
    }
  }
};
