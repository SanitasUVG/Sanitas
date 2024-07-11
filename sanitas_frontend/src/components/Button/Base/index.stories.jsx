import { action } from "@storybook/addon-actions";
import React from "react";
import BaseButton from ".";

export default {
	title: "Components/BaseButton",
	component: BaseButton,
	argTypes: {
		text: { control: "text" },
		onClick: { action: "clicked" },
		style: { control: "object" },
	},
};

const Template = (args) => <BaseButton {...args} />;

export const Default = Template.bind({});
Default.args = {
	text: "Buscar paciente",
	onClick: action("clicked"),
};
