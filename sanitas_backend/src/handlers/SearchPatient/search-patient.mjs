import { logger, withRequest } from 'logging';
import { getPgClient } from 'db-conn';

/**
 * @typedef {Object} RequestParams
 * @property {string} request_search - The search parameter.
 * @property {string} search_type - The type of search to be performed.
 */

/**
 * Checks the parameters for the searchPatientHandler.
 * @param {import('aws-lambda').APIGatewayProxyEvent} event - The event object received by the handler.
 * @returns {{isValidRequest: true, requestParams: RequestParams} | {isValidRequest: false, errorResponse: import('aws-lambda').APIGatewayProxyResult}}
 */
const checkParameters = (event) => {
  if (event.httpMethod !== 'POST') {
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

  const { request_search, search_type } = JSON.parse(event.body);
  logger.info({ request_search, search_type }, 'Received search parameters');

  if (!request_search) {
    return {
      isValidRequest: false,
      errorResponse: {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Search parameter must be provided and cannot be empty',
        }),
      },
    };
  }

  if (!search_type) {
    return {
      isValidRequest: false,
      errorResponse: {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Search type not provided',
        }),
      },
    };
  }

  return {
    isValidRequest: true,
    requestParams: { request_search, search_type },
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

  const { request_search, search_type } = paramCheckResult.requestParams;

  let client;
  try {
    const url = process.env.POSTGRES_URL;
    logger.info(url, 'Connecting to DB...');
    client = getPgClient(url);
    await client.connect();

    let sqlQuery = '';
    let queryParams = [];

    switch (search_type) {
      case 'Carnet':
        sqlQuery =
          'SELECT ID, NOMBRES, APELLIDOS FROM PACIENTE JOIN ESTUDIANTE ON PACIENTE.ID = ESTUDIANTE.ID_PACIENTE WHERE CARNET = $1';
        queryParams.push(request_search);
        logger.info({ sqlQuery, queryParams }, 'Querying by student ID');
        break;
      case 'NumeroColaborador':
        sqlQuery =
          'SELECT ID, NOMBRES, APELLIDOS FROM PACIENTE JOIN COLABORADOR ON PACIENTE.ID = COLABORADOR.ID_PACIENTE WHERE CODIGO = $1';
        queryParams.push(request_search);
        logger.info({ sqlQuery, queryParams }, 'Querying by employee code');
        break;
      case 'Nombres':
        let request_search_processed = request_search
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();

        sqlQuery = `
                SELECT ID, NOMBRES, APELLIDOS 
                FROM PACIENTE 
                WHERE TRANSLATE(NOMBRES, 'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN') ILIKE $1 
                OR TRANSLATE(APELLIDOS, 'áàãâäéèêëíìîïóòõôöúùûüçñÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇÑ', 'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN') ILIKE $1`;
        queryParams.push(`%${request_search_processed}%`);
        logger.info({ sqlQuery, queryParams }, 'Querying by names or surnames');
        break;
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({
            isValidRequest: false,
            errorResponse: {
              statusCode: 400,
              body: JSON.stringify({
                error: 'Invalid search type received',
              }),
            },
          }),
        };
    }

    logger.info('Executing DB query...');
    const response = await client.query(sqlQuery, queryParams);
    logger.info({ rowCount: response.rowCount }, 'DB query executed successfully');

    if (response.rowCount === 0) {
      logger.info('No patients found, returning empty array.');
      return {
        statusCode: 200,
        body: JSON.stringify({
          patients: [],
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.rows),
    };
  } catch (error) {
    logger.error({ error: error.message }, 'An error has occurred!');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'DB Error',
      }),
    };
  } finally {
    await client?.end();
    logger.info('Database connection closed');
  }
};
