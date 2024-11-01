import { Suspense, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput, DateInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import { formatDate } from "src/utils/date";
import WrapPromise from "src/utils/promiseWrapper";
import Collapsable from "src/components/Collapsable";
import StudentDashboardTopbar from "src/components/StudentDashboardTopBar";
import { createRefreshSignal } from "src/utils/refreshHook";
import useWindowSize from "src/utils/useWindowSize";
import BaseButton from "src/components/Button/Base";
import IconButton from "src/components/Button/Icon";
import logoutIcon from "@tabler/icons/outline/door-exit.svg";

/**
 * Checks if the given property exists and is not a null value inside the object.
 * @param {*} object - The object that should have the property
 * @param {string} property - The property to check inside the object
 * @returns {boolean} True if it exists and is not null, false otherwise.
 */
const hasPropertyAndIsValid = (object, property) => {
	if (object === null || object === undefined) {
		return false;
	}

	return Object.hasOwn(object, property) && object[property] !== null;
};

/**
 * @typedef {Object} PatientInfo
 * @property {number} id
 * @property {string} nombres
 * @property {string} apellidos
 * @property {boolean} isWoman
 * @property {string|null} email
 * @property {string|null} contactName1
 * @property {string|null} contactKinship1
 * @property {string|null} contactPhone1
 * @property {string|null} contactName2
 * @property {string|null} contactKinship2
 * @property {string|null} contactPhone2
 * @property {string|null} bloodType
 * @property {string|null} address
 * @property {string | undefined} insurance
 * @property {string} birthdate
 * @property {string|null} phone
 */

/**
 * @typedef {Object} UpdatePatientViewProps
 * @property {import("src/dataLayer.mjs").GetGeneralPatientInformationAPICall} getGeneralPatientInformation
 * @property {import("src/dataLayer.mjs").updateGeneralPatientInformation} updateGeneralPatientInformation
 * @property {import("src/store.mjs").UseStoreHook} useStore
 * @property {import("src/dataLayer.mjs").UpdateStudentPatientInformationAPICall} updateStudentPatientInformation
 * @property {import("src/dataLayer.mjs").GetStudentPatientInformationAPICall} getStudentPatientInformation
 * @property {import("src/dataLayer.mjs").GetCollaboratorPatientInformationAPICall} getCollaboratorInformation
 * @property {import("src/dataLayer.mjs").UpdateCollaboratorPatientInformationAPICall} updateCollaboratorInformation
 */

/**
 * @param {UpdatePatientViewProps} props
 */
export default function UpdatePatientInfoView({
	getGeneralPatientInformation,
	updateGeneralPatientInformation,
	useStore,
	sidebarConfig,
	getStudentPatientInformation,
	updateStudentPatientInformation,
	getCollaboratorInformation,
	updateCollaboratorInformation,
}) {
	const navigate = useNavigate();

	const setIsWoman = useStore((s) => s.setIsWoman);
	const id = useStore((s) => s.selectedPatientId);
	// const id = 1;
	const [refreshSignal, triggerRefresh] = createRefreshSignal();
	// biome-ignore lint/correctness/useExhaustiveDependencies: We need the refresh signal to refresh the resources.
	const [generalResource, collaboratorResource, studentResource] = useMemo(
		() =>
			[
				getGeneralPatientInformation(id),
				getCollaboratorInformation(id),
				getStudentPatientInformation(id),
			].map((s) => WrapPromise(s)),
		[
			getGeneralPatientInformation,
			getCollaboratorInformation,
			getStudentPatientInformation,
			id,
			refreshSignal,
		],
	);

	const { width } = useWindowSize();
	const isMobile = width < 768;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				padding: "2rem",
				gap: "1rem",
				background: colors.primaryBackground,
				minHeight: "100vh",
				maxWidth: isMobile ? "100%" : "100%",
			}}
		>
			<div
				style={{
					width: "100%",
					height: "fit-content",
				}}
			>
				<StudentDashboardTopbar
					{...sidebarConfig}
					activeSectionProp="general"
				/>
			</div>

			<div
				style={{
					overflowY: "scroll",
					background: colors.secondaryBackground,
					borderRadius: "0.625rem",
					width: "100%",
					padding: isMobile ? "1rem" : "1rem 6rem",
					flexGrow: 1,
				}}
			>
				<div style={{ display: "flex", justifyContent: "flex-end" }}>
					<IconButton
						icon={logoutIcon}
						onClick={() => {
							sidebarConfig.logoutUser();
							sidebarConfig.navigateToLogin()(navigate);
						}}
					/>
				</div>
				<Suspense
					fallback={<Throbber loadingMessage="Cargando datos de paciente..." />}
				>
					<h1
						style={{
							color: colors.titleText,
							fontFamily: fonts.titleFont,
							fontSize: fontSize.titleSize,
							textAlign: "center",
							padding: "0 0 0.8rem 0",
							marginTop: isMobile ? "0rem" : "-3.15rem", //La scrum master me dijo que lo pusiera así
						}}
					>
						Datos Generales
					</h1>
					<p
						style={{
							fontFamily: fonts.textFont,
							fontSize: fontSize.subtitleSize,
							textAlign: "center",
							padding: isMobile ? "0 1rem" : "0 20%",
						}}
					>
						Por favor, ayúdanos completando la siguiente información para poder
						conocerte mejor y brindarte la atención que mereces.
					</p>
					<div
						style={{
							display: isMobile ? "block" : "grid",
							gap: isMobile ? "1rem" : "0",
						}}
					>
						<UpdateGeneralInformationSection
							getData={generalResource}
							updateData={updateGeneralPatientInformation}
							triggerRefresh={triggerRefresh}
							setIsWoman={setIsWoman}
							isMobile={isMobile} // Pasar la prop isMobile
						/>
						<UpdateColaboratorInformationSection
							getData={collaboratorResource}
							updateData={updateCollaboratorInformation}
							triggerRefresh={triggerRefresh}
							isMobile={isMobile} // Pasar la prop isMobile
						/>
						<UpdateStudentInformationSection
							getData={studentResource}
							updateData={updateStudentPatientInformation}
							triggerRefresh={triggerRefresh}
							isMobile={isMobile} // Pasar la prop isMobile
						/>
					</div>
				</Suspense>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} UpdateColaboratorInformationSectionProps
 * @property {import("src/utils/promiseWrapper").SuspenseResource<*>} getData
 * @property {import("src/dataLayer.mjs").UpdateCollaboratorPatientInformationAPICall} updateData
 * @property {import("src/utils/refreshHook").TriggerRefreshSignalCallback} triggerRefresh
 */

