import http from "k6/http";
import { sleep, check } from "k6";
import { createAuthorizationHeader } from "../helpers.js";

// INFO: HOW DO YOU RUN THIS SCRIPT?
// k6 cloud run path/to/script -e BASE_URL=<BASE_URL> -e JWT=<JWT>
// NOTE: The BASE_URL without /

export const options = {
	vus: 10,
	duration: "30s",
	cloud: {
		// Project: Sanitas
		projectID: 3719072,
		// Test runs with the same name groups test runs together.
		name: "Doctor searching patients",
	},
};

/**
 * @param {string} query
 * @param {"Carnet"|"NumeroColaborador"|"Nombres"|"CUI"} type
 * @returns {{requestSearch: string, searchType: string}}
 */
function genSearchQuery(query, type) {
	return {
		requestSearch: query,
		searchType: type,
	};
}

export default function () {
	const BASE_URL = __ENV.BASE_URL;
	const JWT = __ENV.JWT;
	const headers = createAuthorizationHeader(JWT);

	const payloads = [
		genSearchQuery("1050", "NumeroColaborador"),
		genSearchQuery("22386", "Carnet"),
		genSearchQuery("Fl", "Nombres"),
		genSearchQuery("2987944380102", "CUI"),
		genSearchQuery("Ma", "Nombres"),
	];

	payloads
		.map((p) => JSON.stringify(p))
		.forEach((p) => {
			const res = http.post(`${BASE_URL}/patient/search`, p, { headers });
			check(res, {
				"is status 200": (r) => r.status === 200,
			});
			sleep(1);
		});
}
