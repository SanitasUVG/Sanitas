import { Outlet } from "react-router-dom";
import { registerUser } from "./cognito.mjs";
import {
  checkCui,
  getCollaboratorInformation,
  getFamilyHistory,
  getGeneralPatientInformation,
  getStudentPatientInformation,
  getSurgicalHistory,
  getTraumatologicalHistory,
  searchPatient,
  submitPatientData,
  updateCollaboratorInformation,
  updateFamilyHistory,
  updateGeneralPatientInformation,
  updateStudentPatientInformation,
  updateSurgicalHistory,
  updateTraumatologicalHistory,
} from "./dataLayer.mjs";
import { createEmptyStore } from "./store.mjs";
import { AddPatientView } from "./views/AddPatientView";
import { FamiliarHistory } from "./views/History/Familiar";
import { SurgicalHistory } from "./views/History/Surgical";
import RegisterView from "./views/RegisterView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateGeneralInformationView";
import { TraumatologicHistory } from "./views/UpdateTraumatologicalHistoryView";

const useStore = createEmptyStore();

export const NAV_PATHS = {
  // SEARCH_PATIENT: "/",
  // REGISTER_USER: "/register",
  SEARCH_PATIENT: "/search",
  REGISTER_USER: "/",
  ADD_PATIENT: "/new",
  UPDATE_PATIENT: "/update",
};

export const UPDATE_PATIENT_NAV_PATHS = {
  GENERAL_INFORMATION: "general",
  SURGICAL_HISTORY: "surgical",
  TRAUMATOLOGICAL_HISTORY: "traumatological",
  FAMILIAR_HISTORY: "familiar",
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
    navigate(`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.GENERAL_INFORMATION}`);
  },
  navigateToSurgical: (navigate) => {
    navigate(`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.SURGICAL_HISTORY}`);
  },
  navigateToTraumatological: (navigate) => {
    navigate(`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.TRAUMATOLOGICAL_HISTORY}`);
  },
  navigateToFamiliar: (navigate) => {
    navigate(`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.FAMILIAR_HISTORY}`);
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

const surgicalHistoryView = (
  <SurgicalHistory
    getBirthdayPatientInfo={getGeneralPatientInformation}
    getSurgicalHistory={getSurgicalHistory}
    updateSurgicalHistory={updateSurgicalHistory}
    sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
    useStore={useStore}
  />
);

const traumatologicalHistoryView = (
  <TraumatologicHistory
    getBirthdayPatientInfo={getGeneralPatientInformation}
    getTraumatologicHistory={getTraumatologicalHistory}
    updateTraumatologicalHistory={updateTraumatologicalHistory}
    sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
    useStore={useStore}
  />
);

const familiarHistoryView = (
  <FamiliarHistory
    getFamiliarHistory={getFamilyHistory}
    updateFamiliarHistory={updateFamilyHistory}
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
    path: NAV_PATHS.REGISTER_USER,
    // element: (
    //   <RegisterView
    //     registerUser={(_email, _password) => {
    //       console.log("Register user called");
    //     }}
    //   />
    // ),
    element: <RegisterView registerUser={registerUser} />,
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
    element: <Outlet />,
    children: [
      {
        index: true,
        element: updateInfoView,
      },
      {
        path: UPDATE_PATIENT_NAV_PATHS.GENERAL_INFORMATION,
        element: updateInfoView,
      },
      {
        path: UPDATE_PATIENT_NAV_PATHS.SURGICAL_HISTORY,
        element: surgicalHistoryView,
      },
      {
        path: UPDATE_PATIENT_NAV_PATHS.TRAUMATOLOGICAL_HISTORY,
        element: traumatologicalHistoryView,
      },
      {
        path: UPDATE_PATIENT_NAV_PATHS.FAMILIAR_HISTORY,
        element: familiarHistoryView,
      },
      // TODO: Add more routes...
    ],
  },
];
