import React from "react";
import { MemoryRouter } from "react-router-dom"; // Para simular el enrutamiento
import { action } from "@storybook/addon-actions"; // Para simular y registrar eventos

import StudentDashboardTopbar from ".";

// Simula las funciones de navegación
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
