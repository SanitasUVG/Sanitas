import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { PersonalHistory } from ".";

export default {
  component: PersonalHistory,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/personal-history"]}>
        <Routes>
          <Route path="/personal-history" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  title: "Views/PersonalHistory",
};

const dummyPatientId = 12345;

const mockGetPersonalHistoryWithData = async (id) => ({
  result: {
    medicalHistory: {
      hypertension: {
        data: [{ typeOfDisease: "hiper", medicine: "ibuprofeno", dose: "10", frequency: "21" }],
        version: 1,
      },
      diabetesMellitus: {
        data: [{ typeOfDisease: "dia", medicine: "azucar", dose: "12", frequency: "23" }],
        version: 1,
      },
      hypothyroidism: { data: [], version: 1 },
      asthma: { data: [], version: 1 },
      convulsions: { data: [], version: 1 },
      myocardialInfarction: { data: [], version: 1 },
      cancer: { data: [], version: 1 },
      cardiacDiseases: { data: [], version: 1 },
      renalDiseases: { data: [], version: 1 },
      others: { data: [], version: 1 },
    },
  },
});

const mockGetPersonalHistoryEmpty = async (id) => ({
  result: {
    medicalHistory: {
      hypertension: { data: [], version: 1 },
      diabetesMellitus: { data: [], version: 1 },
      hypothyroidism: { data: [], version: 1 },
      asthma: { data: [], version: 1 },
      convulsions: { data: [], version: 1 },
      myocardialInfarction: { data: [], version: 1 },
      cancer: { data: [], version: 1 },
      cardiacDiseases: { data: [], version: 1 },
      renalDiseases: { data: [], version: 1 },
      others: { data: [], version: 1 },
    },
  },
});
const mockGetPersonalHistoryError = async (id) => ({
  error: {
    response: {
      status: 400,
      statusText: "Bad Request",
      data: "Invalid request parameters.",
    },
  },
});

const mockUpdatePersonalHistory = async (id, history, version) => ({
  result: { medicalHistory: history },
});

const store = createEmptyStore({
  selectedPatientId: dummyPatientId,
});

export const WithData = {
  args: {
    getPersonalHistory: mockGetPersonalHistoryWithData,
    updatePersonalHistory: mockUpdatePersonalHistory,
    sidebarConfig: {
      userInformation: {
        displayName: "Dr. John Smith",
        title: "Cirujano",
      },
    },
    useStore: () => ({ selectedPatientId: store.selectedPatientId }),
  },
};

export const EmptyData = {
  args: {
    getPersonalHistory: mockGetPersonalHistoryEmpty,
    updatePersonalHistory: mockUpdatePersonalHistory,
    sidebarConfig: {
      userInformation: {
        displayName: "Dr. John Smith",
        title: "Cirujano",
      },
    },
    useStore: () => ({ selectedPatientId: store.selectedPatientId }),
  },
};

export const ErrorState = {
  args: {
    getPersonalHistory: mockGetPersonalHistoryError,
    updatePersonalHistory: mockUpdatePersonalHistory,
    sidebarConfig: {
      userInformation: {
        displayName: "Dr. John Smith",
        title: "Cirujano",
      },
    },
    useStore: () => ({ selectedPatientId: store.selectedPatientId }),
  },
};
