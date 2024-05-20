import { logger, withRequest } from "logging";
import { getPgClient } from "db-conn";

export const handler = async (event) => {
    const cui = event.pathParameters.cui;

    let client;
    try {
        const url = process.env.POSTGRES_URL;
        client = getPgClient(url);
        logger.info(url, "Connecting to DB...");
        await client.connect();
        logger.info("Querying DB...");

        const query = 'SELECT COUNT(*) FROM PACIENTE WHERE cui = $1';
        const values = [cui];
        const res = await client.query(query, values);

        const exists = res.rows[0].count > 0;

        await client.end();

        return {
            statusCode: 200,
            body: JSON.stringify({ exists }),
        };
    } catch (error) {
        logger.error(error, 'Error querying database:');
        await client.end();
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
