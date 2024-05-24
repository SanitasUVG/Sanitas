import { describe, expect, it } from "@jest/globals";
import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000/search-patient";

describe("Search Patient Integration Tests", () => {
  beforeAll(() => {
    // Insert data into DB.
  });
  afterAll(() => {
    // Delete inserted data.
  });

  it("should return patients by carnet", async () => {
    const postData = {
      request_search: "A01234567",
      search_type: "Carnet",
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it("should return patients by employee code", async () => {
    const postData = {
      request_search: "C001",
      search_type: "NumeroColaborador",
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it("should return patients by name or surname, with diacritic", async () => {
    const postData = {
      request_search: "Pérez",
      search_type: "Nombres",
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it("should return patients by name or surname, no diacritic", async () => {
    const postData = {
      request_search: "Maria",
      search_type: "Nombres",
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it("should return an error if search parameter is not provided", async () => {
    const postData = {
      search_type: "Carnet",
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
      request_search: "A01234567",
    };
    const response = await axios.post(LOCAL_API_URL, postData, {
      validateStatus: () => true,
    });
    expect(response.status).toBe(400);
    expect(response.data.error).toBe("Search type not provided");
  });

  it("should return an error if invalid search type is received", async () => {
    const postData = {
      request_search: "A01234567",
      search_type: "InvalidType",
    };
    const response = await axios.post(LOCAL_API_URL, postData, {
      validateStatus: () => true,
    });
    expect(response.status).toBe(400);
    expect(JSON.parse(response.data.errorResponse.body).error).toBe(
      "Invalid search type received",
    );
  });

  it("should return an empty array if no patients are found, search_type Carnet ", async () => {
    const postData = {
      request_search: "NonExistentPatient",
      search_type: "Carnet",
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
  });

  it("should return an empty array if no patients are found, search_type NumeroColaborador ", async () => {
    const postData = {
      request_search: "NonExistentPatient",
      search_type: "NumeroColaborador",
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
  });

  it("should return an empty array if no patients are found, search_type Nombres ", async () => {
    const postData = {
      request_search: "NonExistentPatient",
      search_type: "Nombres",
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
  });
});
