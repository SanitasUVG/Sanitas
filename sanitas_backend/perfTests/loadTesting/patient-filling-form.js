import http from "k6/http";
import { sleep, check } from "k6";
import {
	createAuthorizationHeader,
	genValidUpdateStudentAllergic,
	genValidUpdateStudentFamilyHistory,
	genValidUpdateStudentGeneral,
	genValidUpdateStudentGynecoHistory,
	genValidUpdateStudentNonPatologicalHistory,
	genValidUpdateStudentPersonal,
	genValidUpdateStudentPsychiatricHistory,
	genValidUpdateStudentSurgicalHistory,
	genValidUpdateStudentTraumatologicalHistory,
} from "../helpers.js";

// INFO: HOW DO YOU RUN THIS SCRIPT?
// k6 cloud run path/to/script -e BASE_URL=<BASE_URL> -e JWT=<JWT> -e PATIENT_ID=<PATIENT_ID>

export const options = {
	vus: 10,
	duration: "30s",
	cloud: {
		// Project: Sanitas
		projectID: 3719072,
		// Test runs with the same name groups test runs together.
		name: "Patient Filling Form",
	},
};

/**
 * @param {string} getURL
 * @returns{string}
 */
function getPostURL(getURL) {
	const firstSection = getURL.substring(
		0,
		getURL.indexOf("patient") + "patient".length,
	);
	const rest = getURL.substring(
		getURL.indexOf("patient") + "patient".length + 1,
	);
	const path = rest.substring(0, rest.lastIndexOf("/"));
	return `${firstSection}/student-${path}`;
}

export default function () {
	// INFO: __ENV variables are set using the `-e` flag.
	// For example:
	// $ k6 run -e FOO=bar ~/script.js

	// NOTE: The BASE_URL without /
	const BASE_URL = __ENV.BASE_URL;
	const JWT = __ENV.JWT;
	const PATIENT_ID = __ENV.PATIENT_ID;
	const headers = createAuthorizationHeader(JWT);

	const getUrls = [
		[
			`${BASE_URL}/patient/family-history/${PATIENT_ID}`,
			genValidUpdateStudentFamilyHistory,
		],
		[
			`${BASE_URL}/patient/personal-history/${PATIENT_ID}`,
			genValidUpdateStudentPersonal,
		],
		[
			`${BASE_URL}/patient/allergic-history/${PATIENT_ID}`,
			genValidUpdateStudentAllergic,
		],
		[
			`${BASE_URL}/patient/surgical-history/${PATIENT_ID}`,
			genValidUpdateStudentSurgicalHistory,
		],
		[
			`${BASE_URL}/patient/traumatological-history/${PATIENT_ID}`,
			genValidUpdateStudentTraumatologicalHistory,
		],
		[
			`${BASE_URL}/patient/psychiatric-history/${PATIENT_ID}`,
			genValidUpdateStudentPsychiatricHistory,
		],
		[
			`${BASE_URL}/patient/nonpatological-history/${PATIENT_ID}`,
			genValidUpdateStudentNonPatologicalHistory,
		],
	];

	const getRes = http.get(`${BASE_URL}/patient/general/${PATIENT_ID}`, {
		headers,
	});
	check(getRes, {
		"is status 200": (r) => r.status === 200,
	});
	sleep(1);
	const getGeneralBody = JSON.parse(getRes.body);
	const isWoman = getGeneralBody.isWoman;
	if (isWoman) {
		getUrls.push([
			`${BASE_URL}/patient/gyneco-history/${PATIENT_ID}`,
			genValidUpdateStudentGynecoHistory,
		]);
	}

	const postRes = http.post(
		`${BASE_URL}/patient/general/${PATIENT_ID}`,
		genValidUpdateStudentGeneral(PATIENT_ID, getGeneralBody),
		{ headers },
	);
	check(postRes, {
		"is status 200": (r) => r.status === 200,
	});

	for (const [getUrl, genValidUpdate] of getUrls) {
		const getResponse = http.get(getUrl, { headers });
		check(getResponse, {
			"is status 200": (r) => r.status === 200,
		});
		sleep(1);

		const postUrl = getPostURL(getUrl);
		const payload = JSON.stringify(genValidUpdate(PATIENT_ID));
		const postResponse = http.post(postUrl, payload, { headers });
		check(postResponse, {
			"is status 200": (r) => r.status === 200,
		});
		sleep(1);
	}

	sleep(1);
}
