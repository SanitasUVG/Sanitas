
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { FamiliarHistory } from ".";

export default {
	component: FamiliarHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/familiar-history"]}>
				<Routes>
					<Route path="/familiar-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/FamiliarHistory",
};

const dummyPatientId = 12345;

const mockGetFamiliarHistoryWithData = async (_id) => ({
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

const mockGetFamiliarHistoryEmpty = async (_id) => ({
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
const mockGetFamiliarHistoryError = async (_id) => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateFamiliarHistory = async (_id, history, _version) => ({
	result: { medicalHistory: history },
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getFamiliarHistory: mockGetFamiliarHistoryWithData,
		updateFamiliarHistory: mockUpdateFamiliarHistory,
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
		getFamiliarHistory: mockGetFamiliarHistoryEmpty,
		updateFamiliarHistory: mockUpdateFamiliarHistory,
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
		getFamiliarHistory: mockGetFamiliarHistoryError,
		updateFamiliarHistory: mockUpdateFamiliarHistory,
		sidebarConfig: {
			userInformation: {
				displayName: "Dr. John Smith",
				title: "Cirujano",
			},
		},
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
