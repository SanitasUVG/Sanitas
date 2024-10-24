import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as cognitoModule from "src/cognito.mjs";
import { createEmptyStore } from "src/store.mjs";
import SearchPatientView from ".";

const mockLogoutUser = vi.fn();
const mockGetRole = vi.fn(() => Promise.resolve("DOCTOR"));
const mockGetLinkedPatient = vi.fn(() => Promise.resolve(null));

describe("Search Patient view UI tests", () => {
	beforeAll(() => {
		vi.spyOn(cognitoModule, "getSession").mockImplementation(() => {
			return Promise.resolve({
				isValid: () => true,
			});
		});
	});

	afterAll(() => {
		vi.restoreAllMocks();
	});

	test("Can't search if query is empty", async () => {
		const apiCall = vi.fn();
		const useStore = createEmptyStore();

		const dom = render(
			<MemoryRouter>
				<SearchPatientView
					searchPatientsApiCall={apiCall}
					useStore={useStore}
					logoutUser={mockLogoutUser}
					getRole={mockGetRole}
					getLinkedPatient={mockGetLinkedPatient}
				/>
			</MemoryRouter>,
		);

		// Await to ensure button is rendered before interaction
		const searchBtn = await waitFor(() => dom.getByText("Buscar Paciente"));

		fireEvent.click(searchBtn);

		expect(apiCall).toHaveBeenCalledTimes(0);
	});

	test("On search calls function", async () => {
		const apiCall = vi.fn(() =>
			Promise.resolve({
				result: [],
			}),
		);
		const useStore = createEmptyStore();

		const dom = render(
			<MemoryRouter>
				<SearchPatientView
					searchPatientsApiCall={apiCall}
					useStore={useStore}
					logoutUser={mockLogoutUser}
					getRole={mockGetRole}
					getLinkedPatient={mockGetLinkedPatient}
				/>
			</MemoryRouter>,
		);

		// Await to ensure the search input and button are rendered before interaction
		const searchElem = await waitFor(() =>
			dom.getByPlaceholderText("Ingrese su búsqueda..."),
		);
		const searchBtn = await waitFor(() => dom.getByText("Buscar Paciente"));

		fireEvent.change(searchElem, { target: { value: "Flavio" } });
		fireEvent.click(searchBtn);

		await waitFor(() => {
			expect(apiCall).toHaveBeenCalledOnce();
		});
	});

	test("Display a button to see patient", async () => {
		const apiCall = vi.fn(() =>
			Promise.resolve({
				result: [
					{
						id: 1234,
						cui: "1234567890123",
						names: "Flavio",
						lastNames: "Martinez",
						age: 34,
					},
				],
			}),
		);
		const useStore = createEmptyStore();

		const dom = render(
			<MemoryRouter>
				<SearchPatientView
					searchPatientsApiCall={apiCall}
					useStore={useStore}
					logoutUser={mockLogoutUser}
					getRole={mockGetRole}
					getLinkedPatient={mockGetLinkedPatient}
				/>
			</MemoryRouter>,
		);

		// Await to ensure the search input and button are rendered before interaction
		const searchElem = await waitFor(() =>
			dom.getByPlaceholderText("Ingrese su búsqueda..."),
		);
		const searchBtn = await waitFor(() => dom.getByText("Buscar Paciente"));

		fireEvent.change(searchElem, { target: { value: "Flavio" } });
		fireEvent.click(searchBtn);

		await waitFor(() => {
			expect(apiCall).toHaveBeenCalledOnce();
		});

		await waitFor(() => {
			expect(dom.getByText("Ver")).toBeVisible();
		});
	});
});
