import React from "react";
import { MemoryRouter } from "react-router-dom";
import { mockLogoutUser } from "src/cognito.mjs";
import { createEmptyStore } from "src/store.mjs";
import SearchPatientView from ".";

export default {
	title: "Views/SearchPatientView",
	component: SearchPatientView,
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
};

const Template = (args) => <SearchPatientView {...args} />;

export const Default = Template.bind({});
Default.args = {
	searchPatientsApiCall: async (query, type) => {
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
};
