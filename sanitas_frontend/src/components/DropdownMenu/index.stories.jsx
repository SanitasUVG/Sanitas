import DropdownMenu from ".";

export default {
	title: "Components/DropdownMenu",
	component: DropdownMenu,
};

const Template = (args) => <DropdownMenu {...args} />;

export const Default = Template.bind({});
Default.args = {
	value: "option1",
	onChange: () => {},
	options: [
		{ value: "option1", label: "Option 1" },
		{ value: "option2", label: "Option 2" },
		{ value: "option3", label: "Option 3" },
	],
};
