import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { NonPathologicalHistory } from ".";

export default {
	component: NonPathologicalHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/non-pathological-history"]}>
				<Routes>
					<Route path="/non-pathological-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/Antecedents/NonPathologicalHistory",
};

const dummyPatientId = 12345;

const mockGetBloodTypePatientInfo = async () => ({
	result: {
		bloodType: "O+",
	},
});

const mockGetNonPathologicalHistoryWithData = async () => ({
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

const mockGetNonPathologicalHistoryEmpty = async () => ({
	result: {
		medicalHistory: {
			smoker: { data: [], version: 1 },
			drink: { data: [], version: 1 },
			drugs: { data: [], version: 1 },
		},
		bloodType: "",
	},
});

const mockGetNonPathologicalHistoryError = async () => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateNonPathologicalHistory = async (history) => ({
	result: { medicalHistory: history, bloodType: history.bloodType },
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getNonPathologicalHistory: mockGetNonPathologicalHistoryWithData,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateNonPathologicalHistory,
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
		getNonPathologicalHistory: mockGetNonPathologicalHistoryEmpty,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateNonPathologicalHistory,
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
		getNonPathologicalHistory: mockGetNonPathologicalHistoryError,
		getBloodTypePatientInfo: mockGetBloodTypePatientInfo,
		updateNonPathologicalHistory: mockUpdateNonPathologicalHistory,
		sidebarConfig: {
			userInformation: {
				displayName: "Dr. John Smith",
				title: "Cirujano",
			},
		},
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
