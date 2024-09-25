import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { PsichiatricHistory } from ".";
import { DEFAULT_DASHBOARD_SIDEBAR_PROPS } from "src/router";

export default {
	component: PsichiatricHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/psychiatric-history"]}>
				<Routes>
					<Route path="/psychiatric-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/Antecedents/PsichiatricHistory",
};

const dummyPatientId = 12345;

const mockGetPsichiatricHistoryWithData = async () => ({
	result: {
		medicalHistory: {
			depression: {
				version: 1,
				data: [
					{
						medication: "Antidepressants",
						dose: "20mg",
						frequency: "Daily",
						ube: true,
					},
				],
			},
			anxiety: {
				version: 1,
				data: [
					{
						medication: "Anxiolytics",
						dose: "10mg",
						frequency: "As needed",
						ube: false,
					},
				],
			},
			ocd: {
				version: 1,
				data: [
					{
						medication: "SSRIs",
						dose: "50mg",
						frequency: "Daily",
						ube: false,
					},
				],
			},
			adhd: {
				version: 1,
				data: [
					{
						medication: "Stimulants",
						dose: "30mg",
						frequency: "Morning",
						ube: true,
					},
				],
			},
			bipolar: {
				version: 1,
				data: [
					{
						medication: "Mood Stabilizers",
						dose: "150mg",
						frequency: "Twice daily",
						ube: false,
					},
				],
			},
			other: {
				version: 1,
				data: [
					{
						illness: "Schizophrenia",
						medication: "Antipsychotics",
						dose: "200mg",
						frequency: "Night",
						ube: true,
					},
				],
			},
		},
	},
});

const mockGetPsichiatricHistoryEmpty = async () => ({
	result: {
		medicalHistory: {
			depression: { data: [], version: 1 },
			anxiety: { data: [], version: 1 },
			ocd: { data: [], version: 1 },
			adhd: { data: [], version: 1 },
			bipolar: { data: [], version: 1 },
			other: { data: [], version: 1 },
		},
	},
});

const mockGetPsichiatricHistoryError = async () => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdatePsichiatricHistory = async (history) => ({
	result: { medicalHistory: history },
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getPsichiatricHistory: mockGetPsichiatricHistoryWithData,
		updatePsichiatricHistory: mockUpdatePsichiatricHistory,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getPsichiatricHistory: mockGetPsichiatricHistoryEmpty,
		updatePsichiatricHistory: mockUpdatePsichiatricHistory,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getPsichiatricHistory: mockGetPsichiatricHistoryError,
		updatePsichiatricHistory: mockUpdatePsichiatricHistory,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
