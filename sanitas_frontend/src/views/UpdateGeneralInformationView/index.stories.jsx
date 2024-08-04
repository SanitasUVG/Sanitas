import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import UpdateInfoView from "./index";

export default {
	component: UpdateInfoView,
	decorators: [
		(Story) => {
			return (
				<MemoryRouter>
					<Routes>
						<Route path="/" element={<Story />} />
					</Routes>
				</MemoryRouter>
			);
		},
	],
};

const examplePatientData = {
	id: 6969,
	names: "Johnaaaa",
	lastNames: "Doee",
	isWoman: false,
	email: "john.doe@example.com",
	contactName1: "Jane Doe",
	contactKinship1: "Sister",
	contactPhone1: "123456789",
	contactName2: "Mike Doe",
	contactKinship2: "Brother",
	contactPhone2: "987654321",
	bloodType: "O+",
	address: "123 Main St",
	insuranceId: 12345,
	birthdate: "1980-01-01",
	phone: "555-1234",
};

const mockGetGeneralPatientInformation = async (id) => {
	if (id === examplePatientData.id) {
		return { result: examplePatientData };
	} else {
		return {
			error: new Error(
				"Error al buscar el paciente. Asegúrese de que el ID es correcto.",
			),
		};
	}
};
const mockGetStudentPatientInformation = async (id) => {
	if (id === examplePatientData.id) {
		return {
			result: { patientId: id, carnet: "22386", career: "Lic. Computación" },
		};
	} else {
		return {
			error: new Error(
				"Error al buscar el paciente. Asegúrese de que el ID es correcto.",
			),
		};
	}
};

const mockGetCollaboratorInformation = async (id) => {
	if (id === examplePatientData.id) {
		return { result: { patientId: id, code: "C001", area: "Administracion" } };
	} else {
		return {
			error: new Error(
				"Error al buscar el paciente. Asegúrese de que el ID es correcto.",
			),
		};
	}
};

const correctStore = createEmptyStore({
	selectedPatientId: examplePatientData.id,
});

export const WithPatientData = {
	args: {
		getGeneralPatientInformation: mockGetGeneralPatientInformation,
		getStudentPatientInformation: mockGetStudentPatientInformation,
		getCollaboratorInformation: mockGetCollaboratorInformation,
		useStore: correctStore,
		sidebarConfig: {
			userInformation: {
				displayName: "Jennifer Bustamante",
				title: "Doctora UVG",
			},
		},
	},
};

const incorrectStore = createEmptyStore({
	selectedPatientId: 999, // ID que causará un error
});
export const ErrorState = {
	args: {
		getGeneralPatientInformation: mockGetGeneralPatientInformation,
		getStudentPatientInformation: mockGetStudentPatientInformation,
		getCollaboratorInformation: mockGetCollaboratorInformation,
		useStore: incorrectStore,
		sidebarConfig: {
			userInformation: {
				displayName: "Jennifer Bustamante",
				title: "Doctora UVG",
			},
		},
	},
};