/**
 * @param {UpdateColaboratorInformationSectionProps} props
 */
function UpdateColaboratorInformationSection({
	getData,
	updateData,
	triggerRefresh,
	isMobile,
}) {
	const styles = {
		form: {
			padding: "3rem 2rem",
			borderBottom: "1px solid #ddd",
		},
		label: {
			fontSize: fontSize.textSize,
			fontFamily: fonts.textFont,
		},
		SexInput: {
			display: "flex",
			padding: "10px",
			gap: "20px",
		},
		button: {
			display: "inline-block",
			padding: "10px 20px",
			fontSize: "16px",
			color: "#fff",
			backgroundColor: "#4CAF50",
			border: "none",
			borderRadius: "4px",
			cursor: "pointer",
			gridColumn: "1 / span 2",
		},
		h1: {
			gridColumn: "1 / span 2",
			fontSize: fontSize.subtitleSize,
		},
		h2: {
			gridColumn: "1 / span 2",
			fontSize: fontSize.subtitleSize,
			fontFamily: fonts.titleFont,
			// borderTop: `0.1rem solid ${colors.darkerGrey}`,
			paddingTop: "2rem",
		},
		firstsectionform: {
			gridTemplateColumns: "50% 50%",
			display: "grid",
			gap: "20px",
			paddingTop: "10px",
		},
		Secondsectionform: {
			display: "grid",
			gap: "20px",
			paddingTop: "10px",
		},
		input: {
			maxWidth: "18.75rem",
		},
	};

	/**@type {React.CSSProperties} */
	const inputStyles = {
		width: isMobile ? "100%" : "90%",
		height: "3rem",
	};

	const response = getData.read();
	const responseFromGET = response?.result;

	const [patientData, setPatientData] = useState({
		...(response?.result || {}),
	});
	const handleUpdatePatient = async () => {
		toast.info("Actualizando datos de colaborador...");

		const updateResponse = await updateData(patientData);
		if (updateResponse.error) {
			toast.error(
				`Lo sentimos! Ha ocurrido un error al actualizar los datos!\n${updateResponse.error.message}`,
			);
			return;
		}

		triggerRefresh();
		setPatientData(updateResponse.result || {});
		toast.success("¡Información actualizada exitosamente!");
	};

	return (
		<form style={styles.form}>
			<div
				style={{
					display: "flex",
					flexDirection: isMobile ? "column" : "row",
					justifyContent: isMobile ? "center" : "space-between",
					alignItems: "center",
					paddingRight: "1rem",
				}}
			>
				<h1 style={styles.h1}>Datos de Colaborador:</h1>
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: isMobile ? "1fr" : "50% 50%",
					gap: "1rem",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: ".5rem",
						paddingRight: isMobile ? "0" : "1rem",
					}}
				>
					<label style={styles.label}>Código:</label>
					<BaseInput
						type="text"
						value={patientData.code}
						onChange={(e) =>
							setPatientData({ ...patientData, code: e.target.value })
						}
						placeholder="Código"
						style={inputStyles}
						disabled={hasPropertyAndIsValid(responseFromGET, "code")}
					/>
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: ".5rem",
						paddingLeft: isMobile ? "0" : "1rem",
					}}
				>
					<label style={styles.label}>Área:</label>
					<BaseInput
						type="text"
						value={patientData.area}
						onChange={(e) =>
							setPatientData({ ...patientData, area: e.target.value })
						}
						placeholder="Área"
						style={inputStyles}
						maxLength={100}
					/>
				</div>
			</div>
			<div
				style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
			>
				<BaseButton
					text="Guardar"
					onClick={handleUpdatePatient}
					style={{ width: isMobile ? "100%" : "15rem", height: "3rem" }}
				/>
			</div>
		</form>
	);
}

