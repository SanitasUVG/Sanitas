import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";
import { Suspense, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import IconButton from "src/components/Button/Icon";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput, DateInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import { formatDate } from "src/utils/date";
import WrapPromise from "src/utils/promiseWrapper";
import Collapsable from "src/components/Collapsable";

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
 * @property {import("src/components/DashboardSidebar").DashboardSidebarProps} sidebarConfig - The config for the view sidebar
 * @property {import("src/store.mjs").UseStoreHook} useStore
 * @property {import("src/dataLayer.mjs").UpdateStudentPatientInformationAPICall} updateStudentPatientInformation
 * @property {import("src/dataLayer.mjs").GetStudentPatientInformationAPICall} getStudentPatientInformation
 * @property {import("src/dataLayer.mjs").GetCollaboratorPatientInformationAPICall} getCollaboratorInformation
 * @property {import("src/dataLayer.mjs").UpdateCollaboratorPatientInformationAPICall} updateCollaboratorInformation
 */

/**
 * @param {UpdatePatientViewProps} props
 */
export default function UpdateInfoView({
	getGeneralPatientInformation,
	updateGeneralPatientInformation,
	sidebarConfig,
	useStore,
	getStudentPatientInformation,
	updateStudentPatientInformation,
	getCollaboratorInformation,
	updateCollaboratorInformation,
}) {
	const id = useStore((s) => s.selectedPatientId);

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "20% 80%",
				padding: "2rem",
				background: colors.primaryBackground,
				height: "100vh",
				gap: "2rem",
			}}
		>
			<DashboardSidebar {...sidebarConfig} />
			<div
				style={{
					overflowY: "scroll",
					background: colors.secondaryBackground,
					borderRadius: "0.625rem",
					width: "99%",
				}}
			>
				<Suspense
					fallback={<Throbber loadingMessage="Cargando datos de paciente..." />}
				>
					<UpdateGeneralInformationSection
						patientId={id}
						getData={getGeneralPatientInformation}
						updateData={updateGeneralPatientInformation}
					/>
					<UpdateColaboratorInformationSection
						patientId={id}
						getData={getCollaboratorInformation}
						updateData={updateCollaboratorInformation}
					/>
					<UpdateStudentInformationSection
						patientId={id}
						getData={getStudentPatientInformation}
						updateData={updateStudentPatientInformation}
					/>
				</Suspense>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} UpdateColaboratorInformationSectionProps
 * @property {number} patientId
 * @property {import("src/dataLayer.mjs").GetCollaboratorPatientInformationAPICall} getData
 * @property {import("src/dataLayer.mjs").UpdateCollaboratorPatientInformationAPICall} updateData
 */

/**
 * @param {UpdateColaboratorInformationSectionProps} props
 */
function UpdateColaboratorInformationSection({
	patientId,
	getData,
	updateData,
}) {
	const GenInputStyle = (labelRow, labelColumn) => {
		const gridColumn = `${labelColumn} / ${labelColumn + 1}`;
		const gridRow = `${labelRow} / ${labelRow + 1}`;

		return { gridColumn, gridRow };
	};

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
		Secondsectionform: {
			display: "grid",
			gap: "20px",
			paddingTop: "10px",
		},
		input: {
			maxWidth: "18.75rem",
		},
	};

	const collaboratorInformationResource = WrapPromise(getData(patientId));
	const response = collaboratorInformationResource.read();

	const [editMode, setEditMode] = useState(false);
	const [patientData, setPatientData] = useState({
		...(response?.result || {}),
	});

	const handleUpdatePatient = async () => {
		setEditMode(false);
		toast.info("Actualizando datos de colaborador...");

		const response = await updateData(patientData);
		if (response.error) {
			toast.error(
				`Lo sentimos! Ha ocurrido un error al actualizar los datos!\n${response.error.message}`,
			);
			return;
		}

		setPatientData(response.result || {});
		toast.success("¡Información actualizada exitosamente!");
	};

	const handleCancelEdit = () => {
		setPatientData({ ...response?.result });
		setEditMode(false);
	};

	return (
		<form style={styles.form}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					paddingRight: "1rem",
				}}
			>
				<h1 style={styles.h1}>Datos de Colaborador:</h1>
				{editMode ? (
					<div>
						<IconButton icon={CheckIcon} onClick={handleUpdatePatient} />
						<IconButton icon={CancelIcon} onClick={handleCancelEdit} />
					</div>
				) : (
					<IconButton icon={EditIcon} onClick={() => setEditMode(true)} />
				)}
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "30% 30%",
					rowGap: "0.5rem",
					columnGap: "2rem",
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
					style={{ ...styles.input, ...GenInputStyle(2, 1) }}
					disabled={!editMode}
				/>

				<label style={styles.label}>Área:</label>
				<BaseInput
					type="text"
					value={patientData.area}
					onChange={(e) =>
						setPatientData({ ...patientData, area: e.target.value })
					}
					placeholder="Área"
					style={{ ...styles.input, ...GenInputStyle(2, 2) }}
					disabled={!editMode}
				/>
			</div>
		</form>
	);
}

