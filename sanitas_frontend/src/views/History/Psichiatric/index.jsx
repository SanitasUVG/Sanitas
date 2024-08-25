import { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import IconButton from "src/components/Button/Icon";
import { BaseInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * @typedef {Object} PsichiatricHistoryProps
 * @property {Function} getPsichiatricHistory - Function to fetch the allergic history of a patient.
 * @property {Function} updatePsichiatricHistory - Function to update or add new allergic records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's allergic history, allowing users to add and view records.
 *
 * @param {PsichiatricHistoryProps} props - The props passed to the PsichiatricHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */

export function PsichiatricHistory({
	getPsichiatricHistory,
	updatePsichiatricHistory,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
	const psichiatricHistoryResource = WrapPromise(getPsichiatricHistory(id));

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes psiquiátricos..." />
		);
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				backgroundColor: colors.primaryBackground,
				height: "100vh",
				padding: "2rem",
			}}
		>
			<div
				style={{
					width: "25%",
				}}
			>
				<DashboardSidebar {...sidebarConfig} />
			</div>

			<div
				style={{
					paddingLeft: "2rem",
					height: "100%",
					width: "100%",
				}}
			>
				<div
					style={{
						backgroundColor: colors.secondaryBackground,
						padding: "3.125rem",
						height: "100%",
						borderRadius: "10px",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<h1
							style={{
								color: colors.titleText,
								fontFamily: fonts.titleFont,
								fontSize: fontSize.titleSize,
							}}
						>
							Antecedentes Psiquiátricos
						</h1>
						<h3
							style={{
								fontFamily: fonts.textFont,
								fontWeight: "normal",
								fontSize: fontSize.subtitleSize,
								paddingTop: "0.5rem",
								paddingBottom: "3rem",
							}}
						>
							Registro de antecedentes psiquiátricos
						</h3>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-align",
							alignItems: "space-between",
							width: "100%",
							gap: "2rem",
						}}
					>
						<Suspense fallback={<LoadingView />}>
							<PsichiatricView
								id={id}
								psichiatricHistoryResource={psichiatricHistoryResource}
								updatePsichiatricHistory={updatePsichiatricHistory}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} PsichiatricViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} psichiatricHistoryResource - Wrapped resource for fetching psichiatric history data.
 * @property {Function} updatePsichiatricHistory - Function to update the Allergic history.
 *
 * Internal view component for managing the display and modification of a patient's psichiatric history, with options to add or edit records.
 *
 * @param {PsichiatricViewProps} props - Specific props for the PsichiatricViewiew component.
 * @returns {JSX.Element} - A detailed view for managing Psichiatric history with interactivity to add or edit records.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
