import React from "react";
import { MemoryRouter } from "react-router-dom";
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
    // Simulate a successful API call with predefined data
    const result = [
      {
        id: 1234,
        names: "Flavio",
        lastNames: "Martinez",
        cui: "1234567890123",
        age: 34,
      },
    ];
    return { result };
  },
  getGeneralPatientInformation: async (id) => {
    // Simulate fetching general patient information
    return {
      result: {
        id: id,
        cui: "1234567890123",
        names: "Flavio",
        lastNames: "Martinez",
        birthdate: "1986-04-12",
      },
    };
  },
  useStore: createEmptyStore(),
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
};

export const ServerError = Template.bind({});
ServerError.args = {
  getGeneralPatientInformation: async (id) => {
    // Simulate a server error for fetching general patient information
    throw {
      response: {
        status: 500,
        data: "Internal Server Error",
      },
    };
  },
  useStore: createEmptyStore(),
};
