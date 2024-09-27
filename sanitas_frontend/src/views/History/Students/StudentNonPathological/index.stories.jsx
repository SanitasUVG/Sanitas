import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
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
	title: "Views/Antecedents/Student/StudentNonPathologicalHistory",
};

const dummyPatientId = 12345;

const simulateNavigation = (path) => () =>
	console.log(`Mock navigate to ${path}`);

const sidebarConfigMock = {
	navigateToGeneralStudent: simulateNavigation("/student-general"),
	navigateToSurgicalStudent: simulateNavigation("/student-surgical"),
	navigateToTraumatologicalStudent: simulateNavigation(
		"/student-traumatological",
	),
	navigateToFamiliarStudent: simulateNavigation("/student-familiar"),
	navigateToPersonalStudent: simulateNavigation("/student-personal"),
	navigateToNonPathologicalStudent: simulateNavigation(
		"/student-non-pathological",
	),
	navigateToAllergiesStudent: simulateNavigation("/student-allergies"),
	navigateToPsiquiatricStudent: simulateNavigation("/student-psychiatric"),
	navigateToObstetricsStudent: simulateNavigation("/student-obstetrics"),
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
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getNonPathologicalHistory: mockGetStudentNonPathologicalHistoryWithData,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateStudentNonPathologicalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getNonPathologicalHistory: mockGetStudentNonPathologicalHistoryEmpty,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateStudentNonPathologicalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getNonPathologicalHistory: mockGetStudentNonPathologicalHistoryError,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateStudentNonPathologicalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
