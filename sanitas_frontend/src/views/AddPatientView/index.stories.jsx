import React from "react";
import { MemoryRouter } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { AddPatientView } from ".";

export default {
  title: "Views/AddPatientView",
  component: AddPatientView,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/add-patient", { state: { cui: "1234567890123" } }]}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

const Template = (args) => <AddPatientView {...args} />;
const useStore = createEmptyStore();

export const Default = Template.bind({});
Default.args = {
  submitPatientData: async (patientData) => {
    alert("Submitting data: " + JSON.stringify(patientData));
    return Promise.resolve();
  },
  useStore: useStore,
};
