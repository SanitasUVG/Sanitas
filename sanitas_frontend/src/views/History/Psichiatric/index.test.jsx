import { render, screen, waitFor } from "@testing-library/react";
import { Suspense } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { PsichiatricHistory } from ".";
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

const mockGetPsichiatricHistory = vi.fn();
const mockUpdatePsichiatricHistory = vi.fn();
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

describe("PsichiatricHistory Component Tests", () => {
	test("initial render and data fetching", async () => {
		mockGetPsichiatricHistory.mockResolvedValue({
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
				<PsichiatricHistory
					getPsichiatricHistory={mockGetPsichiatricHistory}
					updatePsichiatricHistory={mockUpdatePsichiatricHistory}
					sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
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
