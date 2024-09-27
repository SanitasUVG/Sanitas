import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { describe, expect, test, vi } from "vitest";
import { StudentPersonalHistory } from ".";

vi.mock("react-toastify", () => {
	return {
		toast: {
			error: vi.fn(),
			success: vi.fn(),
			info: vi.fn(),
		},
	};
});

const mockGetStudentPersonalHistoryWithData = async (_id) => ({
	result: {
		medicalHistory: {
			hypertension: {
				data: [
					{
						typeOfDisease: "hiper",
						medicine: "ibuprofeno",
						dose: "10",
						frequency: "21",
					},
				],
				version: 1,
			},
			diabetesMellitus: {
				data: [
					{
						typeOfDisease: "dia",
						medicine: "azucar",
						dose: "12",
						frequency: "23",
					},
				],
				version: 1,
			},
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

const simulateNavigation = (path) => () =>
	console.log(`Mock navigate to ${path}`);

const sidebarConfigMock = {
	navigateToGeneralStudent: simulateNavigation("/student-general"),
	navigateToSurgicalStudent: simulateNavigation("/student-surgical"),
	navigateToTraumatologicalStudent: simulateNavigation(
		"/student-traumatological",
	),
	navigateToFamiliarStudent: simulateNavigation("/student-familiar"),
	navigateToPersonalStudent: simulateNavigation("/student-personal"),
	navigateToNonPathologicalStudent: simulateNavigation(
		"/student-non-pathological",
	),
	navigateToAllergiesStudent: simulateNavigation("/student-allergies"),
	navigateToPsiquiatricStudent: simulateNavigation("/student-psychiatric"),
	navigateToObstetricsStudent: simulateNavigation("/student-obstetrics"),
};

const mockGetBirthdayPatientInfo = vi.fn(() =>
	Promise.resolve({ result: { birthdate: "1990-01-01" } }),
);

const mockUpdateStudentPersonalHistory = vi.fn(() =>
	Promise.resolve({ success: true }),
);
const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("StudentPersonalHistory Component Tests", () => {
	test("opens new form on button click", async () => {
		render(
			<Wrapper>
				<StudentPersonalHistory
					getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
					getStudentPersonalHistory={mockGetStudentPersonalHistoryWithData}
					updateStudentPersonalHistory={mockUpdateStudentPersonalHistory}
					sidebarConfig={sidebarConfigMock}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() => screen.getByText("Agregar antecedente personal"));

		const addButton = screen.getByText("Agregar antecedente personal");
		fireEvent.click(addButton);
		await waitFor(() => {
			expect(screen.getByText("Guardar")).toBeInTheDocument();
		});
	});

	test("displays empty state message when there is no data", async () => {
		const mockGetStudentPersonalHistoryEmpty = vi.fn(() =>
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
				<StudentPersonalHistory
					getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
					getStudentPersonalHistory={mockGetStudentPersonalHistoryEmpty}
					updateStudentPersonalHistory={mockUpdateStudentPersonalHistory}
					sidebarConfig={sidebarConfigMock}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			screen.getByText(
				"¡Parece que no hay antecedentes personales! Agrega uno en el botón de arriba.",
			),
		);
	});

	test("displays error message when there is an error fetching data", async () => {
		const mockGetStudentPersonalHistoryError = vi.fn(() =>
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
				<StudentPersonalHistory
					getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
					getStudentPersonalHistory={mockGetStudentPersonalHistoryError}
					updateStudentPersonalHistory={mockUpdateStudentPersonalHistory}
					sidebarConfig={sidebarConfigMock}
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

	test("adds a new personal history record", async () => {
		render(
			<Wrapper>
				<StudentPersonalHistory
					getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
					getStudentPersonalHistory={mockGetStudentPersonalHistoryWithData}
					updateStudentPersonalHistory={mockUpdateStudentPersonalHistory}
					sidebarConfig={sidebarConfigMock}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		// Espera que aparezca el botón para agregar antecedentes personales
		await waitFor(() => screen.getByText("Agregar antecedente personal"));

		// Inicia el proceso de agregar un nuevo antecedente personal
		const addButton = screen.getByText("Agregar antecedente personal");
		fireEvent.click(addButton);

		// Llenar el formulario con datos
		const inputs = screen.getAllByPlaceholderText(
			/Ingrese el tratamiento administrado/i,
		);
		fireEvent.change(inputs[0], { target: { value: "Aspirina" } });
		fireEvent.change(inputs[1], { target: { value: "10mg" } });
		fireEvent.change(
			screen.getByPlaceholderText(
				/Ingrese la frecuencia con la que toma el medicamento/i,
			),
			{ target: { value: "Diaria" } },
		);

		// Simula el clic en guardar
		const saveButton = screen.getByText("Guardar");
		fireEvent.click(saveButton);

		// Verifica que el mensaje de éxito fue mostrado
		await waitFor(() => {
			expect(toast.success).toHaveBeenCalledWith(
				"Antecedente personal guardado con éxito.",
			);
		});

		// Verifica que la función updatePersonalHistory fue llamada
		expect(mockUpdateStudentPersonalHistory).toHaveBeenCalled();
	});
});
