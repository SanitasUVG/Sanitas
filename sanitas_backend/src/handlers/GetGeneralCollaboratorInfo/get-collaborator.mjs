import { getPgClient, isDoctor, isEmailOfPatient } from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPICollaboratorInfo,
} from "utils/index.mjs";

/**
 * Get the collaborator information endpoint handler.
 * This endpoint must return all the information contained inside the COLABORADOR table for a specific collaborator.
 */
export const getCollaboratorHandler = async (event, context) => {
	withRequest(event, context);

	const responseBuilder = createResponse().addCORSHeaders();
	if (event.httpMethod !== "GET") {
		const msg = `/patient/collaborator/{id} only accepts GET method, you tried: ${event.httpMethod}`;
		return responseBuilder.setStatusCode(403).setBody({ error: msg }).build();
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

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();

		logger.info("Checking if received all parameters...");
		const patientId = event.pathParameters.id;
		if (!patientId) {
			logger.error("No id received!");
			const response = responseBuilder
				.setStatusCode(400)
				.setBody({ error: "Invalid request: No id supplied!" })
				.build();

			return response;
		}
		logger.info("ID received!");

		logger.info("Checking if user is doctor...");
		const itsDoctor = await isDoctor(client, email);
		if (itsDoctor.error) {
			const msg =
				"An error occurred while trying to check if the user is a doctor!";
			logger.error(itsDoctor, msg);
			return responseBuilder.setStatusCode(500).setBody(itsDoctor).build();
		}

		if (!itsDoctor) {
			logger.info("User is patient!");
			logger.info(
				{ email, patientId },
				"Checking if email belongs to patient id",
			);
			const emailBelongs = await isEmailOfPatient(client, email, patientId);

			if (emailBelongs.error) {
				const msg =
					"An error ocurred while trying to check if the email belongs to the patient!";
				logger.error(emailBelongs, msg);
				return responseBuilder.setStatusCode(500).setBody(emailBelongs).build();
			}

			if (!emailBelongs) {
				const msg = "The email doesn't belong to the patient id!";
				logger.error({ email, patientId }, msg);
				return responseBuilder
					.setStatusCode(400)
					.setBody({ error: msg })
					.build();
			}
			logger.info("The email belongs to the patient!");
		} else {
			logger.info("The user is a doctor!");
		}

		logger.info("Querying DB...");
		const dbResponse = await client.query(
			"SELECT * FROM colaborador WHERE ID_PACIENTE = $1 LIMIT 1;",
			[patientId],
		);
		logger.info(dbResponse, "Query done!");

		if (dbResponse.rowCount === 0) {
			logger.error("No record found! Returning default data");

			return createResponse()
				.setStatusCode(200)
				.addCORSHeaders()
				.setBody({ idPatient: patientId, code: null, area: null })
				.build();
		}

		logger.info("Creating response...");

		logger.info(dbResponse.rows[0], "Responding with:");
		return responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPICollaboratorInfo(dbResponse.rows[0]))
			.build();
	} catch (error) {
		logger.error(error, "An error has occurred!");
		return responseBuilder.setStatusCode(500).setBody(error).build();
	} finally {
		await client?.end();
	}
};
