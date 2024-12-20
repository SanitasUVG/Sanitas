import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { STUDENT_DASHBOARD_SIDEBAR_PROPS } from "src/router";
import { StudentNonPathologicalHistory } from ".";

export default {
	component: StudentNonPathologicalHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/non-pathological-history"]}>
				<Routes>
					<Route path="/non-pathological-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/Patient/Antecedents/StudentNonPathologicalHistory",
};

const mockGetBloodTypePatientInfo = async () => ({
	result: {
		bloodType: "O+",
	},
});

const mockGetStudentNonPathologicalHistoryWithData = async () => ({
	result: {
		medicalHistory: {
			smoker: {
				data: [{ smokes: true, cigarettesPerDay: 10, years: 5 }],
				version: 1,
			},
			drink: { data: [{ drinks: true, drinksPerMonth: 5 }], version: 1 },
			drugs: {
				data: [{ usesDrugs: true, drugType: "Cannabis", frequency: "Weekly" }],
				version: 1,
			},
		},
		bloodType: "O+",
	},
});

const mockGetStudentNonPathologicalHistoryEmpty = async () => ({
	result: {
		medicalHistory: {
			smoker: { data: [], version: 1 },
			drink: { data: [], version: 1 },
			drugs: { data: [], version: 1 },
		},
		bloodType: "",
	},
});

const mockGetStudentNonPathologicalHistoryError = async () => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateStudentNonPathologicalHistory = async (history) => ({
	result: { medicalHistory: history, bloodType: history.bloodType },
});

const store = createEmptyStore({
	selectedPatientId: 12345, // Mock patient ID
});

export const WithData = {
	args: {
		getNonPathologicalHistory: mockGetStudentNonPathologicalHistoryWithData,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateStudentNonPathologicalHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getNonPathologicalHistory: mockGetStudentNonPathologicalHistoryEmpty,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateStudentNonPathologicalHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getNonPathologicalHistory: mockGetStudentNonPathologicalHistoryError,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateStudentNonPathologicalHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
