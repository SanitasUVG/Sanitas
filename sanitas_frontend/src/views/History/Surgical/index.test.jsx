import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { toast } from "react-toastify";
import { describe, expect, test, vi } from "vitest";
import { SurgicalHistory } from ".";

vi.mock("react-toastify", () => {
  return {
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    },
  };
});

describe("SurgicalHistory Component Tests", () => {
  const mockGetBirthdayPatientInfo = vi.fn(() => Promise.resolve({ result: { birthdate: "1990-01-01" } }));
  const mockGetSurgicalHistory = vi.fn(() =>
    Promise.resolve({
      result: [{ surgeryType: "Appendectomy", surgeryYear: "2020", complications: "None" }],
    })
  );
  const mockUpdateSurgicalHistory = vi.fn(() => Promise.resolve({ success: true }));
  const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

  const sidebarConfig = {
    userInformation: { displayName: "User Testing" },
  };

  const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

  test("opens new form on button click", async () => {
    render(
      <Wrapper>
        <SurgicalHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getSurgicalHistory={mockGetSurgicalHistory}
          updateSurgicalHistory={mockUpdateSurgicalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );
    // Correctamente espera por el botón antes de hacer clic
    const addButton = await screen.findByText("Agregar antecedente quirúrgico");
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });
  });

  test("cancels new surgical record form on button click", async () => {
    render(
      <Wrapper>
        <SurgicalHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getSurgicalHistory={mockGetSurgicalHistory}
          updateSurgicalHistory={mockUpdateSurgicalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    const addButton = await screen.findByText("Agregar antecedente quirúrgico");
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
        <SurgicalHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getSurgicalHistory={mockGetSurgicalHistory}
          updateSurgicalHistory={mockUpdateSurgicalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    // Abre el formulario para agregar un nuevo registro quirúrgico
    const addButton = await screen.findByText("Agregar antecedente quirúrgico");
    fireEvent.click(addButton);

    // Espera a que se cargue el formulario
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });

    // Intenta guardar con los campos vacíos
    const saveButton = screen.getByText("Guardar");
    fireEvent.click(saveButton);

    // Verifica que aparece el mensaje de error indicando que los campos están vacíos
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Complete todos los campos requeridos.");
    });
  });
});
