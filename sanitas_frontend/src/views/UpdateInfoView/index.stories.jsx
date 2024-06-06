import { MemoryRouter } from "react-router-dom";
import UpdateInfoView from "./index";

export default {
  component: UpdateInfoView,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

const examplePatientData = {
  id: 1,
  nombres: "John",
  apellidos: "Doe",
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

export const Default = {
  args: {
    location: { state: { id: examplePatientData.id } },
  },
};

export const WithPatientData = {
  args: {
    location: { state: { id: examplePatientData.id } },
  },
  loaders: [
    async () => {
      // Simulate fetching patient data
      return {
        data: examplePatientData,
      };
    },
  ],
};

export const ErrorState = {
  args: {
    location: { state: { id: 9999 } }, // ID that will cause an error
  },
  loaders: [
    async () => {
      // Simulate an error fetching patient data
      throw new Error("Error al buscar el paciente. Asegúrese de que el ID es correcto.");
    },
  ],
};
