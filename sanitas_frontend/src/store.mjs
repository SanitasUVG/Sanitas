import { create } from "zustand";

// NOTE: Remember, everything you add to the store must be added to the JSDoc type too!
// If you don't then intellisense will not autocomplete.
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
 *
 * @property {number} selectedPatientId
 * @property {(newId: number) => void} setSelectedPatientId
 *
 * @property {boolean} isWoman
 * @property {(newIsWoman: boolean) => void} setIsWoman
 *
 * @property {string[]} prefixesWithData
 * @property {(newPrefixesWithData: string[]) => void} setPrefixesWithData
 */

/**
 * Type alias for a zustand store hook.
 * @typedef {import("zustand").UseBoundStore<import("zustand").StoreApi<SanitasStore>>} UseStoreHook
 */

/**
 * Creates an empty SanitasStore and returns a hook to access it.
 * This can be used to run each test with a different store completely,
 * guaranteeing isolation.
 * @param {SanitasStore} defaultStoreValues - Allows for overriding the store values.
 * @returns {UseStoreHook} The `useStore` hook
 */
export const createEmptyStore = (defaultStoreValues) => {
	return create((set) => ({
		searchQuery: {
			query: "",
			// NOTE: This is the default search term
			type: "Carnet",
		},

		setSearchQuery: (query, type) =>
			set((state) => ({
				searchQuery: { ...state.searchQuery, query, type },
			})),

		patients: [],
		setPatients: (patients) => set({ patients }),

		selectedPatientId: 0,
		setSelectedPatientId: (newId) => {
			set({ selectedPatientId: newId });
		},

		isWoman: true,
		setIsWoman: (isWoman) => {
			set({ isWoman });
		},

		prefixesWithData: [],
		setPrefixesWithData: (prefixesWithData) => {
			set({ prefixesWithData });
		},

		...defaultStoreValues,
	}));
};
