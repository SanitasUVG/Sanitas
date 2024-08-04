import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { SurgicalHistory } from ".";

export default {
	component: SurgicalHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/surgical-history"]}>
				<Routes>
					<Route path="/surgical-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/SurgicalHistory",
};

const dummyPatientId = 12345;

const mockGetBirthdayPatientInfo = async (_id) => ({
	result: { birthdate: "2000-02-11" },
});

const mockGetSurgicalHistoryWithData = async (_id) => ({
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

const mockGetSurgicalHistoryEmpty = async (_id) => ({
	result: {
		medicalHistory: {
			surgeries: {
				data: [],
				version: 1,
			},
		},
	},
});

const mockGetSurgicalHistoryError = async (_id) => ({
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateSurgicalHistory = async (_id, history, version) => ({
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
		getSurgicalHistory: mockGetSurgicalHistoryWithData,
		updateSurgicalHistory: mockUpdateSurgicalHistory,
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
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getSurgicalHistory: mockGetSurgicalHistoryEmpty,
		updateSurgicalHistory: mockUpdateSurgicalHistory,
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
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getSurgicalHistory: mockGetSurgicalHistoryError,
		updateSurgicalHistory: mockUpdateSurgicalHistory,
		sidebarConfig: {
			userInformation: {
				displayName: "Dr. John Smith",
				title: "Cirujano",
			},
		},
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
