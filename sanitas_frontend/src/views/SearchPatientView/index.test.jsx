import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as cognitoModule from "src/cognito.mjs";
import { createEmptyStore } from "src/store.mjs";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";
import SearchPatientView from ".";

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

	test("Can't search if query is empty", () => {
		const apiCall = vi.fn();
		const useStore = createEmptyStore();

		const dom = render(
			<MemoryRouter>
				<SearchPatientView
					searchPatientsApiCall={apiCall}
					useStore={useStore}
				/>
			</MemoryRouter>,
		);
		const searchBtn = dom.getByText("Buscar Paciente");

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
				/>
			</MemoryRouter>,
		);

		const searchElem = dom.getByPlaceholderText("Ingrese su búsqueda...");
		const searchBtn = dom.getByText("Buscar Paciente");

		fireEvent.change(searchElem, { target: { value: "3284834428" } });
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
				/>
			</MemoryRouter>,
		);
		const searchElem = dom.getByPlaceholderText("Ingrese su búsqueda...");
		const searchBtn = dom.getByText("Buscar Paciente");

		fireEvent.change(searchElem, { target: { value: "2348234890" } });
		fireEvent.click(searchBtn);

		await waitFor(() => {
			expect(apiCall).toHaveBeenCalledOnce();
		});

		await waitFor(
			() => {
				expect(dom.getByText("Ver")).toBeVisible();
			},
			{
				timeout: 500,
			},
		);
	});
});
