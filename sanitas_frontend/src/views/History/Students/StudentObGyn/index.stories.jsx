import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StudentObGynHistory } from ".";
import { createEmptyStore } from "src/store.mjs";
import { STUDENT_DASHBOARD_SIDEBAR_PROPS } from "src/router";

// Mock functions and data
const mockGetBirthdayPatientInfo = async () => ({
	result: {
		birthdate: "1980-01-01",
	},
});

const mockGetObGynHistoryWithData = async () => ({
	result: {
		medicalHistory: {
			firstMenstrualPeriod: { data: { age: 15 } },
			regularCycles: { data: { isRegular: true } },
			painfulMenstruation: { data: { isPainful: false, medication: "" } },
			pregnancies: {
				data: {
					totalPregnancies: 2,
					abortions: 0,
					cesareanSections: 1,
					vaginalDeliveries: 1,
				},
			},
			diagnosedIllnesses: {
				data: {
					ovarianCysts: {
						medication: {
							dosage: "100mg",
							frequency: "Daily",
							medication: "Ibuprofen",
						},
					},
					uterineMyomatosis: {
						medication: {
							dosage: "50mg",
							frequency: "Twice a day",
							medication: "Paracetamol",
						},
					},
					endometriosis: {
						medication: { dosage: "", frequency: "", medication: "" },
					},
					otherCondition: [
						{
							medication: {
								illness: "illness A",
								medication: "Med D",
								dosage: "500mg",
								frequency: "Once a day",
							},
						},
					],
				},
			},
			hasSurgeries: {
				data: {
					ovarianCystsSurgery: [{ year: 2005, complications: false }],
					hysterectomy: { year: 2010, complications: true },
					sterilizationSurgery: { year: null, complications: false },
					breastMassResection: [{ year: 2015, complications: false }],
				},
			},
		},
	},
});

const mockGetObGynHistoryEmpty = async () => ({
	result: {
		medicalHistory: {
			firstMenstrualPeriod: { data: { age: null } },
			regularCycles: { data: { isRegular: null } },
			painfulMenstruation: { data: { isPainful: null, medication: "" } },
			pregnancies: {
				data: {
					totalPregnancies: null,
					abortions: null,
					cesareanSections: null,
					vaginalDeliveries: null,
				},
			},
			diagnosedIllnesses: {
				data: {
					ovarianCysts: {},
					uterineMyomatosis: {},
					endometriosis: {},
					otherCondition: [],
				},
			},
			hasSurgeries: {
				data: {
					ovarianCystsSurgery: [],
					hysterectomy: {},
					sterilizationSurgery: {},
					breastMassResection: [],
				},
			},
		},
	},
});

const mockGetObGynHistoryError = async () => ({
	result: {
		medicalHistory: {
			firstMenstrualPeriod: { data: { age: 15 } },
			regularCycles: { data: { isRegular: true } },
			painfulMenstruation: { data: { isPainful: false, medication: "" } },
			pregnancies: {
				data: {
					totalPregnancies: 2,
					abortions: 0,
					cesareanSections: 1,
					vaginalDeliveries: 1,
				},
			},
			diagnosedIllnesses: {
				data: {
					ovarianCysts: {
						medication: {
							dosage: "100mg",
							frequency: "Daily",
							medication: "Ibuprofen",
						},
					},
					uterineMyomatosis: {
						medication: {
							dosage: "50mg",
							frequency: "Twice a day",
							medication: "Paracetamol",
						},
					},
					endometriosis: {
						medication: { dosage: "", frequency: "", medication: "" },
					},
					otherCondition: [
						{
							medication: {
								illness: "illness A",
								medication: "Med D",
								dosage: "500mg",
								frequency: "Once a day",
							},
						},
					],
				},
			},
			hasSurgeries: {
				data: {
					ovarianCystsSurgery: [{ year: 2005, complications: false }],
					hysterectomy: { year: 2010, complications: true },
					sterilizationSurgery: { year: null, complications: false },
					breastMassResection: [{ year: 2015, complications: false }],
				},
			},
		},
	},
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateObGynHistory = async () => ({
	success: true,
});

const store = createEmptyStore({
	selectedPatientId: 12345, // Mock patient ID
});

export default {
	title: "Views/Patient/Antecedents/ObGynHistory",
	component: StudentObGynHistory,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/obgyn-history"]}>
				<Routes>
					<Route path="/obgyn-history" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
};

export const WithData = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getObGynHistory: mockGetObGynHistoryWithData,
		updateObGynHistory: mockUpdateObGynHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getObGynHistory: mockGetObGynHistoryEmpty,
		updateObGynHistory: mockUpdateObGynHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getBirthdayPatientInfo: mockGetBirthdayPatientInfo,
		getObGynHistory: mockGetObGynHistoryError,
		updateObGynHistory: mockUpdateObGynHistory,
		sidebarConfig: STUDENT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
