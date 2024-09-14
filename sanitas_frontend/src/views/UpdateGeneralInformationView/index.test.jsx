import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { describe, expect, test, vi } from "vitest";
import UpdateInfoView from "./index";
import { DEFAULT_DASHBOARD_SIDEBAR_PROPS } from "src/router";

const examplePatientData = {
	id: 6969,
	names: "John",
	lastNames: "Doe",
	isWoman: false,
	email: "john.doe@example.com",
	contactName1: "Jane Doe",
	contactKinship1: "Sister",
	contactPhone1: "123456789",
	contactName2: "Mike Doe",
	contactKinship2: "Brother",
	contactPhone2: "987654321",
	bloodType: "O+",
	address: "123 Main St",
	insurance: "El Roble",
	birthdate: "1980-01-02",
	phone: "555-1234",
};

const exampleStudentData = {
	carnet: "22386",
	career: "Lic. Computación",
};

const exampleCollaboratorData = {
	code: "C001",
	area: "Admin",
};

/** @type {import("src/components/DashboardSidebar").UserInformation} */
const exampleUserInformation = {
	displayName: "Jennifer Bustamante",
	title: "Doctora UVG",
};

describe("UpdateInfoView tests", () => {
	test("Displays patient information correctly", async () => {
		const getGeneralPatientInformation = vi
			.fn()
			.mockResolvedValue({ result: examplePatientData });
		const getStudentPatientInformation = vi
			.fn()
			.mockResolvedValue({ result: exampleStudentData });
		const getCollaboratorInformation = vi
			.fn()
			.mockResolvedValue({ result: exampleCollaboratorData });
		const useStore = createEmptyStore();

		render(
			<MemoryRouter>
				<Routes>
					<Route
						path="/"
						element={
							<UpdateInfoView
								getGeneralPatientInformation={getGeneralPatientInformation}
								getStudentPatientInformation={getStudentPatientInformation}
								getCollaboratorInformation={getCollaboratorInformation}
								updateGeneralPatientInformation={() => { }}
								useStore={useStore}
								sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
							/>
						}
					/>
				</Routes>
			</MemoryRouter>,
		);

		await waitFor(
			() => {
				expect(screen.getByDisplayValue("John")).toBeVisible();
				expect(screen.getByDisplayValue("Doe")).toBeVisible();
				expect(screen.getByDisplayValue("john.doe@example.com")).toBeVisible();
				expect(screen.getByDisplayValue("Jane Doe")).toBeVisible();
				expect(screen.getByDisplayValue("123456789")).toBeVisible();
				expect(screen.getByDisplayValue("Mike Doe")).toBeVisible();
				expect(screen.getByDisplayValue("987654321")).toBeVisible();
				expect(screen.getByDisplayValue("O+")).toBeVisible();
				expect(screen.getByDisplayValue("123 Main St")).toBeVisible();
				expect(screen.getByDisplayValue("El Roble")).toBeVisible();
				expect(screen.getByDisplayValue("1980-01-02")).toBeVisible();
				expect(screen.getByDisplayValue("555-1234")).toBeVisible();
			},
			{ timeout: 500 },
		);
	});

	test("Shows error message when patient information cannot be fetched", async () => {
		const errorMessage =
			"Error al buscar el paciente. Asegúrese de que el ID es correcto.";
		const getGeneralPatientInformation = vi
			.fn()
			.mockResolvedValue({ error: new Error("error") });
		const getStudentPatientInformation = vi
			.fn()
			.mockResolvedValue({ error: new Error("error") });
		const getCollaboratorInformation = vi
			.fn()
			.mockResolvedValue({ error: new Error("error") });
		const useStore = createEmptyStore();

		render(
			<MemoryRouter>
				<Routes>
					<Route
						path="/"
						element={
							<UpdateInfoView
								getGeneralPatientInformation={getGeneralPatientInformation}
								getStudentPatientInformation={getStudentPatientInformation}
								getCollaboratorInformation={getCollaboratorInformation}
								updateGeneralPatientInformation={() => { }}
								useStore={useStore}
								sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
							/>
						}
					/>
				</Routes>
			</MemoryRouter>,
		);

		await waitFor(
			() => {
				expect(
					screen.getByText((content, _element) =>
						content.includes(errorMessage),
					),
				).toBeVisible();
			},
			{ timeout: 500 },
		);
	});

	test("Shows loading message when fetching patient information", () => {
		const getGeneralPatientInformation = vi
			.fn()
			.mockResolvedValue(new Promise(() => { }));
		const getStudentPatientInformation = vi
			.fn()
			.mockResolvedValue(new Promise(() => { }));
		const getCollaboratorInformation = vi
			.fn()
			.mockResolvedValue(new Promise(() => { }));
		const useStore = createEmptyStore();

		render(
			<MemoryRouter>
				<Routes>
					<Route
						path="/"
						element={
							<UpdateInfoView
								getGeneralPatientInformation={getGeneralPatientInformation}
								getStudentPatientInformation={getStudentPatientInformation}
								getCollaboratorInformation={getCollaboratorInformation}
								updateGeneralPatientInformation={() => { }}
								useStore={useStore}
								sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
							/>
						}
					/>
				</Routes>
			</MemoryRouter>,
		);

		expect(screen.getAllByText("Cargando datos de paciente..."));
	});
});
