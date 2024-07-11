import { action } from "@storybook/addon-actions";
import React from "react";
import RadioInput from "./radio.jsx";

export default {
	title: "Components/RadioInput",
	component: RadioInput,
};

const Template = (args) => <RadioInput {...args} />;

export const Default = Template.bind({});
Default.args = {
	name: "example",
	checked: false,
	label: "Opción 1",
	onChange: action("radio changed"),
};

export const Checked = Template.bind({});
Checked.args = {
	name: "example",
	checked: true,
	label: "Opción 2",
	onChange: action("radio checked changed"),
};
