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
	getPersonalHistory,
	getGeneralPatientInformation,
	getNonPathologicalHistory,
	getStudentPatientInformation,
	getSurgicalHistory,
	getTraumatologicalHistory,
	getAllergicHistory,
	getGynecologicalHistory,
	searchPatient,
	submitPatientData,
	updateCollaboratorInformation,
	updateFamilyHistory,
	updateGeneralPatientInformation,
	updateNonPathologicalHistory,
	updatePersonalHistory,
	updateStudentPatientInformation,
	updateSurgicalHistory,
	updateTraumatologicalHistory,
	updateAllergicHistory,
	updateGynecologicalHistory,
} from "./dataLayer.mjs";
import { createEmptyStore } from "./store.mjs";
import { AddPatientView } from "./views/AddPatientView";
import { FamiliarHistory } from "./views/History/Familiar";
import { NonPathologicalHistory } from "./views/History/NonPathological";
import { PersonalHistory } from "./views/History/Personal";
import { SurgicalHistory } from "./views/History/Surgical";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateGeneralInformationView";
import { TraumatologicHistory } from "./views/History/Traumatological";
import { AllergicHistory } from "./views/History/Allergic";
import { ObGynHistory } from "./views/History/ObGyn";

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
	PERSONAL_HISTORY: "personal",
	NONPATHOLOGICAL_HISTORY: "non-pathological",
	ALLERGIC_HISTORY: "allergic",
	OBGYN_HISTORY: "obgyn",
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
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.GENERAL_INFORMATION}`,
		);
	},
	navigateToSurgical: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.SURGICAL_HISTORY}`,
		);
	},
	navigateToTraumatological: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.TRAUMATOLOGICAL_HISTORY}`,
		);
	},
	navigateToFamiliar: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.FAMILIAR_HISTORY}`,
		);
	},
	navigateToPersonal: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.PERSONAL_HISTORY}`,
		);
	},
	navigateToNonPathological: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.NONPATHOLOGICAL_HISTORY}`,
		);
	},
	navigateToAllergies: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.ALLERGIC_HISTORY}`,
		);
	},
	navigateToObstetrics: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.OBGYN_HISTORY}`,
		);
	},

	// TODO: Add other Navigation routes...
};

const updateInfoView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
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
	</RequireAuth>
);

const surgicalHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<SurgicalHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getSurgicalHistory={getSurgicalHistory}
			updateSurgicalHistory={updateSurgicalHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const traumatologicalHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<TraumatologicHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getTraumatologicHistory={getTraumatologicalHistory}
			updateTraumatologicalHistory={updateTraumatologicalHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const familiarHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<FamiliarHistory
			getFamiliarHistory={getFamilyHistory}
			updateFamiliarHistory={updateFamilyHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const personalHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<PersonalHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getPersonalHistory={getPersonalHistory}
			updatePersonalHistory={updatePersonalHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const nonPathologicalHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<NonPathologicalHistory
			getNonPathologicalHistory={getNonPathologicalHistory}
			getBloodTypePatientInfo={getGeneralPatientInformation}
			updateNonPathologicalHistory={updateNonPathologicalHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const allergicHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<AllergicHistory
			getAllergicHistory={getAllergicHistory}
			updateAllergicHistory={updateAllergicHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const obgynHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<ObGynHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getObGynHistory={getGynecologicalHistory}
			updateObGynHistory={updateGynecologicalHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
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
		element: (
			<RegisterView
				registerUser={IS_PRODUCTION ? registerUser : mockRegisterUser}
			/>
		),
	},
	{
		path: NAV_PATHS.LOGIN_USER,
		element: (
			<LoginView loginUser={IS_PRODUCTION ? signInUser : mockSingInUser} />
		),
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
				path: UPDATE_PATIENT_NAV_PATHS.PERSONAL_HISTORY,
				element: personalHistoryView,
			},
			{
				path: UPDATE_PATIENT_NAV_PATHS.NONPATHOLOGICAL_HISTORY,
				element: nonPathologicalHistoryView,
			},
			{
				path: UPDATE_PATIENT_NAV_PATHS.ALLERGIC_HISTORY,
				element: allergicHistoryView,
			},
			{
				path: UPDATE_PATIENT_NAV_PATHS.OBGYN_HISTORY,
				element: obgynHistoryView,
			},
			// TODO: Add more routes...
		],
	},
];
