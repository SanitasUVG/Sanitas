import pg from "pg";
const { Client } = pg;

/**
 * Exports the name of the schema that encapsulates the tables of the system.
 */
export const SCHEMA_NAME = "md_san";

/**
 * Obtains a client connected to the DB by the specified connection string.
 * @param {string} connectionString
 * @returns {pg.Client} The PG client.
 */
export function getPgClient(connectionString) {
	return new Client({
		connectionString,
	});
}

/**
 * Given an email and a DB connection, checks if the user is a doctor or not.
 * @param {pg.Client} client - The PG Client
 * @param {string} email - The user email
 * @returns {Promise<boolean|{error: *}>} If successful, will return true if the user is a doctor, false otherwise. If not successful an object with an error will be returned.
 */
export async function isDoctor(client, email) {
	const query = "SELECT 1 FROM DOCTOR WHERE email=$1 LIMIT 1";
	const params = [email];
	try {
		const result = await client.query(query, params);
		return result.rowCount > 0;
	} catch (error) {
		return { error };
	}
}

/**
 * Checks if the given email belongs to the given patient.
 * @param {import("pg").Client} client - The Pg Client
 * @param {string} email - The user email.
 * @param {string} id - The user Id.
 */
export async function isEmailOfPatient(client, email, id) {
	const query = `
	SELECT * FROM CUENTA_PACIENTE cp
	INNER JOIN PACIENTE p ON cp.cui_paciente = p.cui
	WHERE p.id=$1 AND cp.email=$2
`;
	const params = [id, email];

	try {
		const result = await client.query(query, params);
		return result.rowCount > 0;
	} catch (error) {
		return { error };
	}
}

/**
 * @template T
 * Wrapper for common logic to do when doing a transaction in Postgres.
 *
 * If you wish to respond with an APIGatewayProxyResult directly from the lambda, return an object with a response property!
 * Returning an APIGatewayProxyResult will rollback the transaction!
 * @param {pg.Client} client - The PG Client
 * @param {import("pino").Logger} logger - The Logger reference
 * @param {()=> Promise<T | {response: import("aws-lambda").APIGatewayProxyResult}>} func - The function to run inside a transaction
 * @returns {Promise<{error: *} | {result: T} | {response: import("aws-lambda").APIGatewayProxyResult}>} A result containing the return value of the function.
 */
export async function transaction(client, logger, func) {
	try {
		logger.info("Beginning transaction...");
		await client.query("BEGIN");
		const result = await func();

		// This means is an HTTP response.
		if (result.response) {
			logger.info("Rolling back transaction due to HTTP response...");
			await client.query("ROLLBACK");
			return result;
		}

		logger.info("Comitting transaction...");
		await client.query("COMMIT");
		return { result };
	} catch (error) {
		logger.error({ error }, "Rolling back transaction due to error...");
		await client.query("ROLLBACK");
		return { error };
	}
}
