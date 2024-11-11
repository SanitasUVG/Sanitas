import { MemoryRouter } from "react-router-dom";
import { mockLogoutUser } from "src/cognito.mjs";
import { createEmptyStore } from "src/store.mjs";
import SearchPatientView from ".";
import "react-toastify/dist/ReactToastify.min.css";
import { ToastContainer } from "react-toastify";

export default {
	title: "Views/SearchPatientView",
	component: SearchPatientView,
	decorators: [
		(Story) => (
			<>
				<ToastContainer />
				<MemoryRouter>
					<Story />
				</MemoryRouter>
			</>
		),
	],
};

const Template = (args) => <SearchPatientView {...args} />;
const mockGetRole = async () => ({ result: "doctor" });
const mockGetLinkedPatient = async () => null;
const mockExportData = () => Promise.resolve({ result: "CSV data..." });
const mockExportDataFail = () => Promise.reject({ error: "FOKIU" });

export const Default = Template.bind({});
Default.args = {
	searchPatientsApiCall: async (_query, _type) => {
		const result = {
			result: [
				{
					id: 1,
					cui: "1234567890123",
					names: "Juan",
					lastNames: "Pérez",
					age: "19",
				},
				{
					id: 3,
					cui: "1236237123727",
					names: "Juan",
					lastNames: "Lopez",
					age: "19",
				},
				{
					id: 4,
					cui: "1273723812811",
					names: "Juan",
					lastNames: "Osoy",
					age: "19",
				},
			],
		};
		return result;
	},
	useStore: createEmptyStore(),
	logoutUser: mockLogoutUser,
	getRole: mockGetRole,
	getLinkedPatient: mockGetLinkedPatient,
	exportData: mockExportData,
};

export const UserError = Template.bind({});
UserError.args = {
	searchPatientsApiCall: async () => {
		// Simulate a user error
		const error = {
			cause: {
				response: {
					status: 400,
				},
			},
		};
		return { error };
	},
	useStore: createEmptyStore(),
	logoutUser: mockLogoutUser,
	getRole: mockGetRole,
	getLinkedPatient: mockGetLinkedPatient,
	exportData: mockExportData,
};

export const ServerError = Template.bind({});
ServerError.args = {
	searchPatientsApiCall: async () => {
		// Simulate a server error
		const error = {
			cause: {
				response: {
					status: 500,
				},
			},
		};
		return { error };
	},
	useStore: createEmptyStore(),
	logoutUser: mockLogoutUser,
	getRole: mockGetRole,
	getLinkedPatient: mockGetLinkedPatient,
	exportData: mockExportDataFail,
};
