import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { describe, expect, test, vi } from "vitest";
import { TraumatologicHistory } from ".";

vi.mock("react-toastify", () => {
  return {
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe("TraumatologicHistory Component Tests", () => {
  const mockGetBirthdayPatientInfo = vi.fn(() => Promise.resolve({ result: { birthdate: "1990-01-01" } }));
  const mockGetTraumatologicHistory = vi.fn(() =>
    Promise.resolve({
      result: {
        medicalHistory: {
          traumas: {
            data: [{ whichBone: "Femur", year: "2023", treatment: "Surgery" }],
            version: 1,
          },
        },
      },
    })
  );
  const mockUpdateTraumatologicHistory = vi.fn(() => Promise.resolve({ success: true }));
  const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

  const sidebarConfig = {
    userInformation: { displayName: "User Testing" },
  };

  const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

  test("opens new form on button click", async () => {
    render(
      <Wrapper>
        <TraumatologicHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getTraumatologicHistory={mockGetTraumatologicHistory}
          updateTraumatologicHistory={mockUpdateTraumatologicHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => expect(mockGetBirthdayPatientInfo).toHaveBeenCalled());
    await waitFor(() => expect(mockGetTraumatologicHistory).toHaveBeenCalled());

    const addButton = await screen.findByText("Agregar antecedente traumatológico");
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });
  });

  test("cancels new surgical record form on button click", async () => {
    render(
      <Wrapper>
        <TraumatologicHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getTraumatologicHistory={mockGetTraumatologicHistory}
          updateTraumatologicHistory={mockUpdateTraumatologicHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => expect(mockGetBirthdayPatientInfo).toHaveBeenCalled());
    await waitFor(() => expect(mockGetTraumatologicHistory).toHaveBeenCalled());

    const addButton = await screen.findByText("Agregar antecedente traumatológico");
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });

    const cancelButton = screen.getByText("Cancelar");
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByText("Guardar")).not.toBeInTheDocument();
    });
  });

  test("shows an error message when trying to save with empty fields", async () => {
    render(
      <Wrapper>
        <TraumatologicHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getTraumatologicHistory={mockGetTraumatologicHistory}
          updateTraumatologicHistory={mockUpdateTraumatologicHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => expect(mockGetBirthdayPatientInfo).toHaveBeenCalled());
    await waitFor(() => expect(mockGetTraumatologicHistory).toHaveBeenCalled());

    const addButton = await screen.findByText("Agregar antecedente traumatológico");
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });

    const saveButton = screen.getByText("Guardar");
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Complete todos los campos requeridos.");
    });
  });
});
