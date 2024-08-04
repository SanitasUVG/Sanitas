
import InformationCard from ".";

export default {
	title: "Components/InformationCard",
	component: InformationCard,
	argTypes: {
		type: { control: "select", options: ["surgical", "appointment"] },
		year: { control: "text" },
		surgeryType: { control: "text" },
		date: { control: "text" },
		reason: { control: "text" },
	},
};

const Template = (args) => <InformationCard {...args} />;

export const Surgical = Template.bind({});
Surgical.args = {
	type: "surgical",
	year: "2022",
	surgeryType: "Cirugía de rodilla",
};

export const Appointment = Template.bind({});
Appointment.args = {
	type: "appointment",
	date: "10/06/2024",
	reason: "Consulta de seguimiento",
};

export const LongSurgical = Template.bind({});
LongSurgical.args = {
	type: "surgical",
	year: "2021",
	surgeryType:
		"Cirugía reconstructiva de ligamentos cruzados anteriores con técnica de doble banda",
};

export const LongAppointment = Template.bind({});
LongAppointment.args = {
	type: "appointment",
	date: "15/07/2024",
	reason:
		"Consulta de evaluación y seguimiento para tratamiento de rehabilitación extensa post-operatorio",
};
