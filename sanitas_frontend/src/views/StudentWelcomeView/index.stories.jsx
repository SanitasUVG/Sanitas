import { MemoryRouter } from "react-router-dom";
import StudentWelcomeView from ".";

export default {
	title: "Views/Patient/StudentWelcomeView",
	component: StudentWelcomeView,
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
};

const Template = (args) => <StudentWelcomeView {...args} />;

export const Default = Template.bind({});