/**
 * @typedef {Object} UpdateGeneralInformationSectionProps
 * @property {number} patientId
 * @property {import("src/dataLayer.mjs").GetGeneralPatientInformationAPICall} getData
 * @property {import("src/dataLayer.mjs").UpdateGeneralPatientInformationAPICall} updateData
 */

/**
 * @param {UpdateGeneralInformationSectionProps} props
 * @returns {JSX.Element}
 */
function UpdateGeneralInformationSection({ patientId, getData, updateData }) {
	const GenInputStyle = (labelRow, labelColumn) => {
		const gridColumn = `${labelColumn} / ${labelColumn + 1}`;
		const gridRow = `${labelRow} / ${labelRow + 1}`;

		return { gridColumn, gridRow };
	};

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
			fontSize: "24px",
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

	/** @type {React.CSSProperties} */
	const collapsableInnerStyle = {
		display: "flex",
		flexDirection: "column",
		gap: "0.5rem",
		padding: "1rem",
	};

	const generalInformationResource = WrapPromise(getData(patientId));
	const response = generalInformationResource.read();
	const [editMode, setEditMode] = useState(false);

	/** @type {[PatientInfo, (data: PatientInfo) => void]} */
	const [patientData, setPatientData] = useState({
		...response.result,
		birthdate: formatDate(response.result?.birthdate),
	});

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

		setEditMode(false);
		toast.info("Actualizando datos generales...");

		const response = await updateData(patientData);
		if (response.error) {
			toast.error(
				`Lo sentimos! Ha ocurrido un error al actualizar los datos!\n${response.error.message}`,
			);
		}

		setPatientData(response.result || {});
		toast.success("¡Información actualizada exitosamente!");
	};

	const handleCancelEdit = () => {
		setPatientData({
			...response.result,
			birthdate: formatDate(response.result.birthdate),
		});
		setEditMode(false);
	};

	return (
		<form style={styles.form}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
				}}
			>
				<h1 style={styles.h1}>Datos Generales:</h1>
				{editMode ? (
					<div>
						<IconButton icon={CheckIcon} onClick={handleUpdatePatient} />
						<IconButton icon={CancelIcon} onClick={handleCancelEdit} />
					</div>
				) : (
					<IconButton icon={EditIcon} onClick={() => setEditMode(true)} />
				)}
			</div>
			<div style={styles.firstsectionform}>
				<label style={styles.label}>Nombres:</label>
				<BaseInput
					type="text"
					value={patientData.names}
					onChange={(e) =>
						setPatientData({ ...patientData, names: e.target.value })
					}
					placeholder="Nombres"
					style={{ ...styles.input, ...GenInputStyle(2, 1) }}
					disabled={!editMode}
				/>

				<label style={styles.label}>Apellidos:</label>
				<BaseInput
					type="text"
					value={patientData.lastNames}
					onChange={(e) =>
						setPatientData({ ...patientData, lastNames: e.target.value })
					}
					style={{ ...styles.input, ...GenInputStyle(2, 2) }}
					disabled={!editMode}
				/>

				<label style={styles.label}>CUI:</label>
				<BaseInput
					type="text"
					value={patientData.cui}
					onChange={(e) =>
						setPatientData({ ...patientData, cui: e.target.value })
					}
					placeholder="CUI"
					style={{ ...styles.input, ...GenInputStyle(4, 1) }}
					disabled={!editMode}
				/>

				<label style={styles.label}>Email:</label>
				<BaseInput
					type="email"
					value={patientData.email || ""}
					onChange={(e) =>
						setPatientData({ ...patientData, email: e.target.value })
					}
					style={{ ...styles.input, ...GenInputStyle(4, 2) }}
					disabled={!editMode}
				/>

				<label style={styles.label}>Sexo:</label>
				<div style={{ ...styles.SexInput, ...GenInputStyle(6, 1) }}>
					<RadioInput
						type="radio"
						name="gender"
						value="female"
						label="Femenino"
						checked={patientData.isWoman}
						onChange={() => setPatientData({ ...patientData, isWoman: true })}
						disabled={!editMode}
					/>
					<RadioInput
						type="radio"
						name="gender"
						value="male"
						label="Masculino"
						checked={!patientData.isWoman}
						onChange={() => setPatientData({ ...patientData, isWoman: false })}
						disabled={!editMode}
					/>
				</div>

				<label style={styles.label}>Teléfono:</label>
				<BaseInput
					type="text"
					value={patientData.phone || ""}
					onChange={(e) =>
						setPatientData({ ...patientData, phone: e.target.value })
					}
					style={{ ...styles.input, ...GenInputStyle(6, 2) }}
					disabled={!editMode}
				/>

				<label style={styles.label}>Fecha de nacimiento:</label>
				<DateInput
					value={patientData.birthdate}
					readOnly={!editMode}
					onChange={(e) =>
						setPatientData({ ...patientData, birthdate: e.target.value })
					}
					style={{ ...styles.input, ...GenInputStyle(8, 1) }}
					disabled={!editMode}
				/>
			</div>

			<div style={styles.Secondsectionform}>
				<label style={styles.label}>Tipo de sangre:</label>
				<DropdownMenu
					options={dropdownOptions}
					value={patientData.bloodType}
					readOnly={!editMode}
					onChange={(e) =>
						setPatientData({ ...patientData, bloodType: e.target.value })
					}
					style={{ ...styles.input, ...GenInputStyle(8, 2) }}
					disabled={!editMode}
				/>

				<label style={styles.label}>Dirección:</label>
				<BaseInput
					type="text"
					value={patientData.address || ""}
					onChange={(e) =>
						setPatientData({ ...patientData, address: e.target.value })
					}
					style={styles.input}
					disabled={!editMode}
				/>

				<label style={styles.label}>Seguro:</label>
				<div style={{ paddingBottom: "2rem", width: "100%" }}>
					<BaseInput
						type="text"
						value={patientData.insurance || ""}
						onChange={(e) =>
							setPatientData({ ...patientData, insurance: e.target.value })
						}
						style={{ width: "18.75rem" }}
						disabled={!editMode}
					/>
				</div>
			</div>

			<h2 style={styles.h2}>Contactos del paciente</h2>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					// justifyContent: "space-around",
					gap: "2rem",
					padding: "1rem",
				}}
			>
				<Collapsable
					title="Contacto 1"
					isCollapsed={!patientData.contactPhone1}
				>
					<div style={collapsableInnerStyle}>
						<label style={styles.label}>Nombre de contacto</label>
						<BaseInput
							type="text"
							value={patientData.contactName1 || ""}
							onChange={(e) =>
								setPatientData({
									...patientData,
									contactName1: e.target.value,
								})
							}
							style={styles.input}
							disabled={!editMode}
						/>

						<label style={styles.label}>Parentesco de contacto</label>
						<BaseInput
							type="text"
							value={patientData.contactKinship1 || ""}
							onChange={(e) =>
								setPatientData({
									...patientData,
									contactKinship1: e.target.value,
								})
							}
							style={styles.input}
							disabled={!editMode}
						/>

						<label style={styles.label}>Teléfono de contacto</label>
						<BaseInput
							type="text"
							value={patientData.contactPhone1 || ""}
							onChange={(e) =>
								setPatientData({
									...patientData,
									contactPhone1: e.target.value,
								})
							}
							style={styles.input}
							disabled={!editMode}
						/>
					</div>
				</Collapsable>
				<Collapsable
					title="Contacto 2"
					isCollapsed={!patientData.contactPhone2}
				>
					<div style={collapsableInnerStyle}>
						<label style={styles.label}>Nombre de contacto</label>
						<BaseInput
							type="text"
							value={patientData.contactName2 || ""}
							onChange={(e) =>
								setPatientData({
									...patientData,
									contactName2: e.target.value,
								})
							}
							style={styles.input}
							disabled={!editMode}
						/>

						<label style={styles.label}>Parentesco de contacto</label>
						<BaseInput
							type="text"
							value={patientData.contactKinship2 || ""}
							onChange={(e) =>
								setPatientData({
									...patientData,
									contactKinship2: e.target.value,
								})
							}
							style={styles.input}
							disabled={!editMode}
						/>

						<label style={styles.label}>Teléfono de contacto</label>
						<BaseInput
							type="text"
							value={patientData.contactPhone2 || ""}
							onChange={(e) =>
								setPatientData({
									...patientData,
									contactPhone2: e.target.value,
								})
							}
							style={styles.input}
							disabled={!editMode}
						/>
					</div>
				</Collapsable>
			</div>
		</form>
	);
}

