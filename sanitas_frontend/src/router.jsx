import { foundUserData, searchPatient } from "./dataLayer.mjs";
import { createEmptyStore } from "./store.mjs";
import { AddPatientView } from "./views/AddPatientView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateInfoView";

const useStore = createEmptyStore();

export const NAV_PATHS = {
  SEARCH_PATIENT: "/",
  ADD_PATIENT: "/form-patient",
  UPDATE_PATIENT: "/update-view",
};

export const ROUTES = [
  {
    path: NAV_PATHS.SEARCH_PATIENT,
    element: (
      <SearchPatientView
        searchPatientsApiCall={searchPatient}
        useStore={useStore}
      />
    ),
  },
  {
    path: NAV_PATHS.ADD_PATIENT,
    element: <AddPatientView foundUserData={foundUserData} useStore={useStore} />,
  },
  {
    path: NAV_PATHS.UPDATE_PATIENT,
    element: <UpdateInfoView />,
  },
];
