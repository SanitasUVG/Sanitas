import http from "k6/http";
import { sleep, check } from "k6";
import { createAuthorizationHeader } from "../helpers.js";

// INFO: HOW DO YOU RUN THIS SCRIPT?
// k6 cloud run path/to/script -e BASE_URL=<BASE_URL> -e JWT=<JWT> -e PATIENT_ID=<PATIENT_ID>

export const options = {
	vus: 10,
	duration: "30s",
	cloud: {
		// Project: Sanitas
		projectID: 3719072,
		// Test runs with the same name groups test runs together.
		name: "Patient Reading Data",
	},
};

export default function () {
	// INFO: __ENV variables are set using the `-e` flag.
	// For example:
	// $ k6 run -e FOO=bar ~/script.js

	// NOTE: The BASE_URL without /
	const BASE_URL = __ENV.BASE_URL;
	const JWT = __ENV.JWT;
	const PATIENT_ID = __ENV.PATIENT_ID;
	const headers = createAuthorizationHeader(JWT);

	const urls = [
		`${BASE_URL}/patient/family-history/${PATIENT_ID}`,
		`${BASE_URL}/patient/personal-history/${PATIENT_ID}`,
		`${BASE_URL}/patient/allergic-history/${PATIENT_ID}`,
		`${BASE_URL}/patient/surgical-history/${PATIENT_ID}`,
		`${BASE_URL}/patient/traumatological-history/${PATIENT_ID}`,
		`${BASE_URL}/patient/psychiatric-history/${PATIENT_ID}`,
		`${BASE_URL}/patient/nonpatological-history/${PATIENT_ID}`,
	];

	const res = http.get(`${BASE_URL}/patient/general/${PATIENT_ID}`, {
		headers,
	});
	check(res, {
		"is status 200": (r) => r.status === 200,
	});
	sleep(1);

	const isWoman = JSON.parse(res.body).isWoman;
	if (isWoman) {
		urls.push(`${BASE_URL}/patient/gyneco-history/${PATIENT_ID}`);
	}

	for (const url of urls) {
		const res = http.get(url, { headers });
		check(res, {
			"is status 200": (r) => r.status === 200,
		});
		sleep(1);
	}

	sleep(1);
}
