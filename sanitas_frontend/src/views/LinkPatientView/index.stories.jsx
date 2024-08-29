import { MemoryRouter } from "react-router-dom";
import { LinkPatientView } from ".";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

export default {
	title: "Views/LinkPatientView",
	component: LinkPatientView,
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

export const PatientExistsButIsntLinked = {
	args: {
		linkAccount: async () => {
			return { result: 1 };
		},
	},
};

export const PatientIsAlreadyLinked = {
	args: {
		linkAccount: async () => {
			return {
				error: new Error("Patient is already linked to another account!"),
			};
		},
	},
};

export const PatientDoesntExist = {
	args: {
		linkAccount: async () => {
			return { error: new Error("No patient with the given CUI found!") };
		},
	},
};
