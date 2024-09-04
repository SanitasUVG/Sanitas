import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { describe, expect, test, vi } from "vitest";
import { StudentAllergicHistory } from "."; // Ajusta la ruta según sea necesario

vi.mock("react-toastify", () => {
	return {
		toast: {
			error: vi.fn(),
			success: vi.fn(),
			info: vi.fn(),
		},
	};
});

const mockGetStudentAllergicHistoryWithData = async (_id) => ({
	result: {
		medicalHistory: {
			medication: {
				data: [{ name: "Ibuprofen", severity: "Moderate" }],
				version: 1,
			},
			food: { data: [], version: 1 },
			dust: { data: [], version: 1 },
			pollen: { data: [], version: 1 },
			climateChange: { data: [], version: 1 },
			animals: { data: [], version: 1 },
			others: { data: [], version: 1 },
		},
	},
});

const mockUpdateStudentAllergicHistory = vi.fn(() =>
	Promise.resolve({ success: true }),
);
const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("StudentAllergicHistory Component Tests", () => {
	test("opens new form on button click", async () => {
		render(
			<Wrapper>
				<StudentAllergicHistory
					getStudentAllergicHistory={mockGetStudentAllergicHistoryWithData}
					updateStudentAllergicHistory={mockUpdateStudentAllergicHistory}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() => screen.getByText("Agregar antecedente alérgico"));

		const addButton = screen.getByText("Agregar antecedente alérgico");
		fireEvent.click(addButton);
		await waitFor(() => {
			expect(screen.getByText("Guardar")).toBeInTheDocument();
		});
	});

	test("displays empty state message when there is no data", async () => {
		const mockGetStudentAllergicHistoryEmpty = vi.fn(() =>
			Promise.resolve({
				result: {
					medicalHistory: {
						medication: { data: [], version: 1 },
						food: { data: [], version: 1 },
						dust: { data: [], version: 1 },
						pollen: { data: [], version: 1 },
						climateChange: { data: [], version: 1 },
						animals: { data: [], version: 1 },
						others: { data: [], version: 1 },
					},
				},
			}),
		);

		render(
			<Wrapper>
				<StudentAllergicHistory
					getStudentAllergicHistory={mockGetStudentAllergicHistoryEmpty}
					updateStudentAllergicHistory={mockUpdateStudentAllergicHistory}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			screen.getByText(
				"¡Parece que no hay antecedentes alérgicos! Agrega uno en el botón de arriba.",
			),
		);
	});

	test("displays error message when there is an error fetching data", async () => {
		const mockGetStudentAllergicHistoryError = vi.fn(() =>
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
				<StudentAllergicHistory
					getStudentAllergicHistory={mockGetStudentAllergicHistoryError}
					updateStudentAllergicHistory={mockUpdateStudentAllergicHistory}
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

	test("adds a new allergic history record", async () => {
		render(
			<Wrapper>
				<StudentAllergicHistory
					getStudentAllergicHistory={mockGetStudentAllergicHistoryWithData}
					updateStudentAllergicHistory={mockUpdateStudentAllergicHistory}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() => screen.getByText("Agregar antecedente alérgico"));
		fireEvent.click(screen.getByText("Agregar antecedente alérgico"));

		await waitFor(() => screen.getByText("Guardar"));

		// Completa todos los campos necesarios antes de guardar
		fireEvent.change(
			screen.getByPlaceholderText("Ingrese a cuál del tipo seleccionado"),
			{
				target: { value: "Penicillin" },
			},
		);
		fireEvent.click(screen.getByText("Cutánea"));

		// Guarda el nuevo registro de alergia
		fireEvent.click(screen.getByText("Guardar"));

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				"Antecedente alérgico guardado con éxito.",
			),
		);
	});
});
