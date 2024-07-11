import React from "react";
import { MemoryRouter } from "react-router-dom"; // Import only if you need routing context
import PatientCard from ".";

export default {
	title: "Components/PatientCard",
	component: PatientCard,
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	], // Use decorator if routing context is needed
};

// Template function to create a story with dynamic arguments
const Template = (args) => <PatientCard {...args} />;

// Default story
export const Default = Template.bind({});
Default.args = {
	patientInfo: {
		cui: 123456,
		names: "Jane",
		lastNames: "Doe",
		age: 30,
	},

	generalInfoPatientsResources: {
		read: () => [
			{
				id: "1",
				cui: 123456,
				names: "Jane",
				lastNames: "Doe",
				age: 30,
			},
		],
	},
	genViewPatientBtnClick: () => () => {},
};
