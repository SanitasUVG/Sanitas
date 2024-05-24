import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AddPatientView } from "../AddPatientView/index";

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}));

const mockCheckCui = vi.fn();
const mockSubmitPatientData = vi.fn();

describe("AddPatientView", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (url.includes("check-cui")) {
        const exists = url.endsWith("1234567891012");
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ exists: exists }),
        });
      }

      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Error occurred" }),
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("should render the input and button", () => {
    render(<AddPatientView checkCui={mockCheckCui} submitPatientData={mockSubmitPatientData} />);
    expect(screen.getByPlaceholderText("Ingrese el CUI")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ver paciente/i })).toBeInTheDocument();
  });

  it("should display an error message if CUI is less than 13 digits and button is clicked", () => {
    render(<AddPatientView checkCui={mockCheckCui} submitPatientData={mockSubmitPatientData} />);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: /ver paciente/i }));
    expect(alertSpy).toHaveBeenCalledWith("El CUI debe contener exactamente 13 dígitos.");
    alertSpy.mockRestore();
  });

  it("should handle CUI check correctly", async () => {
    mockCheckCui.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: true }),
    });

    render(<AddPatientView checkCui={mockCheckCui} submitPatientData={mockSubmitPatientData} />);
    fireEvent.change(screen.getByPlaceholderText("Ingrese el CUI"), {
      target: { value: "1234567891012" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ver paciente/i }));

    await waitFor(() => expect(screen.getByText("¡Información del paciente encontrada!")).toBeInTheDocument());
  });

  it("should handle non-existent CUI correctly", async () => {
    mockCheckCui.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: false }),
    });

    render(<AddPatientView checkCui={mockCheckCui} submitPatientData={mockSubmitPatientData} />);
    fireEvent.change(screen.getByPlaceholderText("Ingrese el CUI"), {
      target: { value: "1234567890123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ver paciente/i }));

    await waitFor(() =>
      expect(
        screen.getByText("No se encontró información. Por favor, registre al paciente."),
      ).toBeInTheDocument()
    );
  });

  it("should allow entering information for a new patient when CUI does not exist", async () => {
    mockCheckCui.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ exists: false }),
    });

    render(<AddPatientView checkCui={mockCheckCui} submitPatientData={mockSubmitPatientData} />);
    fireEvent.change(screen.getByPlaceholderText("Ingrese el CUI"), {
      target: { value: "1234567890123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ver paciente/i }));

    // Use findByText to wait asynchronously for the element to appear
    const message = await screen.findByText(
      "No se encontró información. Por favor, registre al paciente.",
    );
    expect(message).toBeInTheDocument();

    const namesInput = screen.getByPlaceholderText("Nombres");
    const surnamesInput = screen.getByPlaceholderText("Apellidos");

    fireEvent.change(namesInput, { target: { value: "Nuevo" } });
    fireEvent.change(surnamesInput, { target: { value: "Paciente" } });

    expect(namesInput.value).toBe("Nuevo");
    expect(surnamesInput.value).toBe("Paciente");
  });
});
