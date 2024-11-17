import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { describe, expect, test, vi } from "vitest";
import { AddPatientView } from "../AddPatientView";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({
	toast: {
		error: vi.fn(),
	},
}));

describe("AddPatientView tests", () => {
	test("Check CUI with invalid length shows alert", () => {
		window.alert = vi.fn();
		const submitPatientData = vi.fn();
		const useStore = createEmptyStore();
		render(
			<MemoryRouter>
				<AddPatientView
					submitPatientData={submitPatientData}
					useStore={useStore}
				/>
			</MemoryRouter>,
		);

		const input = screen.getByPlaceholderText("CUI");
		fireEvent.change(input, { target: { value: "123" } });
		const button = screen.getByText("Registrar información");
		fireEvent.click(button);

		expect(toast.error).toHaveBeenCalledWith(
			"Por favor ingresar un CUI válido...",
		);
		expect(submitPatientData).not.toHaveBeenCalled();
	});

	test("Displays error message when submitPatientData fails", async () => {
		const errorMessage = "Error conexion";
		const useStore = createEmptyStore();

		const submitPatientData = vi
			.fn()
			.mockResolvedValue({ error: errorMessage });
		window.alert = vi.fn();
		render(
			<MemoryRouter>
				<AddPatientView
					submitPatientData={submitPatientData}
					useStore={useStore}
				/>
			</MemoryRouter>,
		);

		const input = screen.getByPlaceholderText("CUI");
		fireEvent.change(input, { target: { value: "2987944380208" } });
		const namesInput = screen.getByPlaceholderText("Nombres");
		fireEvent.change(namesInput, { target: { value: "Test" } });
		const surnamesInput = screen.getByPlaceholderText("Apellidos");
		fireEvent.change(surnamesInput, { target: { value: "User" } });
		const genderInput = screen.getByLabelText("Femenino");
		fireEvent.click(genderInput);
		const birthDateInput = screen.getByPlaceholderText("Fecha de nacimiento");
		fireEvent.change(birthDateInput, { target: { value: "2000-01-01" } });
		const button = screen.getByText("Registrar información");
		fireEvent.click(button);

		await waitFor(() => {
			expect(toast.error).toHaveBeenCalledWith(
				"Lo sentimos! Ha ocurrido un error al enviar los datos!",
			);
		});
	});

	test("Valid CUI triggers submitPatientData function", async () => {
		const submitPatientData = vi.fn().mockResolvedValue({ id: "test-id" });
		const useStore = createEmptyStore();

		render(
			<MemoryRouter>
				<AddPatientView
					submitPatientData={submitPatientData}
					useStore={useStore}
				/>
			</MemoryRouter>,
		);

		const input = screen.getByPlaceholderText("CUI");
		fireEvent.change(input, { target: { value: "2987944380208" } });
		const namesInput = screen.getByPlaceholderText("Nombres");
		fireEvent.change(namesInput, { target: { value: "Test" } });
		const surnamesInput = screen.getByPlaceholderText("Apellidos");
		fireEvent.change(surnamesInput, { target: { value: "User" } });
		const genderInput = screen.getByLabelText("Femenino");
		fireEvent.click(genderInput);
		const birthDateInput = screen.getByPlaceholderText("Fecha de nacimiento");
		fireEvent.change(birthDateInput, { target: { value: "2000-01-01" } });
		const button = screen.getByText("Registrar información");
		fireEvent.click(button);

		await waitFor(() =>
			expect(submitPatientData).toHaveBeenCalledWith(
				expect.objectContaining({
					cui: "2987944380208",
					names: "Test",
					lastNames: "User",
					isWoman: true,
					birthdate: "2000-01-01",
				}),
			),
		);
	});

	test("CUI input only allows numeric characters and limits to 13 digits", () => {
		const useStore = createEmptyStore();
		render(
			<MemoryRouter>
				<AddPatientView submitPatientData={() => {}} useStore={useStore} />
			</MemoryRouter>,
		);

		const input = screen.getByPlaceholderText("CUI");

		const typeValue = (input, value) => {
			fireEvent.change(input, { target: { value } });
			const chars = value.split("");
			for (let i = 0; i < chars.length; i++) {
				const char = chars[i];
				fireEvent.keyDown(input, {
					key: char,
					code: `Key${char.toUpperCase()}`,
				});
			}
		};

		typeValue(input, "abc1234567890123456");
		expect(input.value).toBe("1234567890123456");
	});

	test("Shows new patient form when CUI does not exist", async () => {
		const submitPatientData = vi
			.fn()
			.mockResolvedValue({ id: "new-patient-id" });
		const useStore = createEmptyStore();

		render(
			<MemoryRouter>
				<AddPatientView
					submitPatientData={submitPatientData}
					useStore={useStore}
				/>
			</MemoryRouter>,
		);

		const input = screen.getByPlaceholderText("CUI");
		fireEvent.change(input, { target: { value: "1234567890123" } });
		const button = screen.getByText("Registrar información");
		fireEvent.click(button);

		await waitFor(() => {
			expect(screen.getByText("Por favor, registre al paciente")).toBeVisible();
		});
	});
});
