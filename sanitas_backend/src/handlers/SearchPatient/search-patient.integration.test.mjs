import { describe, expect, it } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/patient/search";

describe("Search Patient Integration Tests", () => {
	beforeAll(() => {
		// Insert data into DB.
	});
	afterAll(() => {
		// Delete inserted data.
	});

	it("should return patients by carnet", async () => {
		const postData = {
			requestSearch: "A01234567",
			searchType: "Carnet",
		};
		const response = await axios.post(LOCAL_API_URL, postData);
		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});

	it("should return patients by employee code", async () => {
		const postData = {
			requestSearch: "C001",
			searchType: "NumeroColaborador",
		};
		const response = await axios.post(LOCAL_API_URL, postData);
		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});

	it("should return patients by name or surname, with diacritic", async () => {
		const postData = {
			requestSearch: "Pérez",
			searchType: "Nombres",
		};
		const response = await axios.post(LOCAL_API_URL, postData);
		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});

	it("should return patients by name or surname, no diacritic", async () => {
		const postData = {
			requestSearch: "Maria",
			searchType: "Nombres",
		};
		const response = await axios.post(LOCAL_API_URL, postData);
		expect(response.status).toBe(200);
		expect(response.data.length).toBeGreaterThan(0);
	});

	it("should return an error if search parameter is not provided", async () => {
		const postData = {
			searchType: "Carnet",
		};
		const response = await axios.post(LOCAL_API_URL, postData, {
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
		const response = await axios.post(LOCAL_API_URL, postData, {
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
		const response = await axios.post(LOCAL_API_URL, postData, {
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
		const response = await axios.post(LOCAL_API_URL, postData);
		expect(response.status).toBe(200);
		expect(response.data).toEqual([]);
	});

	it("should return an empty array if no patients are found, searchType NumeroColaborador ", async () => {
		const postData = {
			requestSearch: "NonExistentPatient",
			searchType: "NumeroColaborador",
		};
		const response = await axios.post(LOCAL_API_URL, postData);
		expect(response.status).toBe(200);
		expect(response.data).toEqual([]);
	});

	it("should return an empty array if no patients are found, searchType Nombres ", async () => {
		const postData = {
			requestSearch: "NonExistentPatient",
			searchType: "Nombres",
		};
		const response = await axios.post(LOCAL_API_URL, postData);
		expect(response.status).toBe(200);
		expect(response.data).toEqual([]);
	});
});
