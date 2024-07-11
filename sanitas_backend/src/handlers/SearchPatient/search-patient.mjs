import { getPgClient } from "db-conn";
import { logger, withRequest } from "logging";

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

	// Call checkParameters to validate the request parameters
	const paramCheckResult = checkParameters(event);
	if (paramCheckResult.isValidRequest === false) {
		return paramCheckResult.errorResponse;
	}

	const { requestSearch, searchType } = paramCheckResult.requestParams;

	let client;
	try {
		const url = process.env.POSTGRES_URL;
		logger.info(url, "Connecting to DB...");
		client = getPgClient(url);
		await client.connect();

		let sqlQuery = "";
		const queryParams = [];

		switch (searchType) {
			case "Carnet":
				sqlQuery =
					"SELECT ID, CUI, NOMBRES, APELLIDOS, FECHA_NACIMIENTO FROM PACIENTE JOIN ESTUDIANTE ON PACIENTE.ID = ESTUDIANTE.ID_PACIENTE WHERE CARNET = $1";
				queryParams.push(requestSearch);
				logger.info({ sqlQuery, queryParams }, "Querying by student ID");
				break;
			case "NumeroColaborador":
				sqlQuery =
					"SELECT ID, CUI, NOMBRES, APELLIDOS, FECHA_NACIMIENTO FROM PACIENTE JOIN COLABORADOR ON PACIENTE.ID = COLABORADOR.ID_PACIENTE WHERE CODIGO = $1";
				queryParams.push(requestSearch);
				logger.info({ sqlQuery, queryParams }, "Querying by employee code");
				break;
			case "CUI":
				sqlQuery =
					"SELECT ID, CUI, NOMBRES, APELLIDOS, FECHA_NACIMIENTO FROM PACIENTE WHERE CUI = $1";
				queryParams.push(requestSearch);
				logger.info({ sqlQuery, queryParams }, "Querying by CUI");
				break;
			case "Nombres": {
				const request_search_processed = requestSearch
					.normalize("NFD")
					// biome-ignore lint/suspicious/noMisleadingCharacterClass: The Unicode codes below remove only accents.
					.replace(/[\u0300-\u036f]/g, "")
					.toLowerCase();

				sqlQuery = `
                SELECT ID, CUI, NOMBRES, APELLIDOS, FECHA_NACIMIENTO 
                FROM PACIENTE 
                WHERE TRANSLATE(NOMBRES, 'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN') ILIKE $1 
                OR TRANSLATE(APELLIDOS, 'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN') ILIKE $1`;
				queryParams.push(`%${request_search_processed}%`);
				logger.info({ sqlQuery, queryParams }, "Querying by names or surnames");
				break;
			}
			default:
				return {
					statusCode: 400,
					body: JSON.stringify({
						isValidRequest: false,
						errorResponse: {
							statusCode: 400,
							body: JSON.stringify({
								error: "Invalid search type received",
							}),
						},
					}),
				};
		}

		logger.info("Executing DB query...");
		const response = await client.query(sqlQuery, queryParams);
		logger.info(
			{ rowCount: response.rowCount },
			"DB query executed successfully",
		);

		if (response.rowCount === 0) {
			logger.info("No patients found, returning empty array.");
			return {
				statusCode: 200,
				headers: {
					"Access-Control-Allow-Headers": "Content-Type",
					"Access-Control-Allow-Origin": "*", // Allow from anywhere
					"Access-Control-Allow-Methods": "POST", // Allow only GET request
				},
				body: JSON.stringify([]),
			};
		}

		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Headers": "Content-Type",
				"Access-Control-Allow-Origin": "*", // Allow from anywhere
				"Access-Control-Allow-Methods": "POST", // Allow only GET request
			},
			body: JSON.stringify(response.rows),
		};
	} catch (error) {
		logger.error({ error: error.message }, "An error has occurred!");
		return {
			statusCode: 500,
			body: JSON.stringify({
				error: "DB Error",
			}),
		};
	} finally {
		await client?.end();
		logger.info("Database connection closed");
	}
};
