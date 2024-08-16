import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { describe, expect, test, vi } from "vitest";
import { PsichiatricHistory } from "."; // Ajusta la ruta según sea necesario

vi.mock("react-toastify", () => {
	return {
		toast: {
			error: vi.fn(),
			success: vi.fn(),
			info: vi.fn(),
		},
	};
});

const mockGetPsichiatricHistoryWithData = async (_id) => ({
	result: {
		medicalHistory: {
			depression: {
				data: {
					medication: "Antidepressants",
					dose: "20mg",
					frequency: "Daily",
					ube: true,
				},
				version: 1,
			},
			anxiety: {
				data: {
					medication: "Anxiolytics",
					dose: "10mg",
					frequency: "As needed",
					ube: false,
				},
				version: 1,
			},
			ocd: {
				data: {
					medication: "SSRIs",
					dose: "50mg",
					frequency: "Daily",
					ube: false,
				},
				version: 1,
			},
			adhd: {
				data: {
					medication: "Stimulants",
					dose: "30mg",
					frequency: "Morning",
					ube: true,
				},
				version: 1,
			},
			bipolar: {
				data: {
					medication: "Mood Stabilizers",
					dose: "150mg",
					frequency: "Twice daily",
					ube: false,
				},
				version: 1,
			},
			other: {
				data: {
					ill: "Schizophrenia",
					medication: "Antipsychotics",
					dose: "200mg",
					frequency: "Night",
					ube: true,
				},
				version: 1,
			},
		},
	},
});

const mockUpdatePsichiatricHistory = vi.fn(() =>
	Promise.resolve({ success: true }),
);
const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

const sidebarConfig = {
	userInformation: { displayName: "User Testing" },
};

const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("PsichiatricHistory Component Tests", () => {
	test("opens new form on button click", async () => {
		render(
			<Wrapper>
				<PsichiatricHistory
					getPsichiatricHistory={mockGetPsichiatricHistoryWithData}
					updatePsichiatricHistory={mockUpdatePsichiatricHistory}
					sidebarConfig={sidebarConfig}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() => screen.getByText("Agregar antecedente psiquiátrico"));

		const addButton = screen.getByText("Agregar antecedente psiquiátrico");
		fireEvent.click(addButton);
		await waitFor(() => {
			expect(screen.getByText("Guardar")).toBeInTheDocument();
		});
	});

	test("displays empty state message when there is no data", async () => {
		const mockGetPsichiatricHistoryEmpty = vi.fn(() =>
			Promise.resolve({
				result: {
					medicalHistory: {
						depression: { data: {}, version: 1 },
						anxiety: { data: {}, version: 1 },
						ocd: { data: {}, version: 1 },
						adhd: { data: {}, version: 1 },
						bipolar: { data: {}, version: 1 },
						other: { data: {}, version: 1 },
					},
				},
			}),
		);

		render(
			<Wrapper>
				<PsichiatricHistory
					getPsichiatricHistory={mockGetPsichiatricHistoryEmpty}
					updatePsichiatricHistory={mockUpdatePsichiatricHistory}
					sidebarConfig={sidebarConfig}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			screen.getByText(
				"¡Parece que no hay antecedentes psiquiátricos! Agrega uno en el botón de arriba.",
			),
		);
	});

	test("displays error message when there is an error fetching data", async () => {
		const mockGetPsichiatricHistoryError = vi.fn(() =>
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
				<PsichiatricHistory
					getPsichiatricHistory={mockGetPsichiatricHistoryError}
					updatePsichiatricHistory={mockUpdatePsichiatricHistory}
					sidebarConfig={sidebarConfig}
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

	test("adds a new psichiatric history record", async () => {
		render(
			<Wrapper>
				<PsichiatricHistory
					getPsichiatricHistory={mockGetPsichiatricHistoryWithData}
					updatePsichiatricHistory={mockUpdatePsichiatricHistory}
					sidebarConfig={sidebarConfig}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() => screen.getByText("Agregar antecedente psiquiátrico"));
		fireEvent.click(screen.getByText("Agregar antecedente psiquiátrico"));

		await waitFor(() => screen.getByText("Guardar"));

		// Completa todos los campos necesarios antes de guardar
		fireEvent.change(
			screen.getByPlaceholderText(
				"Ingrese el medicamento administrado (terapia entra en la categoría)",
			),
			{
				target: { value: "New Medication" },
			},
		);
		fireEvent.change(screen.getByPlaceholderText("Ingrese cuánto (opcional)"), {
			target: { value: "50mg" },
		});
		fireEvent.change(
			screen.getByPlaceholderText(
				"Ingrese cada cuánto administra el medicamento",
			),
			{
				target: { value: "Twice daily" },
			},
		);
		fireEvent.click(screen.getByText("Si"));

		// Guarda el nuevo registro de antecedentes psiquiátricos
		fireEvent.click(screen.getByText("Guardar"));

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				"Antecedente psiquiátrico guardado con éxito.",
			),
		);
	});
});
