import logoutIcon from "@tabler/icons/outline/door-exit.svg";
import goBackIcon from "@tabler/icons/outline/arrow-left.svg";
import rightArrow from "@tabler/icons/outline/arrow-right.svg";
import BorderDecoLower from "src/assets/images/BorderDecoLower.png";
import BorderDecoUpper from "src/assets/images/BorderDecoUpper.png";
import SanitasLogo from "src/assets/images/logoSanitas.png";
import { colors, fonts, fontSize } from "src/theme.mjs";
import IconButton from "src/components/Button/Icon";
import { BaseInput } from "src/components/Input";
import BaseButton from "src/components/Button/Base";
import { useState } from "react";
import { formatDate } from "@storybook/blocks";
import { toast } from "react-toastify";

/**
 * @typedef {Object} ExportDataViewProps
 * @property {import("src/dataLayer.mjs").ExportDataCallback} exportData
 */

/**
 * @param {ExportDataViewProps} props
 */
export function ExportDataView({ exportData }) {
	const today = new Date();
	const [finalDate, setFinalDate] = useState(today);
	const [startDate, setStartDate] = useState(
		new Date(today.getFullYear(), today.getMonth(), 1),
	);

	const validateDates = (startDate, finalDate) => {
		return startDate.getTime() < finalDate.getTime();
	};

	const handleChange = (newStart, newfinal) => {
		if (!validateDates(newStart, newfinal)) {
			toast.error("¡La fecha de inicio debe ser anterior a la final!");
			return;
		}

		setFinalDate(newfinal);
		setStartDate(newStart);
	};

	return (
		<div
			style={{
				background: colors.primaryBackground,
				width: "100vw",
				height: "100vh",
				padding: "2rem",
			}}
		>
			<div
				style={{
					background: colors.secondaryBackground,
					width: "100%",
					height: "100%",
					position: "relative",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{/* DECORATIONS */}
				<img
					src={BorderDecoLower}
					style={{
						position: "absolute",
						bottom: "0",
						right: "0",
						width: "30%",
					}}
				/>
				<img
					src={BorderDecoUpper}
					style={{
						position: "absolute",
						top: "0",
						left: "0",
						width: "30%",
					}}
				/>

				{/* TOP BUTTONS */}
				<div
					style={{
						display: "flex",
						position: "absolute",
						top: "2rem",
						right: "2rem",
					}}
				>
					<IconButton icon={goBackIcon} />
					<IconButton icon={logoutIcon} />
				</div>

				<img src={SanitasLogo} style={{ width: "16rem" }} />

				{/* TITLES */}
				<h1
					style={{
						fontFamily: fonts.titleFont,
						fontSize: "3rem",
						color: colors.titleText,
						paddingBottom: ".5rem",
					}}
				>
					Exportar datos
				</h1>
				<p
					style={{
						fontFamily: fonts.textFont,
						fontSize: fontSize.subtitleSize,
						paddingBottom: "2rem",
					}}
				>
					Por favor ingresa el rango de fechas para exportar...
				</p>

				{/* INPUTS */}
				<div
					style={{
						display: "flex",
						alignItems: "end",
						gap: "2rem",
						paddingBottom: "1rem",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<label>Inicio:</label>
						<BaseInput
							type="date"
							value={formatDate(startDate)}
							onChange={(ev) =>
								handleChange(new Date(ev.target.value), finalDate)
							}
						/>
					</div>
					<img src={rightArrow} style={{ paddingBottom: ".3rem" }} />
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<label>Final:</label>
						<BaseInput
							type="date"
							value={formatDate(finalDate)}
							onChange={(ev) =>
								handleChange(startDate, new Date(ev.target.value))
							}
						/>
					</div>
				</div>
				<BaseButton text="Descargar" />
			</div>
		</div>
	);
}