function PsichiatricView({
	id,
	psichiatricHistoryResource,
	updatePsichiatricHistory,
}) {
	const psichiatricHistoryResult = psichiatricHistoryResource.read();
	const psichiatricHistoryData = psichiatricHistoryResult.result || {};

	const medicalHistory = psichiatricHistoryData?.medicalHistory || {
		depression: { data: [] },
		anxiety: { data: [] },
		ocd: { data: [] },
		adhd: { data: [] },
		bipolar: { data: [] },
		other: { data: [] },
	};

	const {
		depression = {
			data: [{ medication: "", dose: "", frequency: "", ube: false }],
		},
		anxiety = {
			data: [{ medication: "", dose: "", frequency: "", ube: false }],
		},
		ocd = { data: [{ medication: "", dose: "", frequency: "", ube: false }] },
		adhd = { data: [{ medication: "", dose: "", frequency: "", ube: false }] },
		bipolar = {
			data: [{ medication: "", dose: "", frequency: "", ube: false }],
		},
		other = {
			data: [
				{ illness: "", medication: "", dose: "", frequency: "", ube: false },
			],
		},
	} = medicalHistory;

	const [depressionStatus, setDepressionStatus] = useState(
		depression.data.length > 0,
	);
	const [anxietyStatus, setAnxietyStatus] = useState(anxiety.data.length > 0);
	const [TOCStatus, setTOCStatus] = useState(ocd.data.length > 0);
	const [TDAHStatus, setTDAHStatus] = useState(adhd.data.length > 0);
	const [BipolarStatus, setBipolarStatus] = useState(bipolar.data.length > 0);
	const [OtherStatus, setOtherStatus] = useState(bipolar.data.length > 0);

	useEffect(() => {
		const hasData = (condition) => {
			return (
				condition.data.length > 0 &&
				(condition.data[0].medication ||
					condition.data[0].dose ||
					condition.data[0].frequency ||
					condition.data[0].ube)
			);
		};

		setDepressionStatus(hasData(depression));
		setAnxietyStatus(hasData(anxiety));
		setTOCStatus(hasData(ocd));
		setTDAHStatus(hasData(adhd));
		setBipolarStatus(hasData(bipolar));
		setOtherStatus(other.data.length > 0 && other.data[0].illness);
	}, [depression, anxiety, ocd, adhd, bipolar, other]);

	const isFirstTime = !(
		depression.data.length ||
		anxiety.data.length ||
		ocd.data.length
	);
	const [isEditable, setIsEditable] = useState(isFirstTime);
	let errorMessage = "";

	if (psichiatricHistoryResult.error) {
		const error = psichiatricHistoryResult.error;
		if (error) {
			console.error("Error details:", error);
			if (error.response) {
				const { status, data } = error.response;
				console.error(`Status: ${status}, Response: ${JSON.stringify(data)}`);
				if (status < 500) {
					errorMessage =
						"Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!";
				} else {
					errorMessage = "Ha ocurrido un error interno, lo sentimos.";
				}
			} else {
				errorMessage = error;
			}
		}
	}

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
	const validateInputs = () => {
		// Validar Depresión
		if (depressionStatus) {
			if (!depressionMedication) {
				toast.error("Por favor, ingresa el medicamento para la depresión.");
				return false;
			}
			if (!depressionFrequency) {
				toast.error("Por favor, ingresa la frecuencia para la depresión.");
				return false;
			}
		}

		// Validar Ansiedad
		if (anxietyStatus) {
			if (!anxietyMedication) {
				toast.error("Por favor, ingresa el medicamento para la ansiedad.");
				return false;
			}
			if (!anxietyFrequency) {
				toast.error("Por favor, ingresa la frecuencia para la ansiedad.");
				return false;
			}
		}

		// Validar TOC (Trastorno Obsesivo Compulsivo)
		if (TOCStatus) {
			if (!TOCMedication) {
				toast.error("Por favor, ingresa el medicamento para el TOC.");
				return false;
			}
			if (!TOCFrequency) {
				toast.error("Por favor, ingresa la frecuencia para el TOC.");
				return false;
			}
		}

		// Validar TDAH (Trastorno por Déficit de Atención e Hiperactividad)
		if (TDAHStatus) {
			if (!TDAHMedication) {
				toast.error("Por favor, ingresa el medicamento para el TDAH.");
				return false;
			}
			if (!TDAHFrequency) {
				toast.error("Por favor, ingresa la frecuencia para el TDAH.");
				return false;
			}
		}

		// Validar Trastorno Bipolar
		if (BipolarStatus) {
			if (!bipolarMedication) {
				toast.error(
					"Por favor, ingresa el medicamento para el trastorno bipolar.",
				);
				return false;
			}
			if (!bipolarFrequency) {
				toast.error(
					"Por favor, ingresa la frecuencia para el trastorno bipolar.",
				);
				return false;
			}
		}

		// Validar Otros
		if (OtherStatus) {
			if (!otherIllness) {
				toast.error("Por favor, ingresa la condición en Otros.");
				return false;
			}
			if (!otherMedication) {
				toast.error(
					"Por favor, ingresa el medicamento para la condición en Otros.",
				);
				return false;
			}
			if (!otherFrequency) {
				toast.error(
					"Por favor, ingresa la frecuencia para la condición en Otros.",
				);
				return false;
			}
		}

		// Si todas las validaciones pasan, retornar true
		return true;
	};

	// Save the new Allergic record to the database

	const handleSaveNewHistory = async () => {
		// Validación de entradas antes de intentar guardar
		if (!validateInputs()) return;

		// Mostrar mensaje de carga
		toast.info("Guardando antecedentes psiquiátricos...");

		// Construir el objeto newHistoryData usando los estados actuales
		const newHistoryData = {
			depression: {
				version: medicalHistory.depression.version || 1,
				data: [
					{
						medication: depressionMedication,
						dose: depressionDose,
						frequency: depressionFrequency,
						ube: depressionUBE,
					},
				],
			},
			anxiety: {
				version: medicalHistory.anxiety.version || 1,
				data: [
					{
						medication: anxietyMedication,
						dose: anxietyDose,
						frequency: anxietyFrequency,
						ube: anxietyUBE,
					},
				],
			},
			ocd: {
				version: medicalHistory.ocd.version || 1,
				data: [
					{
						medication: TOCMedication,
						dose: TOCDose,
						frequency: TOCFrequency,
						ube: TOCUBE,
					},
				],
			},
			adhd: {
				version: medicalHistory.adhd.version || 1,
				data: [
					{
						medication: TDAHMedication,
						dose: TDAHDose,
						frequency: TDAHFrequency,
						ube: TDAHUBE,
					},
				],
			},
			bipolar: {
				version: medicalHistory.bipolar.version || 1,
				data: [
					{
						medication: bipolarMedication,
						dose: bipolarDose,
						frequency: bipolarFrequency,
						ube: bipolarUBE,
					},
				],
			},
			other: {
				version: medicalHistory.other.version || 1,
				data: [
					{
						illness: otherIllness,
						medication: otherMedication,
						dose: otherDose,
						frequency: otherFrequency,
						ube: otherUBE,
					},
				],
			},
		};

		try {
			const result = await updatePsichiatricHistory(id, newHistoryData);
			if (!result.error) {
				toast.success("Antecedentes psiquiátricos guardados con éxito.");
				setIsEditable(false);
				setDepressionStatus(newHistoryData.depression.data.length > 0);
				setAnxietyStatus(newHistoryData.anxiety.data.length > 0);
				setTOCStatus(newHistoryData.ocd.data.length > 0);
				setTDAHStatus(newHistoryData.adhd.data.length > 0);
				setBipolarStatus(newHistoryData.bipolar.data.length > 0);
				setOtherStatus(newHistoryData.other.data.length > 0);
			} else {
				toast.error(`Error al guardar los antecedentes: ${result.error}`);
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`);
		}
	};

	const [depressionMedication, setDepressionMedication] = useState(
		depression.data.length > 0 && depression.data[0].medication != null
			? depression.data[0].medication
			: "",
	);

	const [depressionDose, setDepressionDose] = useState(
		depression.data.length > 0 && depression.data[0].dose != null
			? depression.data[0].dose
			: "",
	);

	const [depressionFrequency, setDepressionFrequency] = useState(
		depression.data.length > 0 && depression.data[0].frequency != null
			? depression.data[0].frequency
			: "",
	);

	const [depressionUBE, setDepressionUBE] = useState(
		depression.data.length > 0 && depression.data[0].ube != null
			? depression.data[0].ube
			: false,
	);

	const [anxietyMedication, setAnxietyMedication] = useState(
		anxiety.data.length > 0 && anxiety.data[0].medication != null
			? anxiety.data[0].medication
			: "",
	);

	const [anxietyDose, setAnxietyDose] = useState(
		anxiety.data.length > 0 && anxiety.data[0].dose != null
			? anxiety.data[0].dose
			: "",
	);

	const [anxietyFrequency, setAnxietyFrequency] = useState(
		anxiety.data.length > 0 && anxiety.data[0].frequency != null
			? anxiety.data[0].frequency
			: "",
	);

	const [anxietyUBE, setAnxietyUBE] = useState(
		anxiety.data.length > 0 && anxiety.data[0].ube != null
			? anxiety.data[0].ube
			: false,
	);

	const [TOCMedication, setTOCMedication] = useState(
		ocd.data.length > 0 && ocd.data[0].medication != null
			? ocd.data[0].medication
			: "",
	);

	const [TOCDose, setTOCDose] = useState(
		ocd.data.length > 0 && ocd.data[0].dose != null ? ocd.data[0].dose : "",
	);

	const [TOCFrequency, setTOCFrequency] = useState(
		ocd.data.length > 0 && ocd.data[0].frequency != null
			? ocd.data[0].frequency
			: "",
	);

	const [TOCUBE, setTOCUBE] = useState(
		ocd.data.length > 0 && ocd.data[0].ube != null ? ocd.data[0].ube : false,
	);

	const [TDAHMedication, setTDAHMedication] = useState(
		adhd.data.length > 0 && adhd.data[0].medication != null
			? adhd.data[0].medication
			: "",
	);

	const [TDAHDose, setTDAHDose] = useState(
		adhd.data.length > 0 && adhd.data[0].dose != null ? adhd.data[0].dose : "",
	);

	const [TDAHFrequency, setTDAHFrequency] = useState(
		adhd.data.length > 0 && adhd.data[0].frequency != null
			? adhd.data[0].frequency
			: "",
	);

	const [TDAHUBE, setTDAHUBE] = useState(
		adhd.data.length > 0 && adhd.data[0].ube != null ? adhd.data[0].ube : false,
	);

	const [bipolarMedication, setBipolarMedication] = useState(
		bipolar.data.length > 0 && bipolar.data[0].medication != null
			? bipolar.data[0].medication
			: "",
	);

	const [bipolarDose, setBipolarDose] = useState(
		bipolar.data.length > 0 && bipolar.data[0].dose != null
			? bipolar.data[0].dose
			: "",
	);

	const [bipolarFrequency, setBipolarFrequency] = useState(
		bipolar.data.length > 0 && bipolar.data[0].frequency != null
			? bipolar.data[0].frequency
			: "",
	);

	const [bipolarUBE, setBipolarUBE] = useState(
		bipolar.data.length > 0 && bipolar.data[0].ube != null
			? bipolar.data[0].ube
			: false,
	);

	const [otherIllness, setOtherIllness] = useState(
		other.data.length > 0 && other.data[0].illness != null
			? other.data[0].illness
			: "",
	);

	const [otherMedication, setOtherMedication] = useState(
		other.data.length > 0 && other.data[0].medication != null
			? other.data[0].medication
			: "",
	);

	const [otherDose, setOtherDose] = useState(
		other.data.length > 0 && other.data[0].dose != null
			? other.data[0].dose
			: "",
	);

	const [otherFrequency, setOtherFrequency] = useState(
		other.data.length > 0 && other.data[0].frequency != null
			? other.data[0].frequency
			: "",
	);

	const [otherUBE, setOtherUBE] = useState(
		other.data.length > 0 && other.data[0].ube != null
			? other.data[0].ube
			: false,
	);

	const handleDepressionChange = (newStatus) => {
		setDepressionStatus(newStatus);
		if (!newStatus) {
			setDepressionMedication(""); // Clear fields when "No" is selected
			setDepressionDose("");
			setDepressionFrequency("");
			setDepressionUBE(false);
		}
	};

	const handleAnxietyChange = (newStatus) => {
		setAnxietyStatus(newStatus);
		if (!newStatus) {
			setAnxietyMedication("");
			setAnxietyDose("");
			setAnxietyFrequency("");
			setAnxietyUBE(false);
		}
	};

	const handleTOCChange = (newStatus) => {
		setTOCStatus(newStatus);
		if (!newStatus) {
			setTOCMedication("");
			setTOCDose("");
			setTOCFrequency("");
			setTOCUBE(false);
		}
	};

	const handleTDAHChange = (newStatus) => {
		setTDAHStatus(newStatus);
		if (!newStatus) {
			setTDAHMedication("");
			setTDAHDose("");
			setTDAHFrequency("");
			setTDAHUBE(false);
		}
	};

	const handleBipolarChange = (newStatus) => {
		setBipolarStatus(newStatus);
		if (!newStatus) {
			setBipolarMedication("");
			setBipolarDose("");
			setBipolarFrequency("");
			setBipolarUBE(false);
		}
	};

	const handleOtherChange = (newStatus) => {
		setOtherStatus(newStatus);
		if (!newStatus) {
			setOtherIllness("");
			setOtherMedication("");
			setOtherDose("");
			setOtherFrequency("");
			setOtherUBE(false);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				width: "100%",
				height: "100%",
				gap: "1.5rem",
			}}
		>
			<div
				style={{
					border: `1px solid ${colors.primaryBackground}`,
					borderRadius: "10px",
					padding: "1rem",
					height: "65vh",
					flex: 1,
					overflowY: "auto",
				}}
			>
				{errorMessage ? (
					<div
						style={{
							color: "red",
							paddingTop: "1rem",
							textAlign: "center",
							fontFamily: fonts.titleFont,
							fontSize: fontSize.textSize,
						}}
					>
						{errorMessage}
					</div>
				) : (
					<>
						{isFirstTime && (
							<div
								style={{
									paddingTop: "1rem",
									textAlign: "center",
									color: colors.titleText,
									fontWeight: "bold",
									fontFamily: fonts.textFont,
									fontSize: fontSize.textSize,
								}}
							>
								Por favor, ingrese los datos del paciente. Parece que es su
								primera visita aquí.
							</div>
						)}
						<div
							style={{
								display: "flex",
								gap: "1rem",
								justifyContent: "flex-end",
								width: "100%",
							}}
						>
							{!isFirstTime &&
								(isEditable ? (
									<div style={{ display: "flex", gap: "1rem" }}>
										<IconButton
											icon={CheckIcon}
											onClick={handleSaveNewHistory}
										/>
										<IconButton
											icon={CancelIcon}
											onClick={() => {
												setIsEditable(false);
											}}
										/>
									</div>
								) : (
									<IconButton
										icon={EditIcon}
										onClick={() => setIsEditable(true)}
									/>
								))}
						</div>
						<div
							style={{
								borderBottom: `0.1rem solid ${colors.darkerGrey}`,
								padding: "2rem 0 2rem 1rem",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "start",
									flexDirection: "column",
								}}
							>
								<p
									style={{
										paddingBottom: "0.5rem",
										paddingTop: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									¿Tiene depresion?
								</p>
								<div
									style={{
										display: "flex",
										gap: "1rem",
										alignItems: "center",
										paddingLeft: "0.5rem",
										paddingBottom: "0.5rem",
									}}
								>
									<RadioInput
										name="depression"
										checked={depressionStatus}
										onChange={() => handleDepressionChange(true)}
										label="Sí"
										disabled={!isEditable}
									/>
									<RadioInput
										name="depression"
										checked={!depressionStatus}
										onChange={() => handleDepressionChange(false)}
										label="No"
										disabled={!isEditable}
									/>
								</div>
							</div>

							{depressionStatus && (
								<div
									style={{
										borderRadius: "10px",
										height: "10vh",
										flex: 1.5,
										overflowY: "auto",
										width: "100%",
										paddingLeft: "0.5rem",
									}}
								>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Medicamento:
									</p>
									<BaseInput
										value={depressionMedication}
										onChange={(e) => setDepressionMedication(e.target.value)}
										placeholder="Ingrese el medicamento administrado (terapia entra en la categoría)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Dosis:
									</p>
									<BaseInput
										value={depressionDose}
										onChange={(e) => setDepressionDose(e.target.value)}
										placeholder="Ingrese cuánto. Ej. 50mg (Este campo es opcional)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Frecuencia:
									</p>
									<BaseInput
										value={depressionFrequency}
										onChange={(e) => setDepressionFrequency(e.target.value)}
										placeholder="Ingrese cada cuándo administra el medicamento. (Ej. Cada dos días, cada 12 horas...)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										¿Tiene seguimiento en UBE?
									</p>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											alignItems: "center",
											paddingLeft: "0.5rem",
											paddingBottom: "2rem",
										}}
									>
										<RadioInput
											label="Si"
											name="ube"
											checked={depressionUBE === true}
											onChange={() => setDepressionUBE(true)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
										<RadioInput
											label="No"
											name="ube"
											checked={depressionUBE === false}
											onChange={() => setDepressionUBE(false)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
									</div>
								</div>
							)}
						</div>

						<div
							style={{
								borderBottom: `0.1rem solid ${colors.darkerGrey}`,
								padding: "2rem 0 2rem 1rem",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "start",
									flexDirection: "column",
								}}
							>
								<p
									style={{
										paddingBottom: "0.5rem",
										paddingTop: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									¿Tiene ansiedad?
								</p>
								<div
									style={{
										display: "flex",
										gap: "1rem",
										alignItems: "center",
										paddingLeft: "0.5rem",
										paddingBottom: "0.5rem",
									}}
								>
									<RadioInput
										name="anxiety"
										checked={anxietyStatus}
										onChange={() => handleAnxietyChange(true)}
										label="Sí"
										disabled={!isEditable}
									/>
									<RadioInput
										name="anxiety"
										checked={!anxietyStatus}
										onChange={() => handleAnxietyChange(false)}
										label="No"
										disabled={!isEditable}
									/>
								</div>
							</div>

							{anxietyStatus && (
								<div
									style={{
										borderRadius: "10px",
										height: "10vh",
										flex: 1.5,
										overflowY: "auto",
										width: "100%",
										paddingLeft: "0.5rem",
									}}
								>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Medicamento:
									</p>
									<BaseInput
										value={anxietyMedication}
										onChange={(e) => setAnxietyMedication(e.target.value)}
										placeholder="Ingrese el medicamento administrado (terapia entra en la categoría)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Dosis:
									</p>
									<BaseInput
										value={anxietyDose}
										onChange={(e) => setAnxietyDose(e.target.value)}
										placeholder="Ingrese cuánto. Ej. 50mg (Este campo es opcional)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Frecuencia:
									</p>
									<BaseInput
										value={anxietyFrequency}
										onChange={(e) => setAnxietyFrequency(e.target.value)}
										placeholder="Ingrese cada cuándo administra el medicamento. (Ej. Cada dos días, cada 12 horas...)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										¿Tiene seguimiento en UBE?
									</p>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											alignItems: "center",
											paddingLeft: "0.5rem",
											paddingBottom: "2rem",
										}}
									>
										<RadioInput
											label="Si"
											name="ube"
											checked={anxietyUBE === true}
											onChange={() => setAnxietyUBE(true)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
										<RadioInput
											label="No"
											name="ube"
											checked={anxietyUBE === false}
											onChange={() => setAnxietyUBE(false)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
									</div>
								</div>
							)}
						</div>

						<div
							style={{
								borderBottom: `0.1rem solid ${colors.darkerGrey}`,
								padding: "2rem 0 2rem 1rem",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "start",
									flexDirection: "column",
								}}
							>
								<p
									style={{
										paddingBottom: "0.5rem",
										paddingTop: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									¿Tiene trastorno obsesivo compulsivo?
								</p>
								<div
									style={{
										display: "flex",
										gap: "1rem",
										alignItems: "center",
										paddingLeft: "0.5rem",
										paddingBottom: "0.5rem",
									}}
								>
									<RadioInput
										name="TOC"
										checked={TOCStatus}
										onChange={() => handleTOCChange(true)}
										label="Sí"
										disabled={!isEditable}
									/>
									<RadioInput
										name="TOC"
										checked={!TOCStatus}
										onChange={() => handleTOCChange(false)}
										label="No"
										disabled={!isEditable}
									/>
								</div>
							</div>

							{TOCStatus && (
								<div
									style={{
										borderRadius: "10px",
										height: "10vh",
										flex: 1.5,
										overflowY: "auto",
										width: "100%",
										paddingLeft: "0.5rem",
									}}
								>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Medicamento:
									</p>
									<BaseInput
										value={TOCMedication}
										onChange={(e) => setTOCMedication(e.target.value)}
										placeholder="Ingrese el medicamento administrado (terapia entra en la categoría)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Dosis:
									</p>
									<BaseInput
										value={TOCDose}
										onChange={(e) => setTOCDose(e.target.value)}
										placeholder="Ingrese cuánto. Ej. 50mg (Este campo es opcional)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Frecuencia:
									</p>
									<BaseInput
										value={TOCFrequency}
										onChange={(e) => setTOCFrequency(e.target.value)}
										placeholder="Ingrese cada cuándo administra el medicamento. (Ej. Cada dos días, cada 12 horas...)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										¿Tiene seguimiento en UBE?
									</p>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											alignItems: "center",
											paddingLeft: "0.5rem",
											paddingBottom: "2rem",
										}}
									>
										<RadioInput
											label="Si"
											name="ube"
											checked={TOCUBE === true}
											onChange={() => setTOCUBE(true)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
										<RadioInput
											label="No"
											name="ube"
											checked={TOCUBE === false}
											onChange={() => setTOCUBE(false)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
									</div>
								</div>
							)}
						</div>

						<div
							style={{
								borderBottom: `0.1rem solid ${colors.darkerGrey}`,
								padding: "2rem 0 2rem 1rem",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "start",
									flexDirection: "column",
								}}
							>
								<p
									style={{
										paddingBottom: "0.5rem",
										paddingTop: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									¿Tiene TDAH (Trastorno por Déficit de Atención e
									Hiperactivida)?
								</p>
								<div
									style={{
										display: "flex",
										gap: "1rem",
										alignItems: "center",
										paddingLeft: "0.5rem",
										paddingBottom: "0.5rem",
									}}
								>
									<RadioInput
										name="TDAH"
										checked={TDAHStatus}
										onChange={() => handleTDAHChange(true)}
										label="Sí"
										disabled={!isEditable}
									/>
									<RadioInput
										name="TDAH"
										checked={!TDAHStatus}
										onChange={() => handleTDAHChange(false)}
										label="No"
										disabled={!isEditable}
									/>
								</div>
							</div>

							{TDAHStatus && (
								<div
									style={{
										borderRadius: "10px",
										height: "10vh",
										flex: 1.5,
										overflowY: "auto",
										width: "100%",
										paddingLeft: "0.5rem",
									}}
								>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Medicamento:
									</p>
									<BaseInput
										value={TDAHMedication}
										onChange={(e) => setTDAHMedication(e.target.value)}
										placeholder="Ingrese el medicamento administrado (terapia entra en la categoría)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Dosis:
									</p>
									<BaseInput
										value={TDAHDose}
										onChange={(e) => setTDAHDose(e.target.value)}
										placeholder="Ingrese cuánto. Ej. 50mg (Este campo es opcional)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Frecuencia:
									</p>
									<BaseInput
										value={TDAHFrequency}
										onChange={(e) => setTDAHFrequency(e.target.value)}
										placeholder="Ingrese cada cuándo administra el medicamento. (Ej. Cada dos días, cada 12 horas...)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										¿Tiene seguimiento en UBE?
									</p>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											alignItems: "center",
											paddingLeft: "0.5rem",
											paddingBottom: "2rem",
										}}
									>
										<RadioInput
											label="Si"
											name="ube"
											checked={TDAHUBE === true}
											onChange={() => setTDAHUBE(true)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
										<RadioInput
											label="No"
											name="ube"
											checked={TDAHUBE === false}
											onChange={() => setTDAHUBE(false)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
									</div>
								</div>
							)}
						</div>

						<div
							style={{
								borderBottom: `0.1rem solid ${colors.darkerGrey}`,
								padding: "2rem 0 2rem 1rem",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "start",
									flexDirection: "column",
								}}
							>
								<p
									style={{
										paddingBottom: "0.5rem",
										paddingTop: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									¿Tiene trastorno bipolar?
								</p>
								<div
									style={{
										display: "flex",
										gap: "1rem",
										alignItems: "center",
										paddingLeft: "0.5rem",
										paddingBottom: "0.5rem",
									}}
								>
									<RadioInput
										name="TOC"
										checked={BipolarStatus}
										onChange={() => handleBipolarChange(true)}
										label="Sí"
										disabled={!isEditable}
									/>
									<RadioInput
										name="TOC"
										checked={!BipolarStatus}
										onChange={() => handleBipolarChange(false)}
										label="No"
										disabled={!isEditable}
									/>
								</div>
							</div>

							{BipolarStatus && (
								<div
									style={{
										borderRadius: "10px",
										height: "10vh",
										flex: 1.5,
										overflowY: "auto",
										width: "100%",
										paddingLeft: "0.5rem",
									}}
								>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Medicamento:
									</p>
									<BaseInput
										value={bipolarMedication}
										onChange={(e) => setBipolarMedication(e.target.value)}
										placeholder="Ingrese el medicamento administrado (terapia entra en la categoría)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Dosis:
									</p>
									<BaseInput
										value={bipolarDose}
										onChange={(e) => setBipolarDose(e.target.value)}
										placeholder="Ingrese cuánto. Ej. 50mg (Este campo es opcional)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Frecuencia:
									</p>
									<BaseInput
										value={bipolarFrequency}
										onChange={(e) => setBipolarFrequency(e.target.value)}
										placeholder="Ingrese cada cuándo administra el medicamento. (Ej. Cada dos días, cada 12 horas...)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										¿Tiene seguimiento en UBE?
									</p>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											alignItems: "center",
											paddingLeft: "0.5rem",
											paddingBottom: "2rem",
										}}
									>
										<RadioInput
											label="Si"
											name="ube"
											checked={bipolarUBE === true}
											onChange={() => setBipolarUBE(true)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
										<RadioInput
											label="No"
											name="ube"
											checked={bipolarUBE === false}
											onChange={() => setBipolarUBE(false)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
									</div>
								</div>
							)}
						</div>

						<div
							style={{
								borderBottom: `0.1rem solid ${colors.darkerGrey}`,
								padding: "2rem 0 2rem 1rem",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "start",
									flexDirection: "column",
								}}
							>
								<p
									style={{
										paddingBottom: "0.5rem",
										paddingTop: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									¿Otro?
								</p>
								<div
									style={{
										display: "flex",
										gap: "1rem",
										alignItems: "center",
										paddingLeft: "0.5rem",
										paddingBottom: "0.5rem",
									}}
								>
									<RadioInput
										name="TOC"
										checked={OtherStatus}
										onChange={() => handleOtherChange(true)}
										label="Sí"
										disabled={!isEditable}
									/>
									<RadioInput
										name="TOC"
										checked={!OtherStatus}
										onChange={() => handleOtherChange(false)}
										label="No"
										disabled={!isEditable}
									/>
								</div>
							</div>

							{OtherStatus && (
								<div
									style={{
										borderRadius: "10px",
										height: "10vh",
										flex: 1.5,
										overflowY: "auto",
										width: "100%",
										paddingLeft: "0.5rem",
									}}
								>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										¿Cuál es la condición?
									</p>
									<BaseInput
										value={otherIllness}
										onChange={(e) => setOtherIllness(e.target.value)}
										placeholder="Ingrese la condición"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Medicamento:
									</p>
									<BaseInput
										value={otherMedication}
										onChange={(e) => setOtherMedication(e.target.value)}
										placeholder="Ingrese el medicamento administrado (terapia entra en la categoría)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Dosis:
									</p>
									<BaseInput
										value={otherDose}
										onChange={(e) => setOtherDose(e.target.value)}
										placeholder="Ingrese cuánto. Ej. 50mg (Este campo es opcional)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										Frecuencia:
									</p>
									<BaseInput
										value={otherFrequency}
										onChange={(e) => setOtherFrequency(e.target.value)}
										placeholder="Ingrese cada cuándo administra el medicamento. (Ej. Cada dos días, cada 12 horas...)"
										style={{
											width: "90%",
											height: "3rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									<p
										style={{
											paddingBottom: "0.5rem",
											paddingTop: "2rem",
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
										}}
									>
										¿Tiene seguimiento en UBE?
									</p>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											alignItems: "center",
											paddingLeft: "0.5rem",
											paddingBottom: "2rem",
										}}
									>
										<RadioInput
											label="Si"
											name="ube"
											checked={otherUBE === true}
											onChange={() => setOtherUBE(true)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
										<RadioInput
											label="No"
											name="ube"
											checked={otherUBE === false}
											onChange={() => setOtherUBE(false)}
											style={{ label: { fontFamily: fonts.textFont } }}
										/>
									</div>
								</div>
							)}
						</div>

						{isFirstTime && (
							<div
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<BaseButton
									text="Guardar"
									onClick={handleSaveNewHistory}
									style={{ width: "30%", height: "3rem" }}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
