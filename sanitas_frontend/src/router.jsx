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
	updateStudentSurgicalHistory,
	updateTraumatologicalHistory,
	updateAllergicHistory,
	updateStudentAllergicHistory,
	updateStudentPersonalHistory,
	updateGynecologicalHistory,
	getPsichiatricHistory,
	updatePsichiatricHistory,
	updateStudentPsychiatricHistory,
	getRole,
	linkAccountToPatient,
	getLinkedPatient,
	getMedicalHistoryMetadata,
	patientUpdateGeneralInformation,
	patientUpdateStudentInformation,
	patientUpdateCollaboratorInformation,
} from "./dataLayer.mjs";
import { createEmptyStore } from "./store.mjs";
import { AddPatientView } from "./views/AddPatientView";
import { FamiliarHistory } from "./views/History/Familiar";
import { NonPathologicalHistory } from "./views/History/NonPathological";
import { PersonalHistory } from "./views/History/Personal";
import { SurgicalHistory } from "./views/History/Surgical";
import { StudentSurgicalHistory } from "./views/History/Students/StudentSurgical";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateGeneralInformationView";
import { TraumatologicHistory } from "./views/History/Traumatological";
import { AllergicHistory } from "./views/History/Allergic";
import { StudentAllergicHistory } from "./views/History/Students/StudentAllergic";
import { StudentPersonalHistory } from "./views/History/Students/StudentPersonal";
import { ObGynHistory } from "./views/History/ObGyn";
import { PsichiatricHistory } from "./views/History/Psichiatric";
import { StudentPsichiatricHistory } from "./views/History/Students/StudentPsichiatric";
import StudentWelcomeView from "./views/StudentWelcomeView";
import { LinkPatientView } from "./views/LinkPatientView";
import { CreatePatientView } from "./views/CreatePatientView";
import UpdatePatientGeneralInformationView from "./views/UpdatePatientGeneralInformationView";

const useStore = createEmptyStore();

export const NAV_PATHS = {
	SEARCH_PATIENT: "/",
	REGISTER_USER: "/register",
	LOGIN_USER: "/login",
	ADD_PATIENT: "/new",
	UPDATE_PATIENT: "/update",
	PATIENT_WELCOME: "/welcome",
	PATIENT_FORM: "/form",
	PATIENT_LINK: "/link",
	CREATE_PATIENT: "/create",
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
	PSICHIATRIC_HISTORY: "psichiatric",
	// TODO: Add other Navigation routes...
};

export const PATIENT_FORM_NAV_PATHS = {
	STUDENT_SURGICAL_HISTORY: "student-surgical",
	STUDENT_ALLERGIC_HISTORY: "student-allergic",
	STUDENT_PERSONAL_HISTORY: "student-personal",
	STUDENT_PSICHIATRIC_HISTORY: "student-psichiatric",
	STUDENT_GENERAL: "student-general",
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
	navigateToPsiquiatric: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.PSICHIATRIC_HISTORY}`,
		);
	},
	getMedicalHistoryMetadata,
	useStore,
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

const studentSurgicalHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentSurgicalHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getStudentSurgicalHistory={getSurgicalHistory}
			updateStudentSurgicalHistory={updateStudentSurgicalHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const studentGeneralInformation = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<UpdatePatientGeneralInformationView
			getGeneralPatientInformation={getGeneralPatientInformation}
			updateGeneralPatientInformation={patientUpdateGeneralInformation}
			getStudentPatientInformation={getStudentPatientInformation}
			updateStudentPatientInformation={patientUpdateStudentInformation}
			getCollaboratorInformation={getCollaboratorInformation}
			updateCollaboratorInformation={patientUpdateCollaboratorInformation}
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

const studentAllergicHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentAllergicHistory
			getStudentAllergicHistory={getAllergicHistory}
			updateStudentAllergicHistory={updateStudentAllergicHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const studentPersonalHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentPersonalHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getStudentPersonalHistory={getPersonalHistory}
			updateStudentPersonalHistory={updateStudentPersonalHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const psichiatricHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<PsichiatricHistory
			getPsichiatricHistory={getPsichiatricHistory}
			updatePsichiatricHistory={updatePsichiatricHistory}
			sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const studentPsichiatricHistoryView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentPsichiatricHistory
			getPsichiatricHistory={getPsichiatricHistory}
			updateStudentPsychiatricHistory={updateStudentPsychiatricHistory}
		//sidebarConfig={DEFAULT_DASHBOARD_SIDEBAR_PROPS}
		//useStore={useStore}
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
			<LoginView
				loginUser={IS_PRODUCTION ? signInUser : mockSingInUser}
				getRole={getRole}
				getLinkedPatient={getLinkedPatient}
				useStore={useStore}
			/>
		),
	},
	{
		path: NAV_PATHS.PATIENT_WELCOME,
		element: <StudentWelcomeView />,
	},
	{
		path: NAV_PATHS.PATIENT_LINK,
		element: <LinkPatientView linkAccount={linkAccountToPatient} />,
	},
	{
		path: NAV_PATHS.CREATE_PATIENT,
		element: (
			<CreatePatientView
				useStore={useStore}
				submitPatientData={submitPatientData}
				linkAccount={linkAccountToPatient}
			/>
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
			{
				path: UPDATE_PATIENT_NAV_PATHS.PSICHIATRIC_HISTORY,
				element: psichiatricHistoryView,
			},
			// TODO: Add more routes...
		],
	},
	{
		path: NAV_PATHS.PATIENT_FORM,
		element: <Outlet />,
		children: [
			{
				index: true,
				element: <h1>WIP: Here goes the patient form!</h1>,
			},
			{
				path: PATIENT_FORM_NAV_PATHS.STUDENT_SURGICAL_HISTORY,
				element: studentSurgicalHistoryView,
			},
			{
				path: PATIENT_FORM_NAV_PATHS.STUDENT_ALLERGIC_HISTORY,
				element: studentAllergicHistoryView,
			},
			{
				path: PATIENT_FORM_NAV_PATHS.STUDENT_PERSONAL_HISTORY,
				element: studentPersonalHistoryView,
			},
			{
				path: PATIENT_FORM_NAV_PATHS.STUDENT_PSICHIATRIC_HISTORY,
				element: studentPsichiatricHistoryView,
			},
			{
				path: PATIENT_FORM_NAV_PATHS.STUDENT_GENERAL,
				element: studentGeneralInformation,
			},
		],
	},
];
