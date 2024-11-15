import { useState } from "react";
import logoSanitas from "src/assets/images/logoSanitas.png";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import { BaseInput, DateInput, RadioInput } from "src/components/Input/index";
import { NAV_PATHS } from "src/router";
import { colors, fonts, fontSize } from "src/theme.mjs";
import useWindowSize from "src/utils/useWindowSize";
import { getErrorMessage } from "src/utils/errorhandlerstoasts";

/**
 * @typedef {Object} PatientData
 * @property {string} cui - Unique identifier for the patient.
 * @property {string} names - First and middle names of the patient.
 * @property {string} surnames - Last names of the patient.
 * @property {boolean} isWoman - Gender of the patient.
 * @property {string} birthDate - Birthdate of the patient.
 * @property {boolean} isNew - Indicates if the patient data is new or existing.
 */

/**
 * @typedef {Object} CreatePatientViewProps
 * @property {import("src/store.mjs").UseStoreHook} useStore
 * @property {import("src/dataLayer.mjs").SubmitPatientDataCallback} submitPatientData
 * @property {import("src/dataLayer.mjs").LinkAccountToPatientCallback} linkAccount
 */

/**
 * Component for adding new patients.
 * Uses navigation state to pre-fill the CUI if available.
 *
 * @param {CreatePatientViewProps} props - Component properties.
 */
