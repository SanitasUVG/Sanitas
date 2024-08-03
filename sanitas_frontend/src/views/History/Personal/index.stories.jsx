import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { PersonalHistory } from ".";

export default {
  component: PersonalHistory,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/surgical-history"]}>
        <Routes>
          <Route path="/surgical-history" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  title: "Views/PersonalHistory",
};

const dummyPatientId = 12345;

const mockGetBirthdayPatientInfo = async (id) => ({
  result: { birthdate: "2000-02-11" },
});

const mockGetPersonalHistoryWithData = async (id) => ({
  result: {
    medicalHistory: {
      surgeries: {
        data: [{ surgeryType: "Appendectomy", surgeryYear: "2019", complications: "None" }],
        version: 1,
      },
    },
  },
});

const mockGetPersonalHistoryEmpty = async (id) => ({
  result: {
    medicalHistory: {
      surgeries: {
        data: [],
        version: 1,
      },
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
  result: { medicalHistory: { surgeries: { data: history, version: version + 1 } } },
});

const store = createEmptyStore({
  selectedPatientId: dummyPatientId,
});

export const WithData = {
  args: {
    getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
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
    getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
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
    getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
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
