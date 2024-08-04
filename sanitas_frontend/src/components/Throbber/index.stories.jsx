
import Throbber from ".";

export default {
	title: "Components/Throbber",
	component: Throbber,
};

const Template = (args) => <Throbber {...args} />;

export const Default = Template.bind({});
/**
 * @type {import(".").ThrobberProps}
 */
Default.args = {
	loadingMessage: "Cargando data...",
};
