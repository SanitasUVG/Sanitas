import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { describe, expect, test, vi } from "vitest";
import { AddPatientView } from "../AddPatientView";

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

		expect(window.alert).toHaveBeenCalledWith(
			"El CUI debe contener exactamente 13 caracteres.",
		);
		expect(submitPatientData).not.toHaveBeenCalled();
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
		fireEvent.change(input, { target: { value: "1234567890123" } });
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
					cui: "1234567890123",
					names: "Test",
					surnames: "User",
					sex: true,
					birthDate: "2000-01-01",
				}),
			),
		);
	});

	test("Displays error message when submitPatientData fails", async () => {
		const errorMessage = "Error de conexión";
		const useStore = createEmptyStore();

		const submitPatientData = vi
			.fn()
			.mockRejectedValue(new Error(errorMessage));
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
		fireEvent.change(input, { target: { value: "1234567890123" } });
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
			expect(window.alert).toHaveBeenCalledWith(
				`Error al enviar datos: ${errorMessage}`,
			);
		});
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
