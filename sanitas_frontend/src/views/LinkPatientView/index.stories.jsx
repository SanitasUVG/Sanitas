import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LinkPatientView } from ".";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { NAV_PATHS } from "src/router";

export default {
	title: "Views/LinkPatientView",
	component: LinkPatientView,
	decorators: [
		(Story) => (
			<>
				<ToastContainer />
				<MemoryRouter>
					<Routes>
						<Route path="/" element={<Story />} />
						<Route
							path={NAV_PATHS.PATIENT_FORM}
							element={<h1>Formulario paciente</h1>}
						/>
						<Route
							path={NAV_PATHS.CREATE_PATIENT}
							element={<h1>Formulario de creación de paciente!</h1>}
						/>
					</Routes>
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
			const error = "Patient is already linked to another account!";
			return {
				error: { error },
			};
		},
	},
};

export const PatientDoesntExist = {
	args: {
		linkAccount: async () => {
			const error = "No patient with the given CUI found!";
			return { error: { error } };
		},
	},
};
