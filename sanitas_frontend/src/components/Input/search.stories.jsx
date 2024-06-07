import { action } from "@storybook/addon-actions";
import React, { useState } from "react";
import { SearchInput } from ".";

export default {
  title: "Components/SearchInput",
  component: SearchInput,
};

const TextSearchTemplate = (args) => {
  const [value, setValue] = useState("");

  const handleChange = (event) => {
    setValue(event.target.value);
    action("Input Changed")(event.target.value);
  };

  return <SearchInput {...args} value={value} onChange={handleChange} />;
};

export const TextSearch = TextSearchTemplate.bind({});
TextSearch.args = {
  type: "text",
  placeholder: "Buscar...",
};
