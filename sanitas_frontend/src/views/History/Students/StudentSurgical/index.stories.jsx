import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { StudentSurgicalHistory } from ".";

export default {
  component: StudentSurgicalHistory,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/form"]}>
        <Routes>
          <Route path="/form" element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  title: "Views/StudentSurgicalHistory",
};

const dummyPatientId = 12345;

const mockGetBirthdayPatientInfo = async (id) => ({
  result: { birthdate: "2000-02-11" },
});

const mockGetStudentSurgicalHistoryWithData = async (id) => ({
  result: {
    medicalHistory: {
      surgeries: {
        data: [{ surgeryType: "Appendectomy", surgeryYear: "2019", complications: "None" }],
        version: 1,
      },
    },
  },
});

const mockGetStudentSurgicalHistoryEmpty = async (id) => ({
  result: {
    medicalHistory: {
      surgeries: {
        data: [],
        version: 1,
      },
    },
  },
});

const mockGetStudentSurgicalHistoryError = async (id) => ({
  error: {
    response: {
      status: 400,
      statusText: "Bad Request",
      data: "Invalid request parameters.",
    },
  },
});

const mockUpdateStudentSurgicalHistory = async (id, history, version) => ({
  result: { medicalHistory: { surgeries: { data: history, version: version + 1 } } },
});

const store = createEmptyStore({
  selectedPatientId: dummyPatientId,
});

export const WithData = {
  args: {
    getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
    getStudentSurgicalHistory: mockGetStudentSurgicalHistoryWithData,
    updateStudentSurgicalHistory: mockUpdateStudentSurgicalHistory,
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
    getStudentSurgicalHistory: mockGetStudentSurgicalHistoryEmpty,
    updateStudentSurgicalHistory: mockUpdateStudentSurgicalHistory,
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
    getStudentSurgicalHistory: mockGetStudentSurgicalHistoryError,
    updateStudentSurgicalHistory: mockUpdateStudentSurgicalHistory,
    sidebarConfig: {
      userInformation: {
        displayName: "Dr. John Smith",
        title: "Cirujano",
      },
    },
    useStore: () => ({ selectedPatientId: store.selectedPatientId }),
  },
};
