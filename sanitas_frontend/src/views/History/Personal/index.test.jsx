import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { describe, expect, test, vi } from "vitest";
import { PersonalHistory } from ".";

vi.mock("react-toastify", () => {
  return {
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    },
  };
});

const mockGetPersonalHistoryWithData = async (id) => ({
  result: {
    medicalHistory: {
      hypertension: {
        data: [{ typeOfDisease: "hiper", medicine: "ibuprofeno", dose: "10", frequency: "21" }],
        version: 1,
      },
      diabetesMellitus: {
        data: [{ typeOfDisease: "dia", medicine: "azucar", dose: "12", frequency: "23" }],
        version: 1,
      },
      hypothyroidism: { data: [], version: 1 },
      asthma: { data: [], version: 1 },
      convulsions: { data: [], version: 1 },
      myocardialInfarction: { data: [], version: 1 },
      cancer: { data: [], version: 1 },
      cardiacDiseases: { data: [], version: 1 },
      renalDiseases: { data: [], version: 1 },
      others: { data: [], version: 1 },
    },
  },
});

const mockUpdatePersonalHistory = vi.fn(() => Promise.resolve({ success: true }));
const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

const sidebarConfig = {
  userInformation: { displayName: "User Testing" },
};

const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe("PersonalHistory Component Tests", () => {
  test("opens new form on button click", async () => {
    render(
      <Wrapper>
        <PersonalHistory
          getPersonalHistory={mockGetPersonalHistoryWithData}
          updatePersonalHistory={mockUpdatePersonalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => screen.getByText("Agregar antecedente personal"));

    const addButton = screen.getByText("Agregar antecedente personal");
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });
  });

  test("displays empty state message when there is no data", async () => {
    const mockGetPersonalHistoryEmpty = vi.fn(() =>
      Promise.resolve({
        result: {
          medicalHistory: {
            hypertension: { data: [], version: 1 },
            diabetesMellitus: { data: [], version: 1 },
            hypothyroidism: { data: [], version: 1 },
            asthma: { data: [], version: 1 },
            convulsions: { data: [], version: 1 },
            myocardialInfarction: { data: [], version: 1 },
            cancer: { data: [], version: 1 },
            cardiacDiseases: { data: [], version: 1 },
            renalDiseases: { data: [], version: 1 },
            others: { data: [], version: 1 },
          },
        },
      })
    );

    render(
      <Wrapper>
        <PersonalHistory
          getPersonalHistory={mockGetPersonalHistoryEmpty}
          updatePersonalHistory={mockUpdatePersonalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() =>
      screen.getByText(
        "¡Parece que no hay antecedentes personales! Agrega uno en el botón de arriba.",
      )
    );
  });

  test("displays error message when there is an error fetching data", async () => {
    const mockGetPersonalHistoryError = vi.fn(() =>
      Promise.resolve({
        error: {
          response: {
            status: 400,
            statusText: "Bad Request",
            data: "Invalid request parameters.",
          },
        },
      })
    );

    render(
      <Wrapper>
        <PersonalHistory
          getPersonalHistory={mockGetPersonalHistoryError}
          updatePersonalHistory={mockUpdatePersonalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => screen.getByText("Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!"));
  });

  test("adds a new personal history record", async () => {
    render(
      <Wrapper>
        <PersonalHistory
          getPersonalHistory={mockGetPersonalHistoryWithData}
          updatePersonalHistory={mockUpdatePersonalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => screen.getByText("Agregar antecedente personal"));
    fireEvent.click(screen.getByText("Agregar antecedente personal"));

    await waitFor(() => screen.getByText("Guardar"));

    fireEvent.change(
      screen.getByPlaceholderText(
        "Ingrese el tratamiento administrado",
      ),
      {
        target: "Ibuprofeno",
      },
    );

    fireEvent.click(screen.getByText("Guardar"));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Historial personal guardado con éxito."));
  });
});
