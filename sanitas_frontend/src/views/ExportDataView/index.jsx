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
import { downloadBlob } from "src/utils";
import { useNavigate } from "react-router-dom";
import { NAV_PATHS } from "src/router";
import { IS_PRODUCTION } from "src/constants.mjs";

/**
 * @typedef {Object} ExportDataViewProps
 * @property {import("src/dataLayer.mjs").ExportDataCallback} exportData
 * @property {import("src/cognito.mjs").CognitoLogoutUserCallback} logoutUser
 */

/**
 * @param {ExportDataViewProps} props
 */
export function ExportDataView({ exportData, logoutUser }) {
	const navigate = useNavigate();
	const today = new Date();
	const [endDate, setEndDate] = useState(today);
	const [startDate, setStartDate] = useState(
		new Date(today.getFullYear(), today.getMonth(), 1),
	);

	const handleLogout = () => {
		logoutUser();
		navigate(NAV_PATHS.LOGIN_USER);
	};
	const handleGoBack = () => {
		navigate(NAV_PATHS.SEARCH_PATIENT);
	};

	const validateDates = (startDate, finalDate) => {
		return startDate.getTime() < finalDate.getTime();
	};

	const handleDateChange = (newStart, newfinal) => {
		if (!validateDates(newStart, newfinal)) {
			toast.error("¡La fecha de inicio debe ser anterior a la final!");
			return;
		}

		setEndDate(newfinal);
		setStartDate(newStart);
	};

	const handleDataExport = async () => {
		try {
			const response = await toast.promise(
				async () => {
					const response = await exportData(startDate, endDate);
					if (response.error) {
						throw response.error;
					}
					return response.result;
				},
				{
					pending: "Exportando datos de visita...",
					success: "Datos exportados!",
					error: "No se pudo exportar los datos por el momento!",
				},
			);

			downloadBlob(
				response,
				`visitas_de_${formatDate(startDate)}_a_${formatDate(endDate)}`,
				"text/csv;charset=utf-8;",
			);
		} catch (error) {
			if (!IS_PRODUCTION) {
				console.log(error);
			}
		}
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
					alt="Bottom border decoration"
					style={{
						position: "absolute",
						bottom: "0",
						right: "0",
						width: "25.43rem",
						height: "auto",
					}}
				/>
				<img
					src={BorderDecoUpper}
					alt="Top border decoration"
					style={{
						position: "absolute",
						top: "0",
						left: "0",
						width: "25.43rem",
						height: "auto",
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
					<IconButton icon={goBackIcon} onClick={handleGoBack} />
					<IconButton icon={logoutIcon} onClick={handleLogout} />
				</div>

				<img src={SanitasLogo} style={{ width: "16rem" }} alt="Sanitas Logo" />

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
								handleDateChange(new Date(ev.target.value), endDate)
							}
						/>
					</div>
					<img
						src={rightArrow}
						style={{ paddingBottom: ".3rem" }}
						alt="Decorative arrow"
					/>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<label>Final:</label>
						<BaseInput
							type="date"
							value={formatDate(endDate)}
							onChange={(ev) =>
								handleDateChange(startDate, new Date(ev.target.value))
							}
						/>
					</div>
					<BaseButton
						text="Descargar"
						style={{ height: "100%" }}
						onClick={handleDataExport}
					/>
				</div>
			</div>
		</div>
	);
}