/**
 * @typedef {Object} UpdateGeneralInformationSectionProps
 * @property {import("src/utils/promiseWrapper").SuspenseResource<*>} getData
 * @property {import("src/dataLayer.mjs").UpdateGeneralPatientInformationAPICall} updateData
 * @property {import("src/utils/refreshHook").TriggerRefreshSignalCallback} triggerRefresh
 */

/**
 * @param {UpdateGeneralInformationSectionProps} props
 * @returns {JSX.Element}
 */
// biome-ignore  lint/complexity/noExcessiveCognitiveComplexity: In the future we should probably make it simpler...
function UpdateGeneralInformationSection({
	getData,
	updateData,
	triggerRefresh,
	setIsWoman,
	isMobile,
}) {
	const dropdownOptions = [
		{ value: "", label: "Selecciona un tipo de sangre" },
		{ value: "A+", label: "A+" },
		{ value: "A-", label: "A-" },
		{ value: "B+", label: "B+" },
		{ value: "B-", label: "B-" },
		{ value: "AB+", label: "AB+" },
		{ value: "AB-", label: "AB-" },
		{ value: "O+", label: "O+" },
		{ value: "O-", label: "O-" },
	];

	const styles = {
		form: {
			padding: "2rem",
			border: "1px solid #ddd",
			borderRadius: "5px",
		},
		label: {
			fontSize: fontSize.textSize,
			fontFamily: fonts.textFont,
		},
		SexInput: {
			display: "flex",
			padding: "10px",
			gap: "20px",
		},
		button: {
			display: "inline-block",
			padding: "10px 20px",
			fontSize: "16px",
			color: "#fff",
			backgroundColor: "#4CAF50",
			border: "none",
			borderRadius: "4px",
			cursor: "pointer",
			gridColumn: "1 / span 2",
		},
		h1: {
			gridColumn: "1 / span 2",
			fontSize: fontSize.subtitleSize,
		},
		h2: {
			gridColumn: "1 / span 2",
			fontSize: fontSize.subtitleSize,
			fontFamily: fonts.titleFont,
			// borderTop: `0.1rem solid ${colors.darkerGrey}`,
			paddingTop: "2rem",
		},
		firstsectionform: {
			gridTemplateColumns: "50% 50%",
			display: "grid",
			gap: "20px",
			paddingTop: "10px",
		},
		input: {
			maxWidth: "18.75rem",
		},
	};

	/** @type {React.CSSProperties} */
	const collapsableInnerStyle = {
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
		padding: "1rem",
		border: `.1rem solid ${colors.primaryBackground}`,
		borderRadius: "0 0 5% 5%",
		transform: "translateY(-1%)",
		width: isMobile ? "100%" : "30vw",
	};

	const response = getData.read();
	/** @returns {PatientInfo}*/
	const getResponseFromGET = () => ({
		...response.result,
		birthdate: formatDate(response.result?.birthdate),
	});
	const responseFromGET = getResponseFromGET();

	/** @type {[PatientInfo, (data: PatientInfo) => void]} */
	const [patientData, setPatientData] = useState(getResponseFromGET());

	useEffect(() => {
		setIsWoman(patientData.isWoman);
	}, [patientData, setIsWoman]);

	if (response.error) {
		return (
			<div style={{ padding: "2rem" }}>
				<h1 style={styles.h1}>
					Error al buscar el paciente. Asegúrese de que el ID es correcto.
				</h1>
				<p>{response.error.toString()}</p>
			</div>
		);
	}

	const handleUpdatePatient = async () => {
		if (patientData.cui.length !== 13) {
			toast.info("El CUI debe contener exactamente 13 dígitos.");
			return;
		}

		toast.info("Actualizando datos generales...");

		const updateResponse = await updateData(patientData);
		if (updateResponse.error) {
			toast.error(
				`Lo sentimos! Ha ocurrido un error al actualizar los datos!\n${updateResponse.error.message}`,
			);
			setPatientData(getResponseFromGET());
			return;
		}

		const getUpdatedResponse = () => ({
			...updateResponse.result,
			birthdate: formatDate(updateResponse.result?.birthdate),
		});

		triggerRefresh();
		setPatientData(getUpdatedResponse());
		toast.success("¡Información actualizada exitosamente!");
	};

	/**@type {React.CSSProperties} */
	const inputContainerStyles = {
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
	};
	/**@type {React.CSSProperties} */
	const inputStyles = {
		height: "3rem",
		width: isMobile ? "100%" : "90%",
	};
	/**@type {React.CSSProperties} */
	const columnStyles = {
		padding: "1rem",
		display: "flex",
		flexDirection: "column",
		gap: "1.5rem",
	};

	return (
		<div style={{ padding: "2rem", borderBottom: "1px solid #ddd" }}>
			{/* HEADER */}
			<div
				style={{
					display: "flex",
					flexDirection: isMobile ? "column" : "row",
					justifyContent: isMobile ? "center" : "space-between",
					alignItems: "center",
				}}
			>
				<h2 style={styles.h1}>Información del paciente:</h2>
			</div>

			{/* BODY */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: isMobile ? "1fr" : "50% 50%",
					gap: "1.5rem",
					padding: isMobile ? "0" : "0 1rem",
				}}
			>
				{/* FIRST COLUMN*/}
				<div style={{ ...columnStyles, paddingLeft: "0", paddingRight: "0" }}>
					<div style={inputContainerStyles}>
						<label style={styles.label}>Nombres:</label>
						<BaseInput
							type="text"
							value={patientData.names}
							onChange={(e) =>
								setPatientData({ ...patientData, names: e.target.value })
							}
							placeholder="Nombres"
							style={inputStyles}
							disabled={true}
						/>
					</div>

					<div style={inputContainerStyles}>
						<label style={styles.label}>CUI:</label>
						<BaseInput
							type="text"
							value={patientData.cui}
							onChange={(e) =>
								setPatientData({ ...patientData, cui: e.target.value })
							}
							placeholder="CUI"
							style={inputStyles}
							disabled={true}
						/>
					</div>

					<div style={inputContainerStyles}>
						<label style={styles.label}>Sexo:</label>
						<div style={{ display: "flex", gap: "2rem", height: "3rem" }}>
							<RadioInput
								type="radio"
								name="gender"
								value="female"
								label="Femenino"
								checked={patientData.isWoman}
								onChange={() =>
									setPatientData({ ...patientData, isWoman: true })
								}
								disabled={true}
							/>
							<RadioInput
								type="radio"
								name="gender"
								value="male"
								label="Masculino"
								checked={!patientData.isWoman}
								onChange={() =>
									setPatientData({ ...patientData, isWoman: false })
								}
								disabled={true}
							/>
						</div>
					</div>

					<div style={inputContainerStyles}>
						<label style={styles.label}>Fecha de nacimiento:</label>
						<DateInput
							value={patientData.birthdate}
							readOnly={() =>
								hasPropertyAndIsValid(responseFromGET, "birthdate")
							}
							onChange={(e) =>
								setPatientData({ ...patientData, birthdate: e.target.value })
							}
							style={inputStyles}
							disabled={true}
						/>
					</div>

					<div style={inputContainerStyles}>
						<label style={styles.label}>Tipo de sangre:</label>
						<DropdownMenu
							options={dropdownOptions}
							value={patientData.bloodType}
							onChange={(e) =>
								setPatientData({ ...patientData, bloodType: e.target.value })
							}
							style={{
								container: { width: isMobile ? "100%" : "90%" },
								select: { height: "3rem" },
							}}
							disabled={hasPropertyAndIsValid(responseFromGET, "bloodType")}
						/>
					</div>
				</div>

				{/* SECOND COLUMN*/}
				<div style={{ ...columnStyles, paddingLeft: "0", paddingRight: "0" }}>
					<div style={inputContainerStyles}>
						<label style={styles.label}>Apellidos:</label>
						<BaseInput
							type="text"
							value={patientData.lastNames}
							onChange={(e) =>
								setPatientData({ ...patientData, lastNames: e.target.value })
							}
							style={inputStyles}
							disabled={true}
						/>
					</div>

					<div style={inputContainerStyles}>
						<label style={styles.label}>Email:</label>
						<BaseInput
							type="email"
							value={patientData.email || ""}
							onChange={(e) =>
								setPatientData({ ...patientData, email: e.target.value })
							}
							style={inputStyles}
							disabled={hasPropertyAndIsValid(responseFromGET, "email")}
						/>
					</div>

					<div style={inputContainerStyles}>
						<label style={styles.label}>Teléfono:</label>
						<BaseInput
							type="text"
							value={patientData.phone || ""}
							onChange={(e) =>
								setPatientData({ ...patientData, phone: e.target.value })
							}
							style={inputStyles}
							placeholder="Teléfono"
						/>
					</div>

					<div style={inputContainerStyles}>
						<label style={styles.label}>Dirección:</label>
						<BaseInput
							type="text"
							value={patientData.address || ""}
							onChange={(e) =>
								setPatientData({ ...patientData, address: e.target.value })
							}
							style={inputStyles}
							placeholder="Dirección"
						/>
					</div>

					<div style={inputContainerStyles}>
						<label style={styles.label}>Seguro:</label>
						<BaseInput
							type="text"
							value={patientData.insurance || ""}
							onChange={(e) =>
								setPatientData({ ...patientData, insurance: e.target.value })
							}
							style={inputStyles}
							placeholder="Seguro"
						/>
					</div>
				</div>
			</div>

			<div>
				<h2 style={styles.h2}>Contactos del paciente:</h2>
				<div
					style={{
						display: "flex",
						flexDirection: isMobile ? "column" : "row",
						gap: "2rem",
						width: "100%",
						paddingTop: "2rem",
					}}
				>
					<Collapsable title="Contacto 1" isCollapsed={false}>
						<div style={collapsableInnerStyle}>
							<label style={styles.label}>Nombre de contacto:</label>
							<BaseInput
								type="text"
								value={patientData.contactName1 || ""}
								onChange={(e) =>
									setPatientData({
										...patientData,
										contactName1: e.target.value,
									})
								}
								style={inputStyles}
								disabled={hasPropertyAndIsValid(
									responseFromGET,
									"contactName1",
								)}
								placeholder="Nombre de contacto"
							/>

							<label style={styles.label}>Parentesco de contacto:</label>
							<BaseInput
								type="text"
								value={patientData.contactKinship1 || ""}
								onChange={(e) =>
									setPatientData({
										...patientData,
										contactKinship1: e.target.value,
									})
								}
								style={inputStyles}
								disabled={hasPropertyAndIsValid(
									responseFromGET,
									"contactKinship1",
								)}
								placeholder="Parentesco de contacto"
							/>

							<label style={styles.label}>Teléfono de contacto:</label>
							<BaseInput
								type="text"
								value={patientData.contactPhone1 || ""}
								onChange={(e) =>
									setPatientData({
										...patientData,
										contactPhone1: e.target.value,
									})
								}
								style={inputStyles}
								disabled={hasPropertyAndIsValid(
									responseFromGET,
									"contactPhone1",
								)}
								placeholder="Teléfono de contacto"
							/>
						</div>
					</Collapsable>

					<Collapsable title="Contacto 2" isCollapsed={false}>
						<div style={collapsableInnerStyle}>
							<label style={styles.label}>Nombre de contacto:</label>
							<BaseInput
								type="text"
								value={patientData.contactName2 || ""}
								onChange={(e) =>
									setPatientData({
										...patientData,
										contactName2: e.target.value,
									})
								}
								style={inputStyles}
								disabled={hasPropertyAndIsValid(
									responseFromGET,
									"contactName2",
								)}
								placeholder="Nombre de contacto"
							/>

							<label style={styles.label}>Parentesco de contacto:</label>
							<BaseInput
								type="text"
								value={patientData.contactKinship2 || ""}
								onChange={(e) =>
									setPatientData({
										...patientData,
										contactKinship2: e.target.value,
									})
								}
								style={inputStyles}
								disabled={hasPropertyAndIsValid(
									responseFromGET,
									"contactKinship2",
								)}
								placeholder="Parentesco de contacto"
							/>

							<label style={styles.label}>Teléfono de contacto:</label>
							<BaseInput
								type="text"
								value={patientData.contactPhone2 || ""}
								onChange={(e) =>
									setPatientData({
										...patientData,
										contactPhone2: e.target.value,
									})
								}
								style={inputStyles}
								disabled={hasPropertyAndIsValid(
									responseFromGET,
									"contactPhone2",
								)}
								placeholder="Teléfono de contacto"
							/>
						</div>
					</Collapsable>
				</div>
			</div>

			<div style={{ display: "flex", justifyContent: "center" }}>
				<BaseButton
					text="Guardar"
					onClick={handleUpdatePatient}
					style={{
						width: isMobile ? "100%" : "15rem",
						height: "3rem",
						marginTop: "1rem",
					}}
				/>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} UpdateStudentInformationSectionProps
 * @property {import("src/utils/promiseWrapper").SuspenseResource <*>} getData
 * @property {import("src/dataLayer.mjs").UpdateStudentPatientInformationAPICall} updateData
 * @property {import("src/utils/refreshHook").TriggerRefreshSignalCallback} triggerRefresh
 */