/**
 * @typedef {Object} UpdateStudentInformationSectionProps
 * @property {number} patientId
 * @property {import("src/dataLayer.mjs").GetStudentPatientInformationAPICall} getData
 * @property {import("src/dataLayer.mjs").UpdateStudentPatientInformationAPICall} updateData
 */

/**
 * @param {UpdateStudentInformationSectionProps} props
 */
function UpdateStudentInformationSection({ patientId, getData, updateData }) {
	const GenInputStyle = (labelRow, labelColumn) => {
		const gridColumn = `${labelColumn} / ${labelColumn + 1}`;
		const gridRow = `${labelRow} / ${labelRow + 1}`;

		return { gridColumn, gridRow };
	};

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
		input: {
			maxWidth: "18.75rem",
		},
	};

	// Fetch the student information
	const studentInformationResource = WrapPromise(getData(patientId));
	const response = studentInformationResource.read();

	const [editMode, setEditMode] = useState(false);
	const [patientData, setPatientData] = useState({
		...(response?.result || {}),
	});

	const handleUpdatePatient = async () => {
		setEditMode(false);
		toast.info("Actualizando datos de estudiante...");

		const response = await updateData(patientData);
		if (response.error) {
			toast.error(
				`Lo sentimos! Ha ocurrido un error al actualizar los datos!\n${response.error.message}`,
			);
			return;
		}

		setPatientData(response.result || {});
		toast.success("¡Información actualizada exitosamente!");
	};

	const handleCancelEdit = () => {
		setPatientData({ ...response?.result });
		setEditMode(false);
	};

	return (
		<form style={styles.form}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					paddingRight: "1rem",
				}}
			>
				<h1 style={styles.h1}>Datos de Estudiante:</h1>
				{editMode ? (
					<div>
						<IconButton icon={CheckIcon} onClick={handleUpdatePatient} />
						<IconButton icon={CancelIcon} onClick={handleCancelEdit} />
					</div>
				) : (
					<IconButton icon={EditIcon} onClick={() => setEditMode(true)} />
				)}
			</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "30% 30%",
					rowGap: "0.5rem",
					columnGap: "2rem",
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
					style={{ ...styles.input, ...GenInputStyle(2, 1) }}
					disabled={!editMode}
				/>

				<label style={styles.label}>Carrera:</label>
				<BaseInput
					type="text"
					value={patientData.career}
					onChange={(e) =>
						setPatientData({ ...patientData, career: e.target.value })
					}
					placeholder="Carrera"
					style={{ ...styles.input, ...GenInputStyle(2, 2) }}
					disabled={!editMode}
				/>
			</div>
		</form>
	);
}
