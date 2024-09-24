import { MemoryRouter } from "react-router-dom";
import { action } from "@storybook/addon-actions";
import StudentDashboardTopbar from ".";

const mockNavigate = (route) => action(`Navigate to: ${route}`);

export default {
	title: "Components/StudentTopBar",
	component: StudentDashboardTopbar,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/student"]}>
				<Story />
			</MemoryRouter>
		),
	],
};

const Template = (args) => <StudentDashboardTopbar {...args} />;

export const Default = Template.bind({});
Default.args = {
	navigateToGeneralStudent: () => mockNavigate("General"),
	navigateToPersonalStudent: () => mockNavigate("Personal"),
	navigateToFamiliarStudent: () => mockNavigate("Familiar"),
	navigateToAllergiesStudent: () => mockNavigate("Allergies"),
	navigateToObstetricsStudent: () => mockNavigate("Obstetrics"),
	navigateToNonPathologicalStudent: () => mockNavigate("NonPathological"),
	navigateToPsiquiatricStudent: () => mockNavigate("Psiquiatric"),
	navigateToSurgicalStudent: () => mockNavigate("Surgical"),
	navigateToTraumatologicalStudent: () => mockNavigate("Traumatological"),
};

// Puedes agregar más variaciones si es necesario