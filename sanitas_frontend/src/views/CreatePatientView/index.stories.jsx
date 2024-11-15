import { action } from "@storybook/addon-actions";
import { MemoryRouter } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { CreatePatientView } from ".";

export default {
	title: "Views/Doctor/CreatePatientView",
	component: CreatePatientView,
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
};

const defaultUseStore = createEmptyStore();

export const Default = {
	args: {
		submitPatientData: async (patientData) => {
			action("Submitting patient data")(patientData);
			return Promise.resolve({
				message: "Patient data submitted successfully",
				patientId: "new_patient_id_123",
			});
		},
		useStore: defaultUseStore,
	},
};
