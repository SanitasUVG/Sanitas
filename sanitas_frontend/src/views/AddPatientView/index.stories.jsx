import { action } from "@storybook/addon-actions";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import { AddPatientView } from ".";

export default {
  title: "Views/AddPatientView",
  component: AddPatientView,
  decorators: [
    (Story) => (
      <MemoryRouter
        initialEntries={[{ pathname: "/add-patient", state: { cui: "1234567890123" } }]}
      >
        <Story />
      </MemoryRouter>
    ),
  ],
};

const mockUseStore = () => ({
  setSelectedPatientId: action("Set Selected Patient ID"),
});

const Template = (args) => <AddPatientView {...args} useStore={mockUseStore} />;

export const Default = Template.bind({});
Default.args = {
  submitPatientData: async (patientData) => {
    action("Submitting patient data")(patientData);
    return Promise.resolve({
      message: "Patient data submitted successfully",
      patientId: "new_patient_id_123",
    });
  },
};
