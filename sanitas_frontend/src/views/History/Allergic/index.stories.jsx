import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { AllergicHistory } from ".";
import { DEFAULT_DASHBOARD_SIDEBAR_PROPS } from "src/router";

export default {
	component: AllergicHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/allergic-history"]}>
				<Routes>
					<Route path="/allergic-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/Antecedents/AllergicHistory",
};

const dummyPatientId = 12345;

const mockGetAllergicHistoryWithData = async () => ({
	result: {
		medicalHistory: {
			medication: {
				data: [{ name: "Penicillin", severity: "Ambos" }],
				version: 1,
			},
			food: {
				data: [{ name: "Nuts", severity: "Ambos" }],
				version: 1,
			},
			dust: {
				data: [{ name: "House Dust", severity: "Respiratoria" }],
				version: 1,
			},
			pollen: {
				data: [{ name: "Tree Pollen", severity: "Respiratoria" }],
				version: 1,
			},
			climateChange: {
				data: [{ name: "Temperature Change", severity: "Low" }],
				version: 1,
			},
			animals: {
				data: [{ name: "Cats", severity: "Cutánea" }],
				version: 1,
			},
			others: {
				data: [{ name: "Unknown Substance", severity: "Unknown" }],
				version: 1,
			},
		},
	},
});

const mockGetAllergicHistoryEmpty = async () => ({
	result: {
		medicalHistory: {
			medication: { data: [], version: 1 },
			food: { data: [], version: 1 },
			dust: { data: [], version: 1 },
			pollen: { data: [], version: 1 },
			climateChange: { data: [], version: 1 },
			animals: { data: [], version: 1 },
			others: { data: [], version: 1 },
		},
	},
});

const mockGetAllergicHistoryError = async () => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateAllergicHistory = async (history) => ({
	result: { medicalHistory: history },
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getAllergicHistory: mockGetAllergicHistoryWithData,
		updateAllergicHistory: mockUpdateAllergicHistory,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getAllergicHistory: mockGetAllergicHistoryEmpty,
		updateAllergicHistory: mockUpdateAllergicHistory,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getAllergicHistory: mockGetAllergicHistoryError,
		updateAllergicHistory: mockUpdateAllergicHistory,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
