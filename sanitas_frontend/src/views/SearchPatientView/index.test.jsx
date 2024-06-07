import { fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createEmptyStore } from "src/store.mjs";
import { describe, expect, test, vi } from "vitest";
import SearchPatientView from ".";

describe("Search Patient view ui tests", () => {
  test("Can't search if query is empty", () => {
    const apiCall = vi.fn();
    const useStore = createEmptyStore();

    const dom = render(
      <MemoryRouter>
        <SearchPatientView searchPatientsApiCall={apiCall} useStore={useStore} />
      </MemoryRouter>,
    );
    const searchBtn = dom.getByText("Buscar");

    fireEvent.click(searchBtn);

    expect(apiCall).toHaveBeenCalledTimes(0);
  });

  test("On search calls function", () => {
    const apiCall = vi.fn(() => ({
      result: [],
    }));
    const useStore = createEmptyStore();

    const dom = render(
      <MemoryRouter>
        <SearchPatientView searchPatientsApiCall={apiCall} useStore={useStore} />
      </MemoryRouter>,
    );

    const searchElem = dom.getByPlaceholderText("Ingrese su búsqueda...");
    const searchBtn = dom.getByText("Buscar");

    fireEvent.change(searchElem, { target: { value: "asdflkjlk" } });
    fireEvent.click(searchBtn);

    expect(apiCall).toHaveBeenCalledOnce();
  });

  test("Display a button to see patient", async () => {
    const apiCall = vi.fn(() => {
      const result = [
        {
          id: 1234,
          names: "Flavio Galán",
        },
      ];
      return { result };
    });
    const useStore = createEmptyStore();

    const dom = render(
      <MemoryRouter>
        <SearchPatientView searchPatientsApiCall={apiCall} useStore={useStore} />
      </MemoryRouter>,
    );
    const searchElem = dom.getByPlaceholderText("Ingrese su búsqueda...");
    const searchBtn = dom.getByText("Buscar");

    fireEvent.change(searchElem, { target: { value: "asdflkj" } });
    fireEvent.click(searchBtn);

    expect(apiCall).toHaveBeenCalledOnce();

    // The function below throws if 0 or 2+ elements are found.
    await waitFor(() => {
      expect(dom.getByText("Ver")).toBeVisible();
    }, {
      timeout: 500,
    });
  });
});
