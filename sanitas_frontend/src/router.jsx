import { element } from "prop-types";
import { Outlet } from "react-router-dom";
import RequireAuth from "src/components/RequireAuth";
import {
  getSession,
  logoutUser,
  mockGetSession,
  mockLogoutUser,
  mockRegisterUser,
  mockSingInUser,
  registerUser,
  signInUser,
} from "./cognito.mjs";
import { IS_PRODUCTION } from "./constants.mjs";
import {
  checkCui,
  getCollaboratorInformation,
  getFamilyHistory,
  getGeneralPatientInformation,
  getNonPathologicalHistory,
  getStudentPatientInformation,
  getSurgicalHistory,
  getTraumatologicalHistory,
  searchPatient,
  submitPatientData,
  updateCollaboratorInformation,
  updateFamilyHistory,
  updateGeneralPatientInformation,
  updateNonPathologicalHistory,
  updateStudentPatientInformation,
  updateSurgicalHistory,
  updateTraumatologicalHistory,
} from "./dataLayer.mjs";
import { createEmptyStore } from "./store.mjs";
import { AddPatientView } from "./views/AddPatientView";
import { FamiliarHistory } from "./views/History/Familiar";
import { NonPathologicalHistory } from "./views/History/NonPathological";
import { SurgicalHistory } from "./views/History/Surgical";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateGeneralInformationView";
import { TraumatologicHistory } from "./views/UpdateTraumatologicalHistoryView";

const useStore = createEmptyStore();

export const NAV_PATHS = {
  SEARCH_PATIENT: "/",
  REGISTER_USER: "/register",
  LOGIN_USER: "/login",
  ADD_PATIENT: "/new",
  UPDATE_PATIENT: "/update",
};

export const UPDATE_PATIENT_NAV_PATHS = {
  GENERAL_INFORMATION: "general",
  SURGICAL_HISTORY: "surgical",
  TRAUMATOLOGICAL_HISTORY: "traumatological",
  FAMILIAR_HISTORY: "familiar",
  NONPATHOLOGICAL_HISTORY: "non-pathological",
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
  navigateToNonPathological: (navigate) => {
    console.log("navigate function:", navigate);
    navigate(`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.NONPATHOLOGICAL_HISTORY}`);
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

const nonPathologicalHistoryView = (
  <NonPathologicalHistory
    getNonPathologicalHistory={getNonPathologicalHistory}
    updateNonPathologicalHistory={updateNonPathologicalHistory}
    sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
    useStore={useStore}
  />
);

export const ROUTES = [
  {
    path: NAV_PATHS.SEARCH_PATIENT,
    element: (
      <RequireAuth
        getSession={IS_PRODUCTION ? getSession : mockGetSession}
        path={NAV_PATHS.LOGIN_USER}
      >
        <SearchPatientView
          searchPatientsApiCall={searchPatient}
          useStore={useStore}
          logoutUser={IS_PRODUCTION ? logoutUser : mockLogoutUser}
        />
      </RequireAuth>
    ),
  },
  {
    path: NAV_PATHS.REGISTER_USER,
    element: <RegisterView registerUser={IS_PRODUCTION ? registerUser : mockRegisterUser} />,
  },
  {
    path: NAV_PATHS.LOGIN_USER,
    element: <LoginView loginUser={IS_PRODUCTION ? signInUser : mockSingInUser} />,
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
      {
        path: UPDATE_PATIENT_NAV_PATHS.NONPATHOLOGICAL_HISTORY,
        element: nonPathologicalHistoryView,
      },
      // TODO: Add more routes...
    ],
  },
];
