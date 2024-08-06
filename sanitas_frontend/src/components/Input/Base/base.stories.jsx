import { action } from "@storybook/addon-actions";
import BaseInput from "./base.jsx";

export default {
	title: "Components/BaseInput",
	component: BaseInput,
	argTypes: {
		type: {
			control: "select",
			options: ["text", "number", "date", "email", "password"],
		},
	},
};

const Template = (args) => <BaseInput {...args} />;

export const Default = Template.bind({});
Default.args = {
	type: "text",
	value: "",
	placeholder: "Introduce nombre aquí...",
	onChange: action("text input changed"),
};

export const EmailInput = Template.bind({});
EmailInput.args = {
	type: "email",
	value: "",
	placeholder: "ejemplo@gmail.com",
	onChange: action("email input changed"),
};
