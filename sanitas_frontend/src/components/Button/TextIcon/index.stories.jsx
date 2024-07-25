import { action } from "@storybook/addon-actions";
import arrowRight from "@tabler/icons/outline/arrow-narrow-right.svg";
import React from "react";
import TextIconButton from ".";

export default {
	title: "Components/TextIconButton",
	component: TextIconButton,
	argTypes: {
		onClick: { action: "clicked" },
	},
};

const Template = (args) => <TextIconButton {...args} />;

export const Default = Template.bind({});
Default.args = {
	icon: arrowRight,
	text: "Next",
	onClick: action("Text Icon Button clicked"),
};
