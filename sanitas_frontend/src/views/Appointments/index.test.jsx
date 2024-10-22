import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { describe, expect, test, vi } from "vitest";
import { StudentAppointments } from ".";
import { DEFAULT_DASHBOARD_SIDEBAR_PROPS } from "src/router";

vi.mock("react-toastify", () => {
	return {
		toast: {
			error: vi.fn(),
			success: vi.fn(),
			info: vi.fn(),
		},
	};
});

const mockGetAppointmentWithData = async (_id) => ({
	result: {
		consultations: [
			{
				patientConsultation: {
					version: 1,
					data: {
						date: "2024-10-11T14:30:00Z",
						evaluator: "doctor1@example.com",
						reason: "Annual Health Check-Up",
						diagnosis: "Good overall health",
						physicalExam: "All clear",
						temperature: 98.6,
						systolicPressure: 120,
						diastolicPressure: 80,
						oxygenSaturation: 98,
						respiratoryRate: 15,
						heartRate: 70,
						glucometry: 90,
						medications: [],
						notes: "Continue healthy lifestyle.",
					},
				},
			},
		],
	},
});

const mockUpdateAppointment = vi.fn(() => Promise.resolve({ success: true }));

const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("StudentAppointments Component Tests", () => {
	test("opens new form on button click", async () => {
		render(
			<Wrapper>
				<StudentAppointments
					getAppointment={mockGetAppointmentWithData}
					updateAppointment={mockUpdateAppointment}
					sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() => screen.getByText("Agregar cita"));

		const addButton = screen.getByText("Agregar cita");
		fireEvent.click(addButton);

		await waitFor(() => {
			expect(screen.getByText("Guardar")).toBeInTheDocument();
		});
	});

	test("displays error message when there is an error fetching data", async () => {
		const mockGetAppointmentError = vi.fn(() =>
			Promise.resolve({
				error: {
					response: {
						status: 400,
						statusText: "Bad Request",
						data: "Invalid request parameters.",
					},
				},
			}),
		);

		render(
			<Wrapper>
				<StudentAppointments
					getAppointment={mockGetAppointmentError}
					updateAppointment={mockUpdateAppointment}
					sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			screen.getByText(
				"Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!",
			),
		);
	});

	test("adds a new appointment and displays success message", async () => {
		render(
			<Wrapper>
				<StudentAppointments
					getAppointment={mockGetAppointmentWithData}
					updateAppointment={mockUpdateAppointment}
					sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		// Asegúrate de que todos los cambios de estado se han completado
		await waitFor(() =>
			expect(screen.getByText("Agregar cita")).toBeInTheDocument(),
		);

		// Guarda la cita
		fireEvent.click(screen.getByText("Agregar cita"));

		// Completa los campos obligatorios
		fireEvent.change(
			screen.getByPlaceholderText(
				"Escribe aquí el motivo de consulta del paciente...",
			),
			{
				target: { value: "Consulta de seguimiento" },
			},
		);
		fireEvent.change(
			screen.getByPlaceholderText(
				"Escribe aquí el diagnósitco del paciente...",
			),
			{
				target: { value: "Diagnóstico preliminar" },
			},
		);
		fireEvent.change(
			screen.getByPlaceholderText("Escribe aquí el examen físico realizado..."),
			{
				target: { value: "Examen físico completo" },
			},
		);

		// Guarda la cita
		fireEvent.click(screen.getByText("Guardar"));

		// Espera a que se muestre primero el mensaje informativo
		await waitFor(() =>
			expect(toast.info).toHaveBeenCalledWith(
				"Guardando información de la cita...",
			),
		);

		// Espera a que se muestre el mensaje de éxito
		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith("¡Cita guardada con éxito!"),
		);
	});
});
