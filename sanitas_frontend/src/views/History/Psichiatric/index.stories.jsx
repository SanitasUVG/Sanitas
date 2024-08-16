import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { PsichiatricHistory } from ".";

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
				data: {
					medication: "Antidepressants",
					dose: "20mg",
					frequency: "Daily",
					ube: true,
				},
				version: 1,
			},
			anxiety: {
				data: {
					medication: "Anxiolytics",
					dose: "10mg",
					frequency: "As needed",
					ube: false,
				},
				version: 1,
			},
			ocd: {
				data: {
					medication: "SSRIs",
					dose: "50mg",
					frequency: "Daily",
					ube: false,
				},
				version: 1,
			},
			adhd: {
				data: {
					medication: "Stimulants",
					dose: "30mg",
					frequency: "Morning",
					ube: true,
				},
				version: 1,
			},
			bipolar: {
				data: {
					medication: "Mood Stabilizers",
					dose: "150mg",
					frequency: "Twice daily",
					ube: false,
				},
				version: 1,
			},
			other: {
				data: {
					ill: "Schizophrenia",
					medication: "Antipsychotics",
					dose: "200mg",
					frequency: "Night",
					ube: true,
				},
				version: 1,
			},
		},
	},
});

const mockGetPsichiatricHistoryEmpty = async () => ({
	result: {
		medicalHistory: {
			depression: { data: {}, version: 1 },
			anxiety: { data: {}, version: 1 },
			ocd: { data: {}, version: 1 },
			adhd: { data: {}, version: 1 },
			bipolar: { data: {}, version: 1 },
			other: { data: {}, version: 1 },
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
		sidebarConfig: {
			userInformation: {
				displayName: "Dr. Jane Doe",
				title: "Psychiatrist",
			},
		},
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getPsichiatricHistory: mockGetPsichiatricHistoryEmpty,
		updatePsichiatricHistory: mockUpdatePsichiatricHistory,
		sidebarConfig: {
			userInformation: {
				displayName: "Dr. Jane Doe",
				title: "Psychiatrist",
			},
		},
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getPsichiatricHistory: mockGetPsichiatricHistoryError,
		updatePsichiatricHistory: mockUpdatePsichiatricHistory,
		sidebarConfig: {
			userInformation: {
				displayName: "Dr. Jane Doe",
				title: "Psychiatrist",
			},
		},
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
