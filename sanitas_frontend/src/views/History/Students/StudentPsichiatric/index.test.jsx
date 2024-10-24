import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { StudentPsichiatricHistory } from ".";
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

const mockGetStudentPsichiatricHistory = vi.fn();
const mockUpdateStudentPsichiatricHistory = vi.fn();
const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

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

describe("StudentPsichiatricHistory Component Tests", () => {
	test("initial render and data fetching", async () => {
		mockGetStudentPsichiatricHistory.mockResolvedValue({
			result: {
				medicalHistory: {
					depression: {
						data: [
							{
								medication: "Antidepressants",
								dose: "20mg",
								frequency: "Daily",
								ube: true,
							},
						],
						version: 1,
					},
					anxiety: {
						data: [
							{
								medication: "Anxiolytics",
								dose: "10mg",
								frequency: "As needed",
								ube: false,
							},
						],
						version: 1,
					},
				},
			},
		});

		render(
			<Wrapper>
				<StudentPsichiatricHistory
					getPsichiatricHistory={mockGetStudentPsichiatricHistory}
					updatePsichiatricHistory={mockUpdateStudentPsichiatricHistory}
					sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
					useStore={mockUseStore}
				/>
			</Wrapper>,
		);

		await waitFor(() =>
			expect(
				screen.getByText("Antecedentes Psiquiátricos"),
			).toBeInTheDocument(),
		);
	});
});
