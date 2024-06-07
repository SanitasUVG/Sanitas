import { action } from "@storybook/addon-actions";
import React from "react";
import { DateInput } from ".";

export default {
  title: "Components/DateInput",
  component: DateInput,
};

const Template = (args) => <DateInput {...args} />;

export const Default = Template.bind({});
Default.args = {
  value: "2024-06-06",
  placeholder: "Selecciona una fecha",
  onChange: action("date changed"),
};

export const WithInitialDate = Template.bind({});
WithInitialDate.args = {
  value: "2024-01-01",
  placeholder: "Fecha de inicio",
  onChange: action("initial date changed"),
};
