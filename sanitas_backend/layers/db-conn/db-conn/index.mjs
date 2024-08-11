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

/**
	* Given an email and a DB connection, checks if the user is a doctor or not.
	* @param {pg.Client} client - The PG Client
	* @param {string} email - The user email
	* @returns {boolean|{error: *}} If successful, will return true if the user is a doctor, false otherwise. If not successful an object with an error will be returned.
	*/
export async function isDoctor(client, email) {
	const query = "SELECT EXISTS(SELECT 1 FROM DOCTOR WHERE email=$1) AS 'valid'";
	const params = [email];
	try {
		let result = await client.query(query, params);
		return result.rows[0].valid;
	} catch (error) {
		return {error}
	}
}
