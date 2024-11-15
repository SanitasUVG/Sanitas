import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { STUDENT_DASHBOARD_SIDEBAR_PROPS } from "src/router";
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
	title: "Views/Patient/Antecedents/StudentFamilyHistory",
};
//mocks
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
	selectedPatientId: 1234,
});

export const WithData = {
	args: {
		getStudentFamilyHistory: mockGetStudentFamilyHistoryWithData,
		updateStudentFamilyHistory: mockUpdateStudentFamilyHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getStudentFamilyHistory: mockGetStudentFamilyHistoryEmpty,
		updateStudentFamilyHistory: mockUpdateStudentFamilyHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getStudentFamilyHistory: mockGetStudentFamilyHistoryError,
		updateStudentFamilyHistory: mockUpdateStudentFamilyHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