export function CreatePatientView({
	submitPatientData,
	useStore,
	linkAccount,
}) {
	const { width } = useWindowSize();
	const isMobile = width < 768;
	const setSelectedPatientId = useStore((s) => s.setSelectedPatientId);
	const location = useLocation();
	const navigate = useNavigate();

	const [patientData, setPatientData] = useState({
		cui: location.state?.cui ?? "",
		names: "",
		surnames: "",
		isWoman: true,
		birthDate: "",
	});

	/**
	 * Handles changes to the input fields for patient data and updates the state.
	 * Filters input based on the field type to ensure data integrity.
	 * @param {string} field - The field name to update.
	 * @param {string} value - The new value for the field.
	 */
	const handleChange = (field, value) => {
		if (field === "names" || field === "surnames") {
			const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
			setPatientData({ ...patientData, [field]: filteredValue });
		} else {
			setPatientData({ ...patientData, [field]: value });
		}
	};

	/**
	 * Validates the patient birthday before submission.
	 * @returns {boolean} True if the form is valid, false otherwise.
	 */
	const validateBirthDate = (date) => {
		const currentDate = new Date();
		const minDate = new Date(
			currentDate.getFullYear() - 150,
			currentDate.getMonth(),
			currentDate.getDate(),
		);
		const birthDate = new Date(date);

		if (birthDate > currentDate || birthDate < minDate) {
			toast.error(
				`La fecha de nacimiento es inválida. Debe estar entre ${minDate.toLocaleDateString()} y ${currentDate.toLocaleDateString()}.`,
			);
			return false;
		}
		return true;
	};

	/**
	 * Provides more information on the name of the empty field to the user
	 */

	const fieldLabels = {
		names: "nombres del paciente",
		surnames: "apellidos del paciente",
		birthDate: "fecha de nacimiento",
	};

	/**
	 * Validates the patient data form before submission.
	 * Ensures all required fields are filled.
	 * @returns {boolean} True if the form is valid, false otherwise.
	 */
	const validateFormData = () => {
		const fields = ["names", "surnames", "birthDate"];
		if (patientData.cui.length !== 13) {
			toast.error("El CUI debe contener exactamente 13 caracteres.");
			return false;
		}
		for (const field of fields) {
			if (!patientData[field]) {
				toast.error(
					`El campo ${fieldLabels[field]} es obligatorio y no puede estar vacío.`,
				);
				return false;
			}
		}
		if (patientData.isWoman === null) {
			toast.error("El campo de género es obligatorio.");
			return false;
		}

		if (!validateBirthDate(patientData.birthDate)) {
			return false;
		}
		return true;
	};

	const handleSubmit = async () => {
		if (!validateFormData()) {
			return;
		}

		toast.info("Creando paciente...");
		const response = await submitPatientData(patientData);
		if (response.error) {
			toast.error(getErrorMessage(response, "paciente"));
			return;
		}

		const linkPatientResponse = await linkAccount(patientData.cui);
		if (linkPatientResponse.error) {
			toast.error(
				"Lo sentimos! Ha ocurrido un error linkeando tu paciente con tu cuenta.",
			);
			return;
		}

		toast.success("Paciente creado!");
		const id = response.result;
		setSelectedPatientId(id);
		navigate(NAV_PATHS.PATIENT_FORM);
	};

	/**@type {React.CSSProperties} */
	const commonWhiteBubbleStyles = {
		padding: "1.5rem 3rem",
		borderRadius: ".5rem",
		background: colors.secondaryBackground,
	};
	/**@type {React.CSSProperties} */
	const inputContainerStyles = {
		display: "flex",
		flexDirection: "column",
		gap: ".5rem",
	};
	/**@type {React.CSSProperties} */
	const inputStyles = {
		height: "3rem",
	};
	/**@type {React.CSSProperties} */
	const labelStyles = {
		fontFamily: fonts.textFont,
		fontSize: fontSize.textSize,
		color: colors.primaryText,
	};

	return (
		<div
			style={{
				backgroundColor: colors.primaryBackground,
				minHeight: "100vh",
				padding: isMobile ? "1rem" : "3rem",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: isMobile ? "1rem" : "2rem",
				}}
			>
				{/* HEADER */}
				<div
					style={{
						...commonWhiteBubbleStyles,
						display: "flex",
						flexDirection: isMobile ? "column" : "row",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<img
						src={uvgLogo}
						style={{ height: isMobile ? "15vw" : "6vw" }}
						alt="UVG Logo"
					/>{" "}
					{/* Aumentar tamaño para móviles */}
					<h1
						style={{
							fontSize: fontSize.titleSize,
							color: colors.titleText,
							textAlign: "center",
							fontFamily: fonts.titleFont,
						}}
					>
						Creación del Paciente
					</h1>
					{/* Eliminar logoSanitas solo para móviles */}
					{!isMobile && (
						<img
							src={logoSanitas}
							style={{ height: isMobile ? "8vw" : "5vw" }}
							alt="Sanitas Logo"
						/>
					)}
				</div>

				{/* SUBTITLE */}
				<div style={commonWhiteBubbleStyles}>
					<p
						style={{
							fontFamily: fonts.textFont,
							fontSize: isMobile
								? fontSize.subtitleSize * 0.9
								: fontSize.subtitleSize, // Ajustar tamaño de fuente
							textAlign: "center",
							color: colors.primaryText,
						}}
					>
						Para comenzar, necesitamos algunos datos básicos sobre ti. Esto nos
						ayudará a crear tu perfil de paciente de manera correcta.
					</p>
				</div>

				{/* BODY */}
				<div
					style={{
						...commonWhiteBubbleStyles,
						display: "flex",
						flexDirection: "column",
						paddingTop: "3rem",
						paddingBottom: "3rem",
					}}
				>
					<h2
						style={{
							color: colors.primaryText,
							fontSize: fontSize.subtitleSize,
							font: fonts.textFont,
							fontWeight: "bold",
						}}
					>
						Información del Paciente:
					</h2>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: isMobile ? "100%" : "50% 50%", // Cambiar a una columna en móviles
							paddingTop: "1.5rem",
							paddingBottom: "3rem",
						}}
					>
						{/* FIRST COLUMN */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "1rem",
								paddingRight: isMobile ? "0" : "1rem", // Ajustar padding
							}}
						>
							<div style={inputContainerStyles}>
								<label style={labelStyles}>Nombres del paciente:</label>
								<BaseInput
									type="text"
									value={patientData.names}
									onChange={(e) => handleChange("names", e.target.value)}
									placeholder="Ingresa tu nombre"
									style={inputStyles}
								/>
							</div>

							{/* Campo de Apellidos solo para móviles */}
							{isMobile && (
								<div style={inputContainerStyles}>
									<label style={labelStyles}>Apellidos del paciente:</label>
									<BaseInput
										type="text"
										value={patientData.surnames}
										onChange={(e) => handleChange("surnames", e.target.value)}
										placeholder="Ingresa tu apellido"
										style={inputStyles}
									/>
								</div>
							)}

							<div style={inputContainerStyles}>
								<label style={labelStyles}>CUI del Paciente:</label>
								<BaseInput
									type="text"
									value={patientData.cui}
									readOnly={true}
									style={inputStyles}
								/>
							</div>
							<div style={inputContainerStyles}>
								<label style={labelStyles}>Fecha de Nacimiento:</label>
								<DateInput
									value={patientData.birthDate}
									onChange={(e) => handleChange("birthDate", e.target.value)}
									placeholder="Fecha de nacimiento"
									style={inputStyles}
								/>
							</div>
						</div>

						{/* SECOND COLUMN */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "1rem",
								paddingTop: isMobile ? "1.5rem" : "0",
								paddingLeft: isMobile ? "0" : "1rem", // Ajustar padding
							}}
						>
							{/* Campo de Apellidos solo para pantallas grandes */}
							{!isMobile && (
								<div style={inputContainerStyles}>
									<label style={labelStyles}>Apellidos del paciente:</label>
									<BaseInput
										type="text"
										value={patientData.surnames}
										onChange={(e) => handleChange("surnames", e.target.value)}
										placeholder="Ingresa tu apellido"
										style={inputStyles}
									/>
								</div>
							)}

							{/* Campo de Sexo, visible en ambas vistas */}
							<div style={inputContainerStyles}>
								<label style={labelStyles}>Sexo:</label>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "2rem",
									}}
								>
									<RadioInput
										name="gender"
										checked={!patientData.isWoman}
										onChange={() => handleChange("isWoman", false)}
										label="Masculino"
										style={{ fontFamily: fonts.textFont }}
									/>
									<RadioInput
										name="gender"
										checked={patientData.isWoman}
										onChange={() => handleChange("isWoman", true)}
										label="Femenino"
										style={{
											fontFamily: fonts.textFont,
											display: "flex",
											alignItems: "center",
										}}
									/>
								</div>
							</div>
						</div>
					</div>

					<BaseButton
						text="Continuar con el formulario"
						onClick={handleSubmit}
						style={{
							alignSelf: "center",
							width: isMobile ? "80%" : "30%",
							height: "3rem",
						}}
					/>
				</div>
			</div>
		</div>
	);
}
