import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { StudentFamiliarHistory } from ".";

export default {
	component: StudentFamiliarHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/student-family-history"]}>
				<Routes>
					<Route path="/student-family-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/Antecedents/Student/StudentFamilyHistory",
};

const dummyPatientId = 12345;

const mockGetStudentFamilyHistoryWithData = async () => ({
	result: {
		medicalHistory: {
			hypertension: { data: ["Father"], version: 1 },
			diabetesMellitus: { data: ["Mother"], version: 1 },
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

const mockGetStudentFamilyHistoryEmpty = async () => ({
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

const mockGetStudentFamilyHistoryError = async () => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateStudentFamilyHistory = async (history) => ({
	result: { medicalHistory: history },
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getStudentFamilyHistory: mockGetStudentFamilyHistoryWithData,
		updateStudentFamilyHistory: mockUpdateStudentFamilyHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getStudentFamilyHistory: mockGetStudentFamilyHistoryEmpty,
		updateStudentFamilyHistory: mockUpdateStudentFamilyHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getStudentFamilyHistory: mockGetStudentFamilyHistoryError,
		updateStudentFamilyHistory: mockUpdateStudentFamilyHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
