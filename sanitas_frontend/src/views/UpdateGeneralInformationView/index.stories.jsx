import { MemoryRouter, Route, Routes } from "react-router-dom";
import UpdateInfoView from "./index";

export default {
  component: UpdateInfoView,
  decorators: [
    (Story, context) => {
      const { id } = context.args.location.state;
      return (
        <MemoryRouter initialEntries={[{ pathname: "/", state: { id } }]}>
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
  names: "John",
  lastNames: "Doe",
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
    return examplePatientData;
  } else {
    throw new Error("Error al buscar el paciente. Asegúrese de que el ID es correcto.");
  }
};

export const WithPatientData = {
  args: {
    getGeneralPatientInformation: mockGetGeneralPatientInformation,
    location: { state: { id: examplePatientData.id } },
    sidebarConfig: {
      userInformation: {
        displayName: "Jennifer Bustamante",
        title: "Doctora UVG",
      },
    },
  },
};

export const ErrorState = {
  args: {
    getGeneralPatientInformation: async (id) => {
    },
    location: { state: { id: 9999 } }, // ID que causará un error
    sidebarConfig: {
      userInformation: {
        displayName: "Jennifer Bustamante",
        title: "Doctora UVG",
      },
    },
  },
};
