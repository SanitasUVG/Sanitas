import pg from "pg";
const { Client } = pg;

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
