import { action } from "@storybook/addon-actions";
import arrowRight from "@tabler/icons/outline/arrow-narrow-right.svg";
import React from "react";
import IconButton from ".";

export default {
	title: "Components/IconButton",
	component: IconButton,
	argTypes: {
		onClick: { action: "clicked" },
	},
};

const Template = (args) => <IconButton {...args} />;

export const Default = Template.bind({});
Default.args = {
	icon: arrowRight,
	onClick: action("Icon Button clicked"),
};
