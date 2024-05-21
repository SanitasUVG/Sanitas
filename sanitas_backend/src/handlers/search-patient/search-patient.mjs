import { logger, withRequest } from 'logging';
import { getPgClient } from 'db-conn';

/**
 * Handles patient search queries based on ID, employee code, or partial names and surnames.
 */
export const searchPatientHandler = async (event, context) => {
  // All log statements are written to CloudWatch
  withRequest(event, context);

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: `searchPatientHandler only accepts POST method, you tried: ${event.httpMethod}`,
      }),
    };
  }

  const { request_search, search_type } = JSON.parse(event.body);
  logger.info({ request_search, search_type }, 'Received search parameters');

  if (!request_search) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: 'Search parameter must be provided and cannot be empty',
      }),
    };
  }

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
        if (!search_type) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              error: 'Search type not provided',
            }),
          };
        }
        return {
          statusCode: 400,
          body: JSON.stringify({
            error: 'Invalid search type received',
          }),
        };
    }

    logger.info('Executing DB query...');
    const response = await client.query(sqlQuery, queryParams);
    logger.info({ rowCount: response.rowCount }, 'DB query executed successfully');

    if (response.rowCount === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'No patients found matching the search criteria',
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
