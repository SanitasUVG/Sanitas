import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { StudentNonPathologicalHistory } from ".";

vi.mock("react-toastify", () => {
	return {
		toast: {
			error: vi.fn(),
			success: vi.fn(),
			info: vi.fn(),
		},
	};
});

const mockGetStudentNonPathologicalHistory = vi.fn();
const mockGetBloodTypePatientInfo = vi.fn();
const mockUpdateStudentNonPathologicalHistory = vi.fn();
const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

mockGetBloodTypePatientInfo.mockResolvedValue({ bloodType: "AB+" });
mockUpdateStudentNonPathologicalHistory.mockResolvedValue({});

const sidebarConfig = {
	userInformation: { displayName: "User Testing" },
};

const LoadingComponent = () => <div>Loading...</div>;

const Wrapper = ({ children }) => (
	<MemoryRouter>
		<Suspense fallback={<LoadingComponent />}>
			<Routes>
				<Route path="/" element={children} />
			</Routes>
		</Suspense>
	</MemoryRouter>
);

describe("NonPathologicalHistory Component Tests", () => {
	test("initial render and data fetching", async () => {
		mockGetStudentNonPathologicalHistory.mockResolvedValue({
			result: {
				medicalHistory: {
					smoker: {
						data: [{ smokes: false, cigarettesPerDay: "0", years: "0" }],
						version: 1,
					},
					drink: { data: [{ drinks: false, drinksPerMonth: "0" }], version: 1 },
					drugs: {
						data: [{ usesDrugs: false, drugType: "", frequency: "" }],
						version: 1,
					},
				},
			},
		});

		mockGetBloodTypePatientInfo.mockImplementation(() =>
			Promise.resolve({ bloodType: "O+" }),
		);

		render(
			<Wrapper>
				<StudentNonPathologicalHistory
					getNonPathologicalHistory={mockGetStudentNonPathologicalHistory}
					getBloodTypePatientInfo={mockGetBloodTypePatientInfo}
					updateNonPathologicalHistory={mockUpdateStudentNonPathologicalHistory}
					sidebarConfig={sidebarConfig}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			expect(
				screen.getByText("Antecedentes No Patológicos"),
			).toBeInTheDocument(),
		);
	});

	test("displays error message when there is an error fetching data", async () => {
		const mockGetStudentNonPathologicalHistoryError = vi.fn(() =>
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
				<StudentNonPathologicalHistory
					getNonPathologicalHistory={mockGetStudentNonPathologicalHistoryError}
					getBloodTypePatientInfo={mockGetBloodTypePatientInfo}
					updateNonPathologicalHistory={mockUpdateStudentNonPathologicalHistory}
					sidebarConfig={sidebarConfig}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			expect(
				screen.getByText(
					"Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!",
				),
			).toBeInTheDocument(),
		);
	});
});
