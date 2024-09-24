import {
	render,
	screen,
	fireEvent,
	waitForElementToBeRemoved,
	waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { toast } from "react-toastify";
import { StudentObGynHistory } from ".";

vi.mock("react-toastify", () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
		info: vi.fn(),
	},
}));

const mockGetBirthdayPatientInfo = async () => ({
	result: {
		birthdate: "1980-01-01",
	},
});

const mockGetObGynHistoryWithData = async () => ({
	result: {
		medicalHistory: {
			firstMenstrualPeriod: { data: { age: 15 } },
			regularCycles: { data: { isRegular: true } },
			painfulMenstruation: { data: { isPainful: false, medication: "" } },
			pregnancies: {
				data: {
					totalPregnancies: 2,
					abortions: 0,
					cesareanSections: 1,
					vaginalDeliveries: 1,
				},
			},
			diagnosedIllnesses: {
				data: {
					ovarianCysts: {
						medication: {
							dosage: "100mg",
							frequency: "Daily",
							medication: "Ibuprofen",
						},
					},
					uterineMyomatosis: {
						medication: {
							dosage: "50mg",
							frequency: "Twice a day",
							medication: "Paracetamol",
						},
					},
					endometriosis: {
						medication: { dosage: "", frequency: "", medication: "" },
					},
					otherCondition: [
						{
							medication: {
								illness: "illness A",
								medication: "Med D",
								dosage: "500mg",
								frequency: "Once a day",
							},
						},
					],
				},
			},
			hasSurgeries: {
				data: {
					ovarianCystsSurgery: [{ year: 2005, complications: false }],
					hysterectomy: { year: 2010, complications: true },
					sterilizationSurgery: { year: 2015, complications: false },
					breastMassResection: [{ year: 2015, complications: false }],
				},
			},
		},
	},
});

const mockGetObGynHistoryError = async () => ({
	result: {
		medicalHistory: {
			firstMenstrualPeriod: { data: { age: 15 } },
			regularCycles: { data: { isRegular: true } },
			painfulMenstruation: { data: { isPainful: false, medication: "" } },
			pregnancies: {
				data: {
					totalPregnancies: 2,
					abortions: 0,
					cesareanSections: 1,
					vaginalDeliveries: 1,
				},
			},
			diagnosedIllnesses: {
				data: {
					ovarianCysts: {
						medication: {
							dosage: "100mg",
							frequency: "Daily",
							medication: "Ibuprofen",
						},
					},
					uterineMyomatosis: {
						medication: {
							dosage: "50mg",
							frequency: "Twice a day",
							medication: "Paracetamol",
						},
					},
					endometriosis: {
						medication: { dosage: "", frequency: "", medication: "" },
					},
					otherCondition: [
						{
							medication: {
								illness: "illness A",
								medication: "Med D",
								dosage: "500mg",
								frequency: "Once a day",
							},
						},
					],
				},
			},
			hasSurgeries: {
				data: {
					ovarianCystsSurgery: [{ year: 2005, complications: false }],
					hysterectomy: { year: 2010, complications: true },
					sterilizationSurgery: { year: 2015, complications: false },
					breastMassResection: [{ year: 2015, complications: false }],
				},
			},
		},
	},
	error: {
		response: {
			status: 400,
			statusText: "Bad Request",
			data: "Invalid request parameters.",
		},
	},
});

const mockUpdateObGynHistory = vi.fn(() => Promise.resolve({ success: true }));
const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "12345" });

const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("ObGynHistory Component Tests", () => {
	test("renders and displays general information", async () => {
		render(
			<Wrapper>
				<StudentObGynHistory
					getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
					getObGynHistory={mockGetObGynHistoryWithData}
					updateObGynHistory={mockUpdateObGynHistory}
					sidebarConfig={{
						userInformation: { displayName: "User Testing" },
					}}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			expect(
				screen.queryByText(
					"Cargando información de los antecedentes ginecoobstétricos...",
				),
			).not.toBeInTheDocument(),
		);

		expect(
			screen.getByText("Antecedentes Ginecoobstétricos"),
		).toBeInTheDocument();
		expect(
			screen.getByText("Registro de antecedentes ginecoobstétricos"),
		).toBeInTheDocument();

		const diagnosisText = document
			.querySelector("div")
			.textContent.includes("Diagnóstico por Quistes Ováricos:");
		expect(diagnosisText).toBe(true);
	});

	test("displays error message when there is an error fetching data", async () => {
		render(
			<Wrapper>
				<StudentObGynHistory
					getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
					getObGynHistory={mockGetObGynHistoryError}
					updateObGynHistory={mockUpdateObGynHistory}
					sidebarConfig={{ userInformation: { displayName: "User Testing" } }}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitForElementToBeRemoved(() =>
			screen.queryByText(
				"Cargando información de los antecedentes ginecoobstétricos...",
			),
		);

		await waitFor(() => {
			const errorMessage = screen.getByText(
				/Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!/i,
			);
			expect(errorMessage).toBeInTheDocument();
		});
	});
});
