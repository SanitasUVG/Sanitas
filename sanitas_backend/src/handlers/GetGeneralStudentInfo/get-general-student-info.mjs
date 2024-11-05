import {
	getPgClient,
	isDoctor,
	isEmailOfPatient,
	SCHEMA_NAME,
	transaction,
} from "db-conn";
import { logger, withRequest } from "logging";
import {
	createResponse,
	decodeJWT,
	mapToAPIStudentInfo,
	toSafeEvent,
} from "utils/index.mjs";

/**
 * Get the student information endpoint handler.
 * This endpoint must return all the information contained inside the ESTUDIANTE table for a specific student.
 */
export const handler = async (event, context) => {
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders();
	if (event.httpMethod !== "GET") {
		const msg = `/patient/student/{id} only accepts GET method, you tried: ${event.httpMethod}`;
		logger.error(msg);
		return responseBuilder.setStatusCode(405).setBody({ error: msg }).build();
	}

	logger.info({ headers: event.headers }, "Received headers...");
	const jwt = event.headers.Authorization;

	logger.info({ jwt }, "Parsing JWT...");
	const tokenInfo = decodeJWT(jwt);
	if (tokenInfo.error) {
		logger.error(
			{ err: tokenInfo.error, inputs: { jwt } },
			"JWT couldn't be parsed!",
		);
		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "JWT couldn't be parsed" })
			.build();
	}
	const { email } = tokenInfo;
	logger.info({ tokenInfo }, "JWT Parsed!");

	logger.info("Checking if received all parameters...");
	const patientId = Number.parseInt(event.pathParameters.id);
	if (!patientId) {
		logger.error({ patientId: event.pathParameters?.id }, "No id received!");

		return responseBuilder
			.setStatusCode(400)
			.setBody({ error: "Invalid request: No valid id supplied!" })
			.build();
	}
	logger.info("patientId received!");

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();

		const transactionResult = await transaction(client, logger, async () => {
			logger.info("Checking if user is doctor...");
			const itsDoctor = await isDoctor(client, email);
			if (itsDoctor.error) {
				const msg =
					"An error occurred while trying to check if the user is a doctor!";
				logger.error({ err: itsDoctor.error, inputs: { email } }, msg);
				const response = responseBuilder
					.setStatusCode(500)
					.setBody(itsDoctor)
					.build();
				return { response };
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
					logger.error(
						{ err: emailBelongs.error, inputs: { email, patientId } },
						msg,
					);
					const response = responseBuilder
						.setStatusCode(500)
						.setBody(emailBelongs)
						.build();
					return { response };
				}

				if (!emailBelongs) {
					const msg = "The email doesn't belong to the patient id!";
					logger.error({ email, patientId }, msg);

					const response = responseBuilder
						.setStatusCode(400)
						.setBody({ error: msg })
						.build();
					return { response };
				}
				logger.info("The email belongs to the patient!");
			} else {
				logger.info("The user is a doctor!");
			}

			logger.info("Querying DB...");
			const dbResponse = await client.query(
				`SELECT * FROM ${SCHEMA_NAME}.estudiante WHERE id_paciente = $1 LIMIT 1;`,
				[patientId],
			);

			logger.info(dbResponse, "Query done!");
			return dbResponse;
		});

		if (transactionResult.error) {
			logger.error(
				{ err: transactionResult.error },
				"An error occurred during the database transaction!",
			);
			throw transactionResult.error;
		}

		if (transactionResult.response) {
			logger.info(transactionResult, "Responding with:");
			return transactionResult.response;
		}

		const { result: dbResponse } = transactionResult;

		if (dbResponse.rowCount === 0) {
			/** @type {import("utils/index.mjs").APIStudentInfo} */
			const defaultStudentInfo = {
				idPatient: patientId,
				carnet: null,
				career: null,
			};
			logger.error(
				{ defaultStudentInfo },
				"No record found! Returning empty data...",
			);

			return responseBuilder
				.setStatusCode(200)
				.setBody(defaultStudentInfo)
				.build();
		}

		const response = responseBuilder
			.setStatusCode(200)
			.setBody(mapToAPIStudentInfo(dbResponse.rows[0]))
			.build();

		logger.info({ response }, "Responding with:");
		return response;
	} catch (error) {
		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while fetching general student info!",
		);
		return responseBuilder.setStatusCode(500).setBody(error).build();
	} finally {
		await client?.end();
	}
};
