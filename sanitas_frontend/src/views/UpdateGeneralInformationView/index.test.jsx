import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { describe, expect, test, vi } from "vitest";
import UpdateInfoView from "./index";

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
  insuranceId: 12345,
  birthdate: "1980-01-02",
  phone: "555-1234",
};

/** @type {import("src/components/DashboardSidebar").UserInformation} */
const exampleUserInformation = {
  displayName: "Jennifer Bustamante",
  title: "Doctora UVG",
};

const mockGetGeneralPatientInformation = async (id) => {
  if (id === examplePatientData.id) {
    return { result: examplePatientData };
  } else {
    return { error: new Error("Error al buscar el paciente. Asegúrese de que el ID es correcto.") };
  }
};

describe("UpdateInfoView tests", () => {
  test("Displays patient information correctly", async () => {
    const getGeneralPatientInformation = vi.fn().mockResolvedValue({ result: examplePatientData });
    const useStore = createEmptyStore();

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <UpdateInfoView
                getGeneralPatientInformation={getGeneralPatientInformation}
                updateGeneralPatientInformation={() => {}}
                useStore={useStore}
                sidebarConfig={{ userInformation: exampleUserInformation }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("John")).toBeVisible();
      expect(screen.getByDisplayValue("Doe")).toBeVisible();
      expect(screen.getByDisplayValue("john.doe@example.com")).toBeVisible();
      expect(screen.getByDisplayValue("Jane Doe")).toBeVisible();
      expect(screen.getByDisplayValue("123456789")).toBeVisible();
      expect(screen.getByDisplayValue("Mike Doe")).toBeVisible();
      expect(screen.getByDisplayValue("987654321")).toBeVisible();
      expect(screen.getByDisplayValue("O+")).toBeVisible();
      expect(screen.getByDisplayValue("123 Main St")).toBeVisible();
      expect(screen.getByDisplayValue("12345")).toBeVisible();
      expect(screen.getByDisplayValue("1980-01-02")).toBeVisible();
      expect(screen.getByDisplayValue("555-1234")).toBeVisible();
    }, { timeout: 500 });
  });

  test("Shows error message when patient information cannot be fetched", async () => {
    const errorMessage = "Error al buscar el paciente. Asegúrese de que el ID es correcto.";
    const getGeneralPatientInformation = vi.fn().mockResolvedValue({ error: new Error("error") });
    const useStore = createEmptyStore();

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <UpdateInfoView
                getGeneralPatientInformation={getGeneralPatientInformation}
                updateGeneralPatientInformation={() => {}}
                useStore={useStore}
                sidebarConfig={{ userInformation: exampleUserInformation }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText((content, element) => content.includes(errorMessage))).toBeVisible();
    }, { timeout: 500 });
  });

  test("Shows loading message when fetching patient information", () => {
    const getGeneralPatientInformation = vi.fn().mockResolvedValue(new Promise(() => {}));
    const useStore = createEmptyStore();

    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={
              <UpdateInfoView
                getGeneralPatientInformation={getGeneralPatientInformation}
                updateGeneralPatientInformation={() => {}}
                useStore={useStore}
                sidebarConfig={{ userInformation: exampleUserInformation }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Cargando información del paciente...")).toBeVisible();
  });
});
