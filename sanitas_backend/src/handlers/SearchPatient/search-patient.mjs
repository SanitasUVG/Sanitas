import { getPgClient, isDoctor, SCHEMA_NAME, transaction } from "db-conn";
import { logger, withRequest } from "logging";
import { createResponse, decodeJWT, toSafeEvent } from "utils/index.mjs";

/**
 * @typedef {Object} RequestParams
 * @property {string} requestSearch - The search parameter.
 * @property {string} searchType - The type of search to be performed.
 */

/**
 * Checks the parameters for the searchPatientHandler.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event - The event object received by the handler.
 * @returns {{isValidRequest: true, requestParams: RequestParams} | {isValidRequest: false, errorResponse: import('aws-lambda').APIGatewayProxyResult}}
 */
const checkParameters = (event) => {
	if (event.httpMethod !== "POST") {
		return {
			isValidRequest: false,
			errorResponse: {
				statusCode: 405,
				body: JSON.stringify({
					error: `searchPatientHandler only accepts POST method, you tried: ${event.httpMethod}`,
				}),
			},
		};
	}

	const { requestSearch, searchType } = JSON.parse(event.body);
	logger.info({ headers: event.headers }, "Received headers...");
	logger.info({ requestSearch, searchType }, "Received search parameters!");

	logger.info("Parsing requestSearch...");
	if (!requestSearch) {
		return {
			isValidRequest: false,
			errorResponse: {
				statusCode: 400,
				body: JSON.stringify({
					error: "Search parameter must be provided and cannot be empty",
				}),
			},
		};
	}

	logger.info("Parsing searchType...");
	if (!searchType) {
		return {
			isValidRequest: false,
			errorResponse: {
				statusCode: 400,
				body: JSON.stringify({
					error: "Search type not provided",
				}),
			},
		};
	}

	logger.info("Parameters are valid!");
	return {
		isValidRequest: true,
		requestParams: { requestSearch, searchType },
	};
};

/**
 * Handles patient search queries based on ID, employee code, or partial names and surnames.
 */
export const searchPatientHandler = async (event, context) => {
	// All log statements are written to CloudWatch
	withRequest(event, context);
	const responseBuilder = createResponse().addCORSHeaders("POST");

	// Call checkParameters to validate the request parameters
	const paramCheckResult = checkParameters(event);
	if (paramCheckResult.isValidRequest === false) {
		return paramCheckResult.errorResponse;
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

	const { requestSearch, searchType } = paramCheckResult.requestParams;

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();
		logger.info("Connected to DB!");

		const transactionResult = await transaction(client, logger, async () => {
			const itsDoctor = await isDoctor(client, email);
			if (itsDoctor.error) {
				const msg =
					"An error occurred while trying to check if user is doctor!";
				logger.error({ err: itsDoctor.error, inputs: { email } }, msg);
				const response = responseBuilder
					.setStatusCode(500)
					.setBody({ error: msg })
					.build();
				return { response };
			}

			if (!itsDoctor) {
				const msg = "Unauthorized, you're not a doctor!";
				const body = { error: msg };
				logger.error(body, msg);
				const response = responseBuilder
					.setStatusCode(401)
					.setBody(body)
					.build();
				return { response };
			}
			logger.info(`${email} is a doctor!`);

			let sqlQuery = "";
			const queryParams = [];

			switch (searchType) {
				case "Carnet":
					sqlQuery = `SELECT id, cui, nombres, apellidos, fecha_nacimiento
							FROM ${SCHEMA_NAME}.paciente p
								JOIN ${SCHEMA_NAME}.estudiante e ON p.id = e.id_paciente
							WHERE CARNET = $1`;
					queryParams.push(requestSearch);
					logger.info({ sqlQuery, queryParams }, "Querying by student ID");
					break;
				case "NumeroColaborador":
					sqlQuery = `SELECT id, cui, nombres, apellidos, fecha_nacimiento
					FROM ${SCHEMA_NAME}.paciente p
						JOIN ${SCHEMA_NAME}.colaborador c ON p.id = c.id_paciente
					WHERE codigo = $1`;
					queryParams.push(requestSearch);
					logger.info({ sqlQuery, queryParams }, "Querying by employee code");
					break;
				case "CUI":
					sqlQuery = `SELECT id, cui, nombres, apellidos, fecha_nacimiento
					FROM ${SCHEMA_NAME}.paciente
					WHERE cui = $1`;
					queryParams.push(requestSearch);
					logger.info({ sqlQuery, queryParams }, "Querying by CUI");
					break;
				case "Nombres": {
					const request_search_processed = requestSearch
						.normalize("NFD")
						// biome-ignore lint/suspicious/noMisleadingCharacterClass: It detects all accents correctly.
						.replace(/[\u0300-\u036f]/g, "")
						.toLowerCase();

					sqlQuery = `SELECT id, cui, nombres, apellidos, fecha_nacimiento
FROM ${SCHEMA_NAME}.paciente
WHERE (
    SELECT bool_and(match)
    FROM unnest(string_to_array($1, ' ')) as word,
         LATERAL (
             SELECT 
                 TRANSLATE(nombres || ' ' || apellidos, 'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN') 
                 ILIKE '%' || TRANSLATE(word, 'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN') || '%' as match
         ) as matches
)`;
					queryParams.push(`%${request_search_processed}%`);
					logger.info(
						{ sqlQuery, queryParams },
						"Querying by names or surnames",
					);
					break;
				}
				default: {
					const response = responseBuilder
						.setStatusCode(400)
						.setBody({
							isValidRequest: false,
							errorResponse: {
								statusCode: 400,
								body: JSON.stringify({
									error: "Invalid search type received",
								}),
							},
						})
						.build();
					return { response };
				}
			}

			logger.info("Executing DB query...");
			const response = await client.query(sqlQuery, queryParams);
			logger.info(
				{ rowCount: response.rowCount },
				"DB query executed successfully",
			);
			return response;
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

		const { result: response } = transactionResult;

		if (response.rowCount === 0) {
			logger.info("No patients found, returning empty array.");
			return responseBuilder.setStatusCode(200).setBody([]).build();
		}

		return responseBuilder.setStatusCode(200).setBody(response.rows).build();
	} catch (error) {
		const errorDetails = {
			message: error.message,
			stack: error.stack,
			type: error.constructor.name,
		};

		const safeEvent = toSafeEvent(event);

		logger.error(
			{ err: errorDetails, event: safeEvent },
			"An error occurred while searching patient!",
		);

		return responseBuilder
			.setStatusCode(500)
			.setBody({ error: "DB Error" })
			.build();
	} finally {
		await client?.end();
		logger.info("Database connection closed");
	}
};
