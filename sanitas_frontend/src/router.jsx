import { useNavigate } from "react-router-dom";
import {
  checkCui,
  getCollaboratorInformation,
  getGeneralPatientInformation,
  getStudentPatientInformation,
  searchPatient,
  submitPatientData,
  updateCollaboratorInformation,
  updateGeneralPatientInformation,
  updateStudentPatientInformation,
} from "./dataLayer.mjs";
import { createEmptyStore } from "./store.mjs";
import { AddPatientView } from "./views/AddPatientView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateGeneralInformationView";

const useStore = createEmptyStore();

export const NAV_PATHS = {
  SEARCH_PATIENT: "/",
  ADD_PATIENT: "new",
  UPDATE_PATIENT: "update",
};

export const UPDATE_PATIENT_NAV_PATHS = {
  GENERAL_INFORMATION: "general",
  // TODO: Add other Navigation routes...
};

/**@type {import("./components/DashboardSidebar").DashboardSidebarProps} */
export const DEFAULT_DASHBOARD_SIDEBAR_PROPS = {
  userInformation: {
    displayName: "Pedrito Pérez",
    title: "Test username",
  },
  onGoBack: (navigate) => {
    navigate(NAV_PATHS.SEARCH_PATIENT);
  },
  navigateToGeneral: (navigate) => {
    navigate(UPDATE_PATIENT_NAV_PATHS.GENERAL_INFORMATION);
  },
  // TODO: Add other Navigation routes...
};

const updateInfoView = (
  <UpdateInfoView
    getGeneralPatientInformation={getGeneralPatientInformation}
    updateGeneralPatientInformation={updateGeneralPatientInformation}
    getStudentPatientInformation={getStudentPatientInformation}
    updateStudentPatientInformation={updateStudentPatientInformation}
    getCollaboratorInformation={getCollaboratorInformation}
    updateCollaboratorInformation={updateCollaboratorInformation}
    sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
    useStore={useStore}
  />
);

export const ROUTES = [
  {
    path: NAV_PATHS.SEARCH_PATIENT,
    element: <SearchPatientView searchPatientsApiCall={searchPatient} useStore={useStore} />,
  },
  {
    path: NAV_PATHS.ADD_PATIENT,
    element: (
      <AddPatientView
        checkCui={checkCui}
        submitPatientData={submitPatientData}
        useStore={useStore}
      />
    ),
  },
  {
    path: NAV_PATHS.UPDATE_PATIENT,
    // The default page is the update general information view.
    element: updateInfoView,
    children: [
      {
        path: UPDATE_PATIENT_NAV_PATHS.GENERAL_INFORMATION,
        element: updateInfoView,
      },
    ],
  },
];
