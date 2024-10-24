import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { describe, expect, test, vi } from "vitest";
import { StudentFamiliarHistory } from ".";
import { STUDENT_DASHBOARD_SIDEBAR_PROPS } from "src/router";

vi.mock("react-toastify", () => {
	return {
		toast: {
			error: vi.fn(),
			success: vi.fn(),
			info: vi.fn(),
		},
	};
});

const mockGetStudentFamilyHistoryWithData = async (_id) => ({
	result: {
		medicalHistory: {
			hypertension: { data: ["Padre"], version: 1 },
			diabetesMellitus: { data: ["Madre"], version: 1 },
			hypothyroidism: { data: [], version: 1 },
			asthma: { data: [], version: 1 },
			convulsions: { data: [], version: 1 },
			myocardialInfarction: { data: [], version: 1 },
			cancer: { data: [], version: 1 },
			cardiacDiseases: { data: [], version: 1 },
			renalDiseases: { data: [], version: 1 },
			others: { data: [], version: 1 },
		},
	},
});

const mockUpdateStudentFamilyHistory = vi.fn(() =>
	Promise.resolve({ success: true }),
);

const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("StudentFamiliarHistory Component Tests", () => {
	test("opens new form on button click", async () => {
		render(
			<Wrapper>
				<StudentFamiliarHistory
					getStudentFamilyHistory={mockGetStudentFamilyHistoryWithData}
					updateStudentFamilyHistory={mockUpdateStudentFamilyHistory}
					sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() => screen.getByText("Agregar antecedente familiar"));

		const addButton = screen.getByText("Agregar antecedente familiar");
		fireEvent.click(addButton);
		await waitFor(() => {
			expect(screen.getByText("Guardar")).toBeInTheDocument();
		});
	});

	test("displays empty state message when there is no data", async () => {
		const mockGetStudentFamilyHistoryEmpty = vi.fn(() =>
			Promise.resolve({
				result: {
					medicalHistory: {
						hypertension: { data: [], version: 1 },
						diabetesMellitus: { data: [], version: 1 },
						hypothyroidism: { data: [], version: 1 },
						asthma: { data: [], version: 1 },
						convulsions: { data: [], version: 1 },
						myocardialInfarction: { data: [], version: 1 },
						cancer: { data: [], version: 1 },
						cardiacDiseases: { data: [], version: 1 },
						renalDiseases: { data: [], version: 1 },
						others: { data: [], version: 1 },
					},
				},
			}),
		);

		render(
			<Wrapper>
				<StudentFamiliarHistory
					getStudentFamilyHistory={mockGetStudentFamilyHistoryEmpty}
					updateStudentFamilyHistory={mockUpdateStudentFamilyHistory}
					sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			screen.getByText(
				"¡Parece que no hay antecedentes familiares! Agrega uno en el botón de arriba.",
			),
		);
	});

	test("displays error message when there is an error fetching data", async () => {
		const mockGetStudentFamiliarHistoryError = vi.fn(() =>
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
				<StudentFamiliarHistory
					getStudentFamilyHistory={mockGetStudentFamiliarHistoryError}
					updateStudentFamilyHistory={mockUpdateStudentFamilyHistory}
					sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
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

	test("adds a new family history record", async () => {
		render(
			<Wrapper>
				<StudentFamiliarHistory
					getStudentFamilyHistory={mockGetStudentFamilyHistoryWithData}
					updateStudentFamilyHistory={mockUpdateStudentFamilyHistory}
					sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() => screen.getByText("Agregar antecedente familiar"));
		fireEvent.click(screen.getByText("Agregar antecedente familiar"));

		await waitFor(() => screen.getByText("Guardar"));

		fireEvent.change(
			screen.getByPlaceholderText(
				"Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)",
			),
			{
				target: { value: "Hermano" },
			},
		);

		fireEvent.click(screen.getByText("Guardar"));

		await waitFor(() =>
			expect(toast.success).toHaveBeenCalledWith(
				"Antecedente familiar guardado con éxito.",
			),
		);
	});
});
