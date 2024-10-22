import ExpandingBaseInput from ".";
import { action } from "@storybook/addon-actions";

export default {
	title: "Components/ExpandingBaseInput",
	component: ExpandingBaseInput,
	argTypes: {
		placeholder: { control: "text" },
		value: { control: "text" },
	},
};

const Template = (args) => (
	<ExpandingBaseInput {...args} onChange={action("textarea changed")} />
);

export const Default = Template.bind({});
Default.args = {
	placeholder: "Escribe algo...",
	value: "",
};

export const WithInitialText = Template.bind({});
WithInitialText.args = {
	value:
		"Texto inicial muy largo para ver cómo se expande el área de texto automáticamente al cargar el componente.",
	placeholder: "Escribe algo...",
};
