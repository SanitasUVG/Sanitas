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
	getAppointment,
	searchPatient,
	submitPatientData,
	updateCollaboratorInformation,
	updateFamilyHistory,
	updateGeneralPatientInformation,
	updateNonPathologicalHistory,
	updateStudentNonPathologicalHistory,
	updatePersonalHistory,
	updateStudentPatientInformation,
	updateSurgicalHistory,
	updateStudentSurgicalHistory,
	updateTraumatologicalHistory,
	updateAllergicHistory,
	updateAppointment,
	updateStudentAllergicHistory,
	updateStudentPersonalHistory,
	updateStudentFamilyHistory,
	updateGynecologicalHistory,
	getPsichiatricHistory,
	updatePsichiatricHistory,
	updateStudentPsychiatricHistory,
	updateStudentTraumatologicalHistory,
	getRole,
	linkAccountToPatient,
	getLinkedPatient,
	getMedicalHistoryMetadata,
	patientUpdateGeneralInformation,
	patientUpdateStudentInformation,
	patientUpdateCollaboratorInformation,
	updateStudentGynecologialHistory,
	exportData,
	patientCreatePatientAPI,
} from "./dataLayer.mjs";
import { createEmptyStore } from "./store.mjs";
import { AddPatientView } from "./views/AddPatientView";
import { FamiliarHistory } from "./views/History/Familiar";
import { NonPathologicalHistory } from "./views/History/NonPathological";
import { PersonalHistory } from "./views/History/Personal";
import { SurgicalHistory } from "./views/History/Surgical";
import { StudentSurgicalHistory } from "./views/History/Students/StudentSurgical";
import { StudentTraumatologicalHistory } from "./views/History/Students/StudentTraumatological";
import LoginView from "./views/LoginView";
import RegisterView from "./views/RegisterView";
import SearchPatientView from "./views/SearchPatientView";
import UpdateInfoView from "./views/UpdateGeneralInformationView";
import { TraumatologicHistory } from "./views/History/Traumatological";
import { AllergicHistory } from "./views/History/Allergic";
import { StudentAllergicHistory } from "./views/History/Students/StudentAllergic";
import { StudentPersonalHistory } from "./views/History/Students/StudentPersonal";
import { StudentFamiliarHistory } from "./views/History/Students/StudentFamiliar";
import { ObGynHistory } from "./views/History/ObGyn";
import { PsichiatricHistory } from "./views/History/Psichiatric";
import { StudentPsichiatricHistory } from "./views/History/Students/StudentPsichiatric";
import StudentWelcomeView from "./views/StudentWelcomeView";
import { LinkPatientView } from "./views/LinkPatientView";
import { StudentNonPathologicalHistory } from "./views/History/Students/StudentNonPathological";
import UpdatePatientGeneralInformationView from "./views/UpdatePatientGeneralInformationView";
import { StudentObGynHistory } from "./views/History/Students/StudentObGyn";
import { ExportDataView } from "./views/ExportDataView";
import { StudentAppointments } from "./views/Appointments";
import { CreatePatientView } from "./views/CreatePatientView";

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
	EXPORT_DATA: "/export",
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
	APPOINTMENT_INFORMATION: "appointment",
};

export const PATIENT_FORM_NAV_PATHS = {
	STUDENT_SURGICAL_HISTORY: "student-surgical",
	STUDENT_ALLERGIC_HISTORY: "student-allergic",
	STUDENT_NON_PATHOLOGICAL_HISTORY: "student-non-pathological",
	STUDENT_PERSONAL_HISTORY: "student-personal",
	STUDENT_PSICHIATRIC_HISTORY: "student-psichiatric",
	STUDENT_GENERAL: "student-general",
	STUDENT_OBGYN_HISTORY: "student-obgyn",
	STUDENT_TRAUMATOLOGICAL_HISTORY: "student-traumatological",
	STUDENT_FAMILIAR_HISTORY: "student-familiar",
};

/**@type {import("./components/DashboardSidebar").DashboardSidebarProps} */
export const DEFAULT_DASHBOARD_SIDEBAR_PROPS = {
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
	navigateToAppointments: (navigate) => {
		navigate(
			`${NAV_PATHS.UPDATE_PATIENT}/${UPDATE_PATIENT_NAV_PATHS.APPOINTMENT_INFORMATION}`,
		);
	},
	getMedicalHistoryMetadata,
	useStore,
	// TODO: Add other Navigation routes...
};

/**@type {import("./components/DashboardSidebar").DashboardSidebarProps} */
export const STUDENT_DASHBOARD_SIDEBAR_PROPS = {
	navigateToGeneralStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_GENERAL}`,
		);
	},
	navigateToSurgicalStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_SURGICAL_HISTORY}`,
		);
	},
	navigateToTraumatologicalStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_TRAUMATOLOGICAL_HISTORY}`,
		);
	},
	navigateToFamiliarStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_FAMILIAR_HISTORY}`,
		);
	},
	navigateToPersonalStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_PERSONAL_HISTORY}`,
		);
	},
	navigateToNonPathologicalStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_NON_PATHOLOGICAL_HISTORY}`,
		);
	},
	navigateToAllergiesStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_ALLERGIC_HISTORY}`,
		);
	},
	navigateToPsiquiatricStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_PSICHIATRIC_HISTORY}`,
		);
	},
	navigateToObstetricsStudent: () => (navigate) => {
		navigate(
			`${NAV_PATHS.PATIENT_FORM}/${PATIENT_FORM_NAV_PATHS.STUDENT_OBGYN_HISTORY}`,
		);
	},
	useStore: useStore,
};

