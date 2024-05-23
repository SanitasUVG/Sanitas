import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddPatientView } from "./index";

// Mock the `useNavigate` hook used by the component
vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

describe("AddPatientView", () => {
  it("should render the input and button", () => {
    render(<AddPatientView />);
    expect(screen.getByPlaceholderText("Ingrese el CUI")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver paciente/i })).toBeInTheDocument(); // Correct the button text to match component
  });

  it("should display an error message if CUI is less than 13 digits and button is clicked", () => {
    render(<AddPatientView />);
    // Using a spy to mock and check if alert is called
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: /ver paciente/i }));
    expect(alertSpy).toHaveBeenCalledWith("El CUI debe contener exactamente 13 dígitos.");
    alertSpy.mockRestore(); // Restore the original implementation
  });

  it("should handle CUI check correctly", async () => {
    // Mock fetch to simulate API response
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: true }),
    });

    render(<AddPatientView />);
    fireEvent.change(screen.getByPlaceholderText("Ingrese el CUI"), {
      target: { value: "1234567891012" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ver paciente/i }));

    // Wait for the expected message to appear in the document
    await screen.findByText("¡Información del paciente encontrada!");
    expect(screen.getByText("¡Información del paciente encontrada!")).toBeInTheDocument();
    global.fetch.mockRestore(); // Restore fetch to its original state
  });

  it("should handle non-existent CUI correctly", async () => {
    // Mock the fetch function to simulate API response for non-existent CUI
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: false }),
    });

    render(<AddPatientView />);
    fireEvent.change(screen.getByPlaceholderText("Ingrese el CUI"), {
      target: { value: "1234567890123" }, // Assumed length is correct but CUI does not exist
    });
    fireEvent.click(screen.getByRole("button", { name: /ver paciente/i }));

    // Wait for the message about non-existent CUI to appear
    await screen.findByText("No se encontró información. Por favor, registre al paciente.");
    expect(
      screen.getByText("No se encontró información. Por favor, registre al paciente."),
    ).toBeInTheDocument();

    // Cleanup the mock to avoid interference with other tests
    global.fetch.mockRestore();
  });
  it("should allow entering information for a new patient when CUI does not exist", async () => {
    // Mock the fetch to simulate a non-existent CUI response
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: false }),
    });

    render(<AddPatientView />);
    fireEvent.change(screen.getByPlaceholderText("Ingrese el CUI"), {
      target: { value: "1234567890123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ver paciente/i }));

    // Expect to render the form for new patient registration
    await waitFor(() => {
      expect(
        screen.getByText("No se encontró información. Por favor, registre al paciente."),
      ).toBeInTheDocument();
    });

    // Assuming that the form is conditionally rendered based on `patientData.isNew`
    const namesInput = screen.getByPlaceholderText("Nombres");
    const surnamesInput = screen.getByPlaceholderText("Apellidos");

    // Simulate entering new patient data
    fireEvent.change(namesInput, { target: { value: "Nuevo" } });
    fireEvent.change(surnamesInput, { target: { value: "Paciente" } });

    // Check if the inputs reflect the values entered
    expect(namesInput.value).toBe("Nuevo");
    expect(surnamesInput.value).toBe("Paciente");

    // Cleanup the mock
    global.fetch.mockRestore();
  });
});
