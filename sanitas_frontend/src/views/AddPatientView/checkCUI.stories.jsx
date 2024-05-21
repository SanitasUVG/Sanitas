import React from "react";
import { MemoryRouter } from "react-router-dom";
import AddPatientView from "./index";

export default {
  title: "AddPatientView",
  component: AddPatientView,
  argTypes: {
    foundUserData: { action: "foundUserData" },
    useStore: { action: "useStore" },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
};

const Template = (args) => <AddPatientView {...args} />;

export const Default = Template.bind({});
Default.args = {
  foundUserData: async (cui) => {
    if (cui === "1234567890123") {
      return { names: "Juan", surnames: "Pérez", sex: "Masculino", birthDate: "1990-01-01" };
    }
    return {};
  },
  useStore: () => {},
};