/**
 * @param {UpdateStudentInformationSectionProps} props
 */
function UpdateStudentInformationSection({
	getData,
	updateData,
	triggerRefresh,
	isMobile,
}) {
	const styles = {
		form: {
			padding: "3rem 2rem",
			borderRadius: "5px",
		},
		label: {
			fontSize: fontSize.textSize,
			fontFamily: fonts.textFont,
		},
		button: {
			display: "inline-block",
			padding: "10px 20px",
			fontSize: "16px",
			color: "#fff",
			backgroundColor: "#4CAF50",
			border: "none",
			borderRadius: "4px",
			cursor: "pointer",
			gridColumn: "1 / span 2",
		},
		h1: {
			gridColumn: "1 / span 2",
			fontSize: fontSize.subtitleSize,
		},
		firstsectionform: {
			gridTemplateColumns: "50% 50%",
			display: "grid",
			gap: "20px",
			paddingTop: "10px",
		},
	};

	// Fetch the student information
	const response = getData.read();
	const responseFromGET = response?.result;

	const [patientData, setPatientData] = useState({
		...(response?.result || {}),
	});
	const handleUpdatePatient = async () => {
		toast.info("Actualizando datos de estudiante...");

		const updateResponse = await updateData(patientData);
		if (updateResponse.error) {
			toast.error(
				`Lo sentimos! Ha ocurrido un error al actualizar los datos!\n${updateResponse.error.message}`,
			);
			return;
		}

		triggerRefresh();
		setPatientData(updateResponse.result || {});
		toast.success("¡Información actualizada exitosamente!");
	};

	/**@type {React.CSSProperties} */
	const inputStyles = {
		width: isMobile ? "100%" : "90%",
		height: "3rem",
	};

	return (
		<form style={styles.form}>
			<div
				style={{
					display: "flex",
					flexDirection: isMobile ? "column" : "row",
					justifyContent: isMobile ? "center" : "space-between",
					alignItems: "center",
					paddingRight: "1rem",
				}}
			>
				<h1 style={styles.h1}>Datos de Estudiante:</h1>
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: isMobile ? "1fr" : "50% 50%",
					gap: "1rem",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						paddingRight: isMobile ? "0" : "1rem",
						gap: ".5rem",
					}}
				>
					<label style={styles.label}>Carnet:</label>
					<BaseInput
						type="text"
						value={patientData.carnet}
						onChange={(e) =>
							setPatientData({ ...patientData, carnet: e.target.value })
						}
						placeholder="Carnet"
						style={inputStyles}
						disabled={hasPropertyAndIsValid(responseFromGET, "carnet")}
					/>
				</div>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						paddingLeft: isMobile ? "0" : "1rem",
						gap: ".5rem",
					}}
				>
					<label style={styles.label}>Carrera:</label>
					<BaseInput
						type="text"
						value={patientData.career}
						onChange={(e) =>
							setPatientData({ ...patientData, career: e.target.value })
						}
						placeholder="Carrera"
						style={inputStyles}
						maxLength={100}
					/>
				</div>
			</div>
			<div
				style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
			>
				<BaseButton
					text="Guardar"
					onClick={handleUpdatePatient}
					style={{ width: isMobile ? "100%" : "15rem", height: "3rem" }}
				/>
			</div>
		</form>
	);
}
