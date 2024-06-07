import React from "react";

import SearchInput from "./search.jsx";

export default {
  title: "Components/SearchInput",
  component: SearchInput,
  argTypes: {
    type: {
      control: "select",
      options: ["text", "number", "date", "email", "password"],
    },
    placeholder: {
      control: "text",
    },
  },
};

const Template = (args) => <SearchInput {...args} />;

export const TextSearchInput = Template.bind({});
TextSearchInput.args = {
  type: "text",
  placeholder: "Buscar aquí...",
};