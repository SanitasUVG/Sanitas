import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { StudentTraumatologicalHistory } from ".";
import { STUDENT_DASHBOARD_SIDEBAR_PROPS } from "src/router";

export default {
	component: StudentTraumatologicalHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/student-traumatological-history"]}>
				<Routes>
					<Route path="/student-traumatological-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/Patient/Antecedents/StudentTraumatologicHistory",
};

const dummyPatientId = 12345;

const mockGetBirthdayPatientInfo = async (_id) => ({
	result: { birthdate: "2000-02-11" },
});

const mockGetTraumatologicHistoryWithData = async (_id) => ({
	result: {
		medicalHistory: {
			traumas: {
				data: [{ whichBone: "Femur", year: "2023", treatment: "Cirugía" }],
				version: 1,
			},
		},
	},
});

const mockGetTraumatologicHistoryEmpty = async (_id) => ({
	result: {
		medicalHistory: {
			traumas: {
				data: [],
				version: 1,
			},
		},
	},
});

const mockGetTraumatologicHistoryError = async (_id) => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateTraumatologicHistory = async (_id, history, version) => ({
	result: {
		medicalHistory: { traumas: { data: history, version: version + 1 } },
	},
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getTraumatologicHistory: mockGetTraumatologicHistoryWithData,
		updateTraumatologicHistory: mockUpdateTraumatologicHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getTraumatologicHistory: mockGetTraumatologicHistoryEmpty,
		updateTraumatologicHistory: mockUpdateTraumatologicHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getTraumatologicHistory: mockGetTraumatologicHistoryError,
		updateTraumatologicHistory: mockUpdateTraumatologicHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
