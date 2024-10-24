import { getPgClient, isDoctor, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPICollaboratorInfo,
} from "utils/index.mjs";

/**
 * @param {import("utils/index.mjs").APICollaborator} savedData - The DB saved data.
 * @param {import("utils/index.mjs").APICollaborator} requestData - The request data.
 */
function modifiesData(savedData, requestData) {
	return ["idPatient", "code"].some((key) => {
		if (!Object.hasOwn(requestData, key)) {
			return true;
		}

		return savedData[key] !== requestData[key];
	});
}

export const handler = async (event, context) => {
	withRequest(event, context);
	logger.info({ event }, "Event received:");

	const responseBuilder = createResponse().addCORSHeaders("POST");
	if (event.httpMethod !== "POST") {
		return responseBuilder
			.setStatusCode(405)
			.setBody({ error: "Method Not Allowed" })
			.build();
	}

	logger.info({ headers: event.headers }, "Received headers...");
	const jwt = event.headers.Authorization;

	logger.info({ jwt }, "Parsing JWT...");
	const tokenInfo = decodeJWT(jwt);
	if (tokenInfo.error) {
		logger.error({ error: tokenInfo.error }, "JWT couldn't be parsed!");
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "JWT couldn't be parsed" })
			.build();
	}
	const { email } = tokenInfo;
	logger.info({ tokenInfo }, "JWT Parsed!");

	/** @type {import("utils/index.mjs").APICollaborator} */
	const collaboratorData = JSON.parse(event.body);
	logger.info({ collaboratorData }, "Parsed API Collaborator Data:");
	logger.info(process.env, "Las variables de entorno son:");

	/**@type {import("pg").Client} */
	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Conectando a la base de datos...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected!");

		const itsDoctor = await isDoctor(client, email);
		if (itsDoctor.error) {
			const msg = "An error occurred while trying to check if user is doctor!";
			logger.error({ error: itsDoctor.error }, msg);
			return responseBuilder.setStatusCode(500).setBody({ error: msg }).build();
		}

		if (itsDoctor) {
			const msg = "Unauthorized, you're a doctor!";
			const body = { error: msg };
			logger.error(body, msg);
			return responseBuilder.setStatusCode(401).setBody(body).build();
		}
		logger.info(`${email} is not a doctor!`);

		logger.info(
			{ collaboratorData },
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
			logger.error("No idPatient provided!");
			return responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid input: Missing or empty required fields." })
				.build();
		}

		const transactionResult = await transaction(client, logger, async () => {
			const selectQuery = "SELECT * FROM colaborador WHERE id_paciente = $1";
			const selectValues = [collaboratorData.idPatient];

			logger.info({ selectQuery, selectValues }, "Querying DB...");
			const selectionResult = await client.query(selectQuery, selectValues);
			logger.info("DB query successful!");

			const patientAlreadyRegistered = selectionResult.rowCount > 0;
			const dbData = patientAlreadyRegistered
				? mapToAPICollaboratorInfo(selectionResult.rows[0])
				: null;
			logger.info(
				{ dbData, reqData: collaboratorData },
				"Checking if reqData modifies dbData...",
			);
			if (patientAlreadyRegistered && modifiesData(dbData, collaboratorData)) {
				logger.error("Request modifies saved data!");
				const body = { error: "Unauthorized to modify data!" };
				const response = responseBuilder
					.setStatusCode(403)
					.setBody(body)
					.build();

				return { response };
			}
			logger.info("reqData doesn't modify dbData!");

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
			return result;
		});

		if (transactionResult.error) {
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with:");
			return transactionResult.response;
		}

		const { result } = transactionResult;

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
		let msg = "Internal Server Error";
		let code = 500;

		if (error.code === "23503") {
			msg = "Patient not found with the provided ID.";
			code = 404;
		}

		if (error.code === "23505") {
			msg = "Collaborator code already exists!";
			code = 400;
		}

		return responseBuilder.setStatusCode(code).setBody({ error: msg }).build();
	} finally {
		client?.end();
		logger.info("Database connection closed!");
	}
};
