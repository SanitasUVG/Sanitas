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

describe("PersonalHistory Component Tests", () => {
  const mockGetBirthdayPatientInfo = vi.fn(() => Promise.resolve({ result: { birthdate: "1990-01-01" } }));
  const mockGetPersonalHistory = vi.fn(() =>
    Promise.resolve({
      result: {
        medicalHistory: {
          hypertension: {
            version: 1,
            data: [{
              medicine: "Medicina random 1",
              dose: "5ml",
              frequency: "3 veces al día",
            }, {
              medicine: "Medicina random 2",
              dose: "10ml",
              frequency: "Una vez al día",
            }],
          },
          diabetesMellitus: {
            version: 1,
            data: [
              {
                medicine: "Medicina random 4",
                dose: "2 pastillas",
                frequency: "Cada 8 horas",
              },
            ],
          },
          hypothyroidism: {
            version: 1,
            data: [
              {
                medicine: "Medicina random 4",
                dose: "2 pastillas",
                frequency: "Cada 8 horas",
              },
            ],
          },
          asthma: {
            version: 1,
            data: [
              {
                medicine: "Medicina random 4",
                dose: "2 pastillas",
                frequency: "Cada 8 horas",
              },
            ],
          },
          convulsions: {
            version: 1,
            data: [
              {
                medicine: "Medicina random 4",
                dose: "2 pastillas",
                frequency: "Cada 8 horas",
              },
            ],
          },
          myocardialInfarction: {
            version: 1,
            data: [2012, 2016],
          },
          cancer: {
            version: 1,
            data: [
              {
                typeOfCancer: "Breast",
                treatment: "Operation",
              },
            ],
          },
          cardiacDiseases: {
            version: 1,
            data: [
              {
                typeOfDisease: "Hypertrophy",
                medicine: "Medicina random 5",
                dose: "5ml",
                frequency: "1 vez al día",
              },
              {
                typeOfDisease: "Hypertrophy 2",
                medicine: "Medicina random 5",
                dose: "5ml",
                frequency: "1 vez al día",
              },
            ],
          },
          renalDiseases: {
            version: 1,
            data: [
              {
                typeOfDisease: "Hypertrophy 2",
                medicine: "Medicina random 5",
                dose: "5ml",
                frequency: "1 vez al día",
              },
              {
                typeOfDisease: "Hypertrophy 2",
                medicine: "Medicina random 5",
                dose: "5ml",
                frequency: "1 vez al día",
              },
            ],
          },
          others: {
            version: 1,
            data: [
              {
                typeOfDisease: "Hypertrophy 2",
                medicine: "Medicina random 5",
                dose: "5ml",
                frequency: "1 vez al día",
              },
            ],
          },
        },
      },
    })
  );
  const mockUpdatePersonalHistory = vi.fn(() => Promise.resolve({ success: true }));
  const mockUseStore = vi.fn().mockReturnValue({ selectedPatientId: "123" });

  const sidebarConfig = {
    userInformation: { displayName: "User Testing" },
  };

  const Wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

  test("opens new form on button click", async () => {
    render(
      <Wrapper>
        <PersonalHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getPersonalHistory={mockGetPersonalHistory}
          updatePersonalHistory={mockUpdatePersonalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => expect(mockGetBirthdayPatientInfo).toHaveBeenCalled());
    await waitFor(() => expect(mockGetPersonalHistory).toHaveBeenCalled());

    const addButton = await screen.findByText("Agregar antecedente quirúrgico");
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(screen.getByText("Guardar")).toBeInTheDocument();
    });
  });

  test("cancels new surgical record form on button click", async () => {
    render(
      <Wrapper>
        <PersonalHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getPersonalHistory={mockGetPersonalHistory}
          updatePersonalHistory={mockUpdatePersonalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => expect(mockGetBirthdayPatientInfo).toHaveBeenCalled());
    await waitFor(() => expect(mockGetPersonalHistory).toHaveBeenCalled());

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
        <PersonalHistory
          getBirthdayPatientInfo={mockGetBirthdayPatientInfo}
          getPersonalHistory={mockGetPersonalHistory}
          updatePersonalHistory={mockUpdatePersonalHistory}
          sidebarConfig={sidebarConfig}
          useStore={mockUseStore}
        />
      </Wrapper>,
    );

    await waitFor(() => expect(mockGetBirthdayPatientInfo).toHaveBeenCalled());
    await waitFor(() => expect(mockGetPersonalHistory).toHaveBeenCalled());

    const addButton = await screen.findByText("Agregar antecedente quirúrgico");
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
