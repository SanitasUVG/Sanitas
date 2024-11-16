import { MemoryRouter, Route, Routes } from "react-router-dom";
import { StudentAppointments } from ".";
import { createEmptyStore } from "src/store.mjs";
import { DEFAULT_DASHBOARD_SIDEBAR_PROPS } from "src/router";

export default {
	component: StudentAppointments,
	decorators: [
		(Story) => (
			<MemoryRouter initialEntries={["/student-appointments"]}>
				<Routes>
					<Route path="/student-appointments" element={<Story />} />
				</Routes>
			</MemoryRouter>
		),
	],
	title: "Views/Doctor/Appointments",
};

const dummyPatientId = 12345;

const mockGetAppointmentWithData = async (_id) => ({
	result: {
		consultations: [
			{
				patientConsultation: {
					data: {
						date: "2024-10-21T09:00:00Z",
						evaluator: "Dr. Who",
						reason: "Check-up anual",
						diagnosis: "Saludable",
						physicalExam: "Normal",
						temperature: "37.0",
						systolicPressure: "120",
						diastolicPressure: "80",
						oxygenSaturation: "98",
						respiratoryRate: "15",
						heartRate: "70",
						glucometry: "90",
						notes: "Continuar con dieta balanceada",
						medications: [
							{
								diagnosis: "Cough",
								medication: "Cough syrup",
								quantity: "1 bottle",
							},
						],
					},
				},
			},
		],
	},
});

const mockGetAppointmentEmpty = async (_id) => ({
	result: {
		consultations: [],
	},
});

const mockGetAppointmentError = async (_id) => ({
	error: {
		response: {
			status: 500,
			statusText: "Internal Server Error",
			data: "Server error occurred.",
		},
	},
});

const mockUpdateAppointment = async (_id, _details) => ({
	result: "Appointment updated successfully",
});

const store = createEmptyStore({
	selectedPatientId: dummyPatientId,
});

export const WithData = {
	args: {
		getAppointment: mockGetAppointmentWithData,
		updateAppointment: mockUpdateAppointment,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const EmptyData = {
	args: {
		getAppointment: mockGetAppointmentEmpty,
		updateAppointment: mockUpdateAppointment,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};

export const ErrorState = {
	args: {
		getAppointment: mockGetAppointmentError,
		updateAppointment: mockUpdateAppointment,
		sidebarConfig: DEFAULT_DASHBOARD_SIDEBAR_PROPS,
		useStore: () => ({ selectedPatientId: store.selectedPatientId }),
	},
};
