import { describe, expect, it, beforeAll, afterAll } from "@jest/globals";
import axios from "axios";
import {
	createAuthorizationHeader,
	createDoctorJWT,
	createInvalidJWT,
	createPatientJWT,
	LOCAL_API_URL,
} from "../testHelpers.mjs";

const API_URL = `${LOCAL_API_URL}patient/search`;

describe("Search Patient Integration Tests", () => {
	const headers = createAuthorizationHeader(createDoctorJWT());
	beforeAll(() => {
		// TODO: Insert data into DB.
	});
	afterAll(() => {
		// TODO: Delete inserted data.
	});

	it("should return patients by carnet", async () => {
		const postData = {
			requestSearch: "A01234567",
			searchType: "Carnet",
		};

		const response = await axios.post(API_URL, postData, { headers });

		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});

	it("should return patients by employee code", async () => {
		const postData = {
			requestSearch: "C001",
			searchType: "NumeroColaborador",
		};
		const response = await axios.post(API_URL, postData, { headers });
		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});

	it("should return patients by name or surname, with diacritic", async () => {
		const postData = {
			requestSearch: "Pérez",
			searchType: "Nombres",
		};
		const response = await axios.post(API_URL, postData, { headers });
		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});

	it("should return patients by name or surname, no diacritic", async () => {
		const postData = {
			requestSearch: "Maria",
			searchType: "Nombres",
		};
		const response = await axios.post(API_URL, postData, { headers });
		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});

	it("should return an error if search parameter is not provided", async () => {
		const postData = {
			searchType: "Carnet",
		};
		const response = await axios.post(API_URL, postData, {
			headers,
			validateStatus: () => true,
		});
		expect(response.status).toBe(400);
		expect(response.data.error).toBe(
			"Search parameter must be provided and cannot be empty",
		);
	});

	it("should return an error if search type is not provided", async () => {
		const postData = {
			requestSearch: "A01234567",
		};
		const response = await axios.post(API_URL, postData, {
			headers,
			validateStatus: () => true,
		});
		expect(response.status).toBe(400);
		expect(response.data.error).toBe("Search type not provided");
	});

	it("should return an error if invalid search type is received", async () => {
		const postData = {
			requestSearch: "A01234567",
			searchType: "InvalidType",
		};
		const response = await axios.post(API_URL, postData, {
			headers,
			validateStatus: () => true,
		});
		expect(response.status).toBe(400);
		expect(JSON.parse(response.data.errorResponse.body).error).toBe(
			"Invalid search type received",
		);
	});

	it("should return an empty array if no patients are found, searchType Carnet ", async () => {
		const postData = {
			requestSearch: "NonExistentPatient",
			searchType: "Carnet",
		};
		const response = await axios.post(API_URL, postData, { headers });
		expect(response.status).toBe(200);
		expect(response.data).toEqual([]);
	});

	it("should return an empty array if no patients are found, searchType NumeroColaborador ", async () => {
		const postData = {
			requestSearch: "NonExistentPatient",
			searchType: "NumeroColaborador",
		};
		const response = await axios.post(API_URL, postData, { headers });
		expect(response.status).toBe(200);
		expect(response.data).toEqual([]);
	});

	it("should return an empty array if no patients are found, searchType Nombres ", async () => {
		const postData = {
			requestSearch: "NonExistentPatient",
			searchType: "Nombres",
		};
		const response = await axios.post(API_URL, postData, { headers });
		expect(response.status).toBe(200);
		expect(response.data).toEqual([]);
	});

	it("a patient can't call the endpoint", async () => {
		const postData = {
			requestSearch: "A01234567",
			searchType: "Carnet",
		};

		const specialHeaders = createAuthorizationHeader(createPatientJWT());
		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(401);
		expect(response.data).toEqual({
			error: "Unauthorized, you're not a doctor!",
		});
	});

	it("can't be called by a malformed JWT", async () => {
		const postData = {
			requestSearch: "A01234567",
			searchType: "Carnet",
		};

		const specialHeaders = createAuthorizationHeader(createInvalidJWT());
		console.log(
			`Sending request to ${API_URL} with ${JSON.stringify(postData)} and headers: ${JSON.stringify(specialHeaders)}`,
		);
		const response = await axios.post(API_URL, postData, {
			headers: specialHeaders,
			validateStatus: () => true,
		});

		expect(response.status).toBe(400);
		expect(response.data).toEqual({ error: "JWT couldn't be parsed" });
	});
});
