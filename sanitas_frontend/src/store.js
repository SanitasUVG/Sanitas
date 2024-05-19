import { create } from "zustand";

/**
 * @typedef {Object} SanitasStore
 *
 * @property {Object} searchQuery
 * @property {string} searchQuery.query
 * @property {string} searchQuery.type
 *
 * @property {(query: string, type: string)=>void} setSearchQuery
 *
 * @property {import("./views/SearchPatientView").PatientPreview[]} patients
 * @property {(newPatients: import("./views/SearchPatientView").PatientPreview[])=>void} setPatients
 */

/**
 * @typedef {import("zustand").UseBoundStore<import("zustand").StoreApi<SanitasStore>>} Store
 */

/**
 * @type {Store}
 */
export const useStore = create((set) => ({
  searchQuery: {
    query: "",
    type: "",
  },

  setSearchQuery: (query, type) =>
    set((state) => ({
      searchQuery: { ...state.searchQuery, query, type },
    })),

  patients: [],
  setPatients: (patients) => set({ patients }),
}));
