import { colors, fonts, fontSize } from "src/theme.mjs";
import logoSanitas from "src/assets/images/logoSanitas.png";
import { BaseInput } from "src/components/Input";
import BaseButton from "src/components/Button/Base";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";

/**
 * @typedef {Object} LinkPatientViewProps
 * @property {import("src/dataLayer.mjs").LinkAccountToPatientCallback} linkAccount - Links an account to a given patient using it's CUI.
 */

/**
 * Component to link an existing cognito account to a patient.
 * @param {LinkPatientViewProps}
 */
export function LinkPatientView({ linkAccount }) {
	const [cui, setCui] = useState("");

	const handleLinking = async () => {
		toast.info("Buscando paciente...");
		const response = await linkAccount(cui);
		if (response.error) {
			toast.error(`Lo sentimos ha ocurrido un error! ${error.toString()}`);
			return;
		}
		// TODO: Navigate to patient form...
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
					padding: "5rem",
					display: "flex",
					flexDirection: "column",
					width: "50%",
				}}
			>
				<img
					src={logoSanitas}
					style={{
						width: "40%",
						alignSelf: "center",
					}}
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
					Necesitamos tu CUI para poder registrarte dentro del sistema y buscar
					si ya tienes un paciente registrado!
				</p>

				<div
					style={{
						alignSelf: "center",
						display: "flex",
						flexDirection: "column",
						gap: ".5rem",
						width: "80%",
					}}
				>
					<label
						style={{
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
							color: colors.primaryText,
						}}
					>
						Ingrese su CUI:
					</label>
					<div
						style={{
							display: "flex",
							gap: ".5rem",
						}}
					>
						<BaseInput
							type="number"
							placeholder="2834723615201"
							value={cui}
							onChange={(e) => setCui(e.target.value)}
							style={{
								height: "3rem",
								flexGrow: 1,
							}}
						/>
						<BaseButton
							text="Buscar"
							style={{ height: "3rem" }}
							onClick={handleLinking}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
