import { createEmptyStore } from "src/store.mjs";
import SearchPatientView from ".";

export default {
	component: SearchPatientView,
};

export const Default = {
	args: {
		searchPatientsApiCall: () => {
			const result = [{
				id: 1234,
				names: "Flavio",
			}];
			return { result };
		},
		useStore: createEmptyStore(),
	},
};

export const UserError = {
	args: {
		searchPatientsApiCall: () => {
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
	},
};

export const ServerError = {
	args: {
		searchPatientsApiCall: () => {
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
	},
};
