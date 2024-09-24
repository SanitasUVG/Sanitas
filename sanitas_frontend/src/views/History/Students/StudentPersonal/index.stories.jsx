import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { StudentPersonalHistory } from ".";

export default {
	component: StudentPersonalHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/student-personal-history"]}>
				<Routes>
					<Route path="/student-personal-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/Antecedents/Student/StudentPersonalHistory",
};

const dummyPatientId = 12345;

const mockGetBirthdayPatientInfo = async (_id) => ({
	result: { birthdate: "2000-02-11" },
});

const mockGetStudentPersonalHistoryWithData = async () => ({
	result: {
		medicalHistory: {
			hypertension: {
				data: [
					{
						typeOfDisease: "hiper",
						medicine: "ibuprofeno",
						dose: "10",
						frequency: "21",
					},
				],
				version: 1,
			},
			diabetesMellitus: {
				data: [
					{
						typeOfDisease: "dia",
						medicine: "azucar",
						dose: "12",
						frequency: "23",
					},
				],
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

const mockGetStudentPersonalHistoryEmpty = async () => ({
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

const mockGetStudentPersonalHistoryError = async () => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateStudentPersonalHistory = async (history) => ({
	result: { medicalHistory: history },
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getStudentPersonalHistory: mockGetStudentPersonalHistoryWithData,
		updateStudentPersonalHistory: mockUpdateStudentPersonalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getStudentPersonalHistory: mockGetStudentPersonalHistoryEmpty,
		updateStudentPersonalHistory: mockUpdateStudentPersonalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getStudentPersonalHistory: mockGetStudentPersonalHistoryError,
		updateStudentPersonalHistory: mockUpdateStudentPersonalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