const exportDataView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
		useStore={useStore}
	>
		<ExportDataView
			exportData={exportData}
			logoutUser={IS_PRODUCTION ? logoutUser : mockLogoutUser}
		/>
	</RequireAuth>
);

const updateInfoView = (
	<RequireAuth
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
		useStore={useStore}
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
		useStore={useStore}
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
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentSurgicalHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getStudentSurgicalHistory={getSurgicalHistory}
			updateStudentSurgicalHistory={updateStudentSurgicalHistory}
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const studentGeneralInformation = (
	<RequireAuth
		useStore={useStore}
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
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
			logoutUser={IS_PRODUCTION ? logoutUser : mockLogoutUser}
		/>
	</RequireAuth>
);

const traumatologicalHistoryView = (
	<RequireAuth
		useStore={useStore}
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
		useStore={useStore}
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

const studentFamiliarHistoryView = (
	<RequireAuth
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentFamiliarHistory
			getStudentFamilyHistory={getFamilyHistory}
			updateStudentFamilyHistory={updateStudentFamilyHistory}
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const personalHistoryView = (
	<RequireAuth
		useStore={useStore}
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

const studentPersonalHistoryView = (
	<RequireAuth
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentPersonalHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getStudentPersonalHistory={getPersonalHistory}
			updateStudentPersonalHistory={updateStudentPersonalHistory}
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const nonPathologicalHistoryView = (
	<RequireAuth
		useStore={useStore}
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

const studentNonPathologicalHistoryView = (
	<RequireAuth
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentNonPathologicalHistory
			getNonPathologicalHistory={getNonPathologicalHistory}
			getBloodTypePatientInfo={getGeneralPatientInformation}
			updateStudentNonPathologicalHistory={updateStudentNonPathologicalHistory}
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const allergicHistoryView = (
	<RequireAuth
		useStore={useStore}
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
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentAllergicHistory
			getStudentAllergicHistory={getAllergicHistory}
			updateStudentAllergicHistory={updateStudentAllergicHistory}
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const psichiatricHistoryView = (
	<RequireAuth
		useStore={useStore}
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
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentPsichiatricHistory
			getPsichiatricHistory={getPsichiatricHistory}
			updateStudentPsychiatricHistory={updateStudentPsychiatricHistory}
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const studentObGynHistoryView = (
	<RequireAuth
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentObGynHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getObGynHistory={getGynecologicalHistory}
			updateObGynHistory={updateStudentGynecologialHistory}
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const studentTraumatologicalHistoryView = (
	<RequireAuth
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentTraumatologicalHistory
			getBirthdayPatientInfo={getGeneralPatientInformation}
			getTraumatologicHistory={getTraumatologicalHistory}
			updateTraumatologicalHistory={updateStudentTraumatologicalHistory}
			sidebarConfig={STUDENT_DASHBOARD_SIDEBAR_PROPS}
			useStore={useStore}
		/>
	</RequireAuth>
);

const obgynHistoryView = (
	<RequireAuth
		useStore={useStore}
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

const appointmentView = (
	<RequireAuth
		useStore={useStore}
		getSession={IS_PRODUCTION ? getSession : mockGetSession}
		path={NAV_PATHS.LOGIN_USER}
	>
		<StudentAppointments
			getAppointment={getAppointment}
			updateAppointment={updateAppointment}
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
				useStore={useStore}
				getSession={IS_PRODUCTION ? getSession : mockGetSession}
				path={NAV_PATHS.LOGIN_USER}
			>
				<SearchPatientView
					searchPatientsApiCall={searchPatient}
					useStore={useStore}
					logoutUser={IS_PRODUCTION ? logoutUser : mockLogoutUser}
					getRole={getRole}
					getLinkedPatient={getLinkedPatient}
					exportData={exportData}
				/>
			</RequireAuth>
		),
	},
	{
		path: NAV_PATHS.EXPORT_DATA,
		element: exportDataView,
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
				submitPatientData={patientCreatePatientAPI}
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
			{
				path: UPDATE_PATIENT_NAV_PATHS.APPOINTMENT_INFORMATION,
				element: appointmentView,
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
				element: studentGeneralInformation,
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
				path: PATIENT_FORM_NAV_PATHS.STUDENT_NON_PATHOLOGICAL_HISTORY,
				element: studentNonPathologicalHistoryView,
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
			{
				path: PATIENT_FORM_NAV_PATHS.STUDENT_OBGYN_HISTORY,
				element: studentObGynHistoryView,
			},
			{
				path: PATIENT_FORM_NAV_PATHS.STUDENT_TRAUMATOLOGICAL_HISTORY,
				element: studentTraumatologicalHistoryView,
			},
			{
				path: PATIENT_FORM_NAV_PATHS.STUDENT_FAMILIAR_HISTORY,
				element: studentFamiliarHistoryView,
			},
			// TODO: Add more routes...
		],
	},
];
