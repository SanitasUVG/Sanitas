import axios from 'axios';
import { describe, it, expect } from '@jest/globals';

const LOCAL_API_URL = 'http://localhost:3000/search-patient';

describe('Search Patient Integration Tests', () => {
  beforeAll(() => {
    // Insert data into DB.
  });
  afterAll(() => {
    // Delete inserted data.
  });

  it('should return patients by carnet', async () => {
    const postData = {
      request_search: 'A01234567',
      search_type: 'Carnet',
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('should return patients by employee code', async () => {
    const postData = {
      request_search: 'C001',
      search_type: 'NumeroColaborador',
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('should return patients by name or surname, with diacritic', async () => {
    const postData = {
      request_search: 'Pérez',
      search_type: 'Nombres',
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('should return patients by name or surname, no diacritic', async () => {
    const postData = {
      request_search: 'Maria',
      search_type: 'Nombres',
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('should return an error if search parameter is not provided', async () => {
    const postData = {
      search_type: 'Carnet',
    };
    try {
      const response = await axios.post(LOCAL_API_URL, postData);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe(
        'Search parameter must be provided and cannot be empty',
      );
    }
  });

  it('should return an error if search type is not provided', async () => {
    const postData = {
      request_search: 'A01234567',
    };
    try {
      const response = await axios.post(LOCAL_API_URL, postData);
      expect(true).toBe(false);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.error).toBe('Search type not provided');
    }
  });

  it('should return an error if invalid search type is received', async () => {
    const postData = {
      request_search: 'A01234567',
      search_type: 'InvalidType',
    };
    try {
      await axios.post(LOCAL_API_URL, postData);
      expect(true).toBe(false); // Force fail if no error is thrown
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(JSON.parse(error.response.data.errorResponse.body).error).toBe(
        'Invalid search type received',
      );
    }
  });

  it('should return an empty array if no patients are found, search_type Carnet ', async () => {
    const postData = {
      request_search: 'NonExistentPatient',
      search_type: 'Carnet',
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      patients: [],
    });
  });

  it('should return an empty array if no patients are found, search_type NumeroColaborador ', async () => {
    const postData = {
      request_search: 'NonExistentPatient',
      search_type: 'NumeroColaborador',
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      patients: [],
    });
  });

  it('should return an empty array if no patients are found, search_type Nombres ', async () => {
    const postData = {
      request_search: 'NonExistentPatient',
      search_type: 'Nombres',
    };
    const response = await axios.post(LOCAL_API_URL, postData);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      patients: [],
    });
  });
});
