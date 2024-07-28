import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { FamiliarHistory } from ".";

export default {
  component: FamiliarHistory,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/familiar-history"]}>
        <Routes>
          <Route path="/familiar-history" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  title: "Views/FamiliarHistory",
};

const dummyPatientId = 12345;

const mockGetFamiliarHistoryWithData = async (id) => ({
  result: {
    medicalHistory: {
      surgeries: {
        data: [
          { surgeryType: "Appendectomy", surgeryYear: "2019", complications: "None" },
          { surgeryType: "Gallbladder removal", surgeryYear: "2018", complications: "Infection" },
        ],
        version: 1,
      },
    },
  },
});

const mockGetFamiliarHistoryEmpty = async (id) => ({
  result: {
    medicalHistory: {
      surgeries: {
        data: [],
        version: 1,
      },
    },
  },
});

const mockGetFamiliarHistoryError = async (id) => ({
  error: {
    response: {
      status: 400,
      statusText: "Bad Request",
      data: "Invalid request parameters.",
    },
  },
});

const mockUpdateFamiliarHistory = async (id, history, version) => ({
  result: { medicalHistory: { surgeries: { data: history, version: version + 1 } } },
});

const store = createEmptyStore({
  selectedPatientId: dummyPatientId,
});

export const WithData = {
  args: {
    getFamiliarlHistory: mockGetFamiliarHistoryWithData,
    updateFamiliarHistory: mockUpdateFamiliarHistory,
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
    getFamiliarlHistory: mockGetFamiliarHistoryEmpty,
    updateFamiliarHistory: mockUpdateFamiliarHistory,
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
    getFamiliarlHistory: mockGetFamiliarHistoryError,
    updateFamiliarHistory: mockUpdateFamiliarHistory,
    sidebarConfig: {
      userInformation: {
        displayName: "Dr. John Smith",
        title: "Cirujano",
      },
    },
    useStore: () => ({ selectedPatientId: store.selectedPatientId }),
  },
};
