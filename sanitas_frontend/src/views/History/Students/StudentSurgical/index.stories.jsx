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
	title: "Views/Antecedents/Student/StudentSurgicalHistory",
};

const dummyPatientId = 12345;

const mockGetBirthdayPatientInfo = async (_id) => ({
	result: { birthdate: "2000-02-11" },
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

const mockGetStudentSurgicalHistoryWithData = async (_id) => ({
	result: {
		medicalHistory: {
			surgeries: {
				data: [
					{
						surgeryType: "Appendectomy",
						surgeryYear: "2019",
						complications: "None",
					},
				],
				version: 1,
			},
		},
	},
});

const mockGetStudentSurgicalHistoryEmpty = async (_id) => ({
	result: {
		medicalHistory: {
			surgeries: {
				data: [],
				version: 1,
			},
		},
	},
});

const mockGetStudentSurgicalHistoryError = async (_id) => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateStudentSurgicalHistory = async (_id, history, version) => ({
	result: {
		medicalHistory: { surgeries: { data: history, version: version + 1 } },
	},
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getStudentSurgicalHistory: mockGetStudentSurgicalHistoryWithData,
		updateStudentSurgicalHistory: mockUpdateStudentSurgicalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getStudentSurgicalHistory: mockGetStudentSurgicalHistoryEmpty,
		updateStudentSurgicalHistory: mockUpdateStudentSurgicalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getStudentSurgicalHistory: mockGetStudentSurgicalHistoryError,
		updateStudentSurgicalHistory: mockUpdateStudentSurgicalHistory,
		sidebarConfig: sidebarConfigMock,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
