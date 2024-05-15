import axios from "axios";
import { describe, beforeAll, afterAll, test, expect } from "@jest/globals";

const LOCAL_API_URL = "http://localhost:3000/search";

describe("Search patient integration tests", () => {
  beforeAll(() => {
    // FIXME: Insert values inside db using the utility function provided by CreatePatient.
  });
  afterAll(() => {
    // FIXME: Delete values inside db using the utility function provided by CreatePatient.
  });

  test("Fails when not provided a query for searching a patient", async () => {
    const func = () => axios.post(LOCAL_API_URL);
    expect(func).rejects.toThrow();
  });

  test("Fails when provided a worker code and a carnet at the same time", async () => {
    const data = {
      studentCode: "22386",
      workerCode: "10743",
    };
    const func = () => axios.post(LOCAL_API_URL, data);
    expect(func).rejects.toThrow();
  });

  test("Fails when provided a worker code and names at the same time", async () => {
    const data = {
      studentCode: "10743",
      name: "Flavio Galán",
    };
    const func = () => axios.post(LOCAL_API_URL, data);
    expect(func).rejects.toThrow();
  });

  test("Fails when provided a carnet and names at the same time", async () => {
    const data = {
      studentCode: "10743",
      name: "Flavio Galán",
    };

    const func = () => axios.post(LOCAL_API_URL, data);
    expect(func).rejects.toThrow();
  });

  test("Can search exactly by carnet", async () => {
    const data = {
      studentCode: "22386",
    };
    const response = await axios.post(LOCAL_API_URL, data);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    // FIXME: Check if data matches inserted data...
  });

  test("Can search exactly by worker code", async () => {
    const data = {
      workerCode: "10743",
    };
    const response = await axios.post(LOCAL_API_URL, data);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    // FIXME: Check if data matches inserted data...
  });

  test("Can search by patient names", async () => {
    const data = {
      names: "Flavio Donis",
    };
    const response = await axios.post(LOCAL_API_URL, data);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    // FIXME: Check if data matches inserted data...
  });

  test("Search should not take into account accents", async () => {
    const data = {
      names: "André Galán",
    };
    const response = await axios.post(LOCAL_API_URL, data);

    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    // FIXME: Check if data matches inserted data...
  });
});
