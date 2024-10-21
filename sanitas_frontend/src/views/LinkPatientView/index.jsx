import { colors, fonts, fontSize } from "src/theme.mjs";
import logoSanitas from "src/assets/images/logoSanitas.png";
import { BaseInput } from "src/components/Input";
import BaseButton from "src/components/Button/Base";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { NAV_PATHS } from "src/router";
import { cuiIsValid } from "src/utils/cui";
import useWindowSize from "src/utils/useWindowSize"; // Importar el hook

/**
 * @typedef {Object} LinkPatientViewProps
 * @property {import("src/dataLayer.mjs").LinkAccountToPatientCallback} linkAccount - Links an account to a given patient using it's CUI.
 */

/**
 * Component to link an existing cognito account to a patient.
 * @param {LinkPatientViewProps}
 */
export function LinkPatientView({ linkAccount }) {
	const navigate = useNavigate();
	const [cui, setCui] = useState("");
	const { width } = useWindowSize(); // Obtener el ancho de la ventana

	const isMobile = width < 768; // Determinar si es móvil

	const isValidCUI = (cui) => {
		if (cuiIsValid(cui).error) {
			return false;
		}

		return true;
	};

	const handleLinking = async () => {
		if (!isValidCUI(cui.trim())) {
			toast.error("CUI inválido!");
			return;
		}

		toast.info("Buscando paciente...");
		const response = await linkAccount(cui);
		if (response.error) {
			const message = response.error.error;
			if (message !== "No patient with the given CUI found!") {
				toast.error(
					`¡Lo sentimos ha ocurrido un error!\n${response.error.error}`,
				);
				return;
			}

			toast.info(
				"¡El paciente no existe! Redirigiendo al formulario de creación...",
			);
			setTimeout(() => {
				navigate(NAV_PATHS.CREATE_PATIENT, { state: { cui } });
			}, 3000);
		} else {
			toast.info(
				"¡Paciente encontrado! Redirigiendo al formulario de actualización...",
			);
			setTimeout(() => {
				navigate(NAV_PATHS.PATIENT_FORM);
			}, 3000);
		}
	};

	return (
		<div
			style={{
				backgroundColor: colors.primaryBackground,
				height: "100vh",
				padding: "3rem",
				display: "grid",
				justifyItems: "center",
				alignItems: "center",
			}}
		>
			<div
				style={{
					backgroundColor: colors.secondaryBackground,
					borderRadius: "1.5rem",
					padding: isMobile ? "2rem" : "5rem", // Cambiar padding en móvil
					display: "flex",
					flexDirection: "column",
					width: isMobile ? "90%" : "50%", // Cambiar ancho en móvil
				}}
			>
				{/* Logo */}
				<img
					src={logoSanitas}
					style={{
						width: isMobile ? "60%" : "35%", // Aumentar tamaño del logo en móvil
						alignSelf: "center",
					}}
					alt="Logo Sanitas"
				/>
				<p
					style={{
						fontFamily: fonts.titleFont,
						fontSize: fontSize.subtitleSize,
						color: colors.primaryText,
						wordWrap: "normal",
						textAlign: "center",
						lineHeight: "1.8rem",
						paddingTop: "2rem",
						paddingBottom: "3rem",
					}}
				>
					¡Necesitamos tu CUI para poder registrarte dentro del sistema y buscar
					si ya tienes un paciente registrado!
				</p>

				<div
					style={{
						alignSelf: "center",
						display: "flex",
						flexDirection: "column", // Cambiar a columna para que el label esté arriba
						gap: ".5rem",
						width: "80%",
						alignItems: isMobile ? "center" : "flex-start", // Centrar solo en móvil
					}}
				>
					<label
						style={{
							fontFamily: fonts.textFont,
							fontSize: "1.2rem",
							color: colors.primaryText,
							textAlign: isMobile ? "center" : "left", // Centrar el texto solo en móvil
						}}
					>
						Ingrese su CUI:
					</label>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							width: "100%",
							justifyContent: isMobile ? "center" : "flex-start",
						}}
					>
						<BaseInput
							type="number"
							placeholder="0297303412106"
							value={cui}
							onChange={(e) => setCui(e.target.value)}
							style={{
								height: "3rem",
								flexGrow: 1,
								borderColor: isValidCUI(cui.trim())
									? "#5B6670"
									: colors.statusDenied,
							}}
						/>
						{/* Mostrar el botón en la misma fila en pantallas grandes */}
						{!isMobile && (
							<BaseButton
								text="Buscar"
								style={{ height: "3rem", marginLeft: "1rem" }} // Margen izquierdo para separación
								onClick={handleLinking}
							/>
						)}
					</div>
					{/* Botón en su propia fila solo en móviles */}
					{isMobile && (
						<BaseButton
							text="Buscar"
							style={{ height: "3rem", marginTop: "1rem", alignSelf: "center" }} // Alinear al centro
							onClick={handleLinking}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
