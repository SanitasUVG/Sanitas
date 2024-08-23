import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, mapToAPICollaboratorInfo } from "utils/index.mjs";

export const updateCollaboratorHandler = async (event, context) => {
	withRequest(event, context);
	logger.info({ event }, "Event received:");

	const responseBuilder = createResponse().addCORSHeaders("PUT");
	if (event.httpMethod !== "PUT") {
		return responseBuilder
			.setStatusCode(405)
			.setBody({ error: "Method Not Allowed" })
			.build();
	}

	/** @type {import("utils/index.mjs").APICollaborator} */
	const collaboratorData = JSON.parse(event.body);
	logger.info({ collaboratorData }, "Parsed API Collaborator Data:");
	logger.info(process.env, "Las variables de entorno son:");

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Conectando a la base de datos...");
		client = getPgClient(url);
		await client.connect();

		logger.info(
			collaboratorData,
			"Actualizando datos del colaborador en la base de datos...",
		);

		if (!collaboratorData.code) {
			logger.error("No code provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		if (!collaboratorData.idPatient) {
			logger.error("No patientId provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		const query = `
			INSERT INTO colaborador (id_paciente, codigo, area)
			VALUES ($1, $2, $3)
			ON CONFLICT (id_paciente) DO UPDATE
			SET codigo = COALESCE(EXCLUDED.codigo, colaborador.codigo),
					area = COALESCE(EXCLUDED.area, colaborador.area)
			RETURNING *;
		`;
		const values = [
			collaboratorData.idPatient || null,
			collaboratorData.code,
			collaboratorData.area || null,
		];

		logger.info({ query, values }, "Inserting/Updating values in DB...");
		const result = await client.query(query, values);
		logger.info("Done inserting/updating!");

		if (result.rowCount === 0) {
			logger.error("No value was inserted/updated in the DB!");
			return responseBuilder
				.setStatusCode(404)
				.setBody({
					message: "Failed to insert or update traumatologic history.",
				})
				.build();
		}

		const updatedCollaborator = result.rows[0];
		const apiUpdatedCollaborator =
			mapToAPICollaboratorInfo(updatedCollaborator);
		logger.info(
			{ apiUpdatedCollaborator },
			"Datos del colaborador actualizados exitosamente.",
		);

		return responseBuilder
			.setStatusCode(200)
			.setBody(apiUpdatedCollaborator)
			.build();
	} catch (error) {
		logger.error({ error }, "Error querying database:");
		await client?.end();

		if (error.code === "23503") {
			return responseBuilder
				.setStatusCode(404)
				.setBody({ error: "Patient not found with the provided ID." })
				.build();
		}

		return responseBuilder
			.setStatusCode(500)
			.setBody({ error: "Internal Server Error" })
			.build();
	}
};
