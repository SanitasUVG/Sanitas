import { Suspense, useMemo, useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import { BaseInput } from "src/components/Input/index";
import { RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import StudentDashboardTopbar from "src/components/StudentDashboardTopBar";

/**
 * Component responsible for managing and displaying non-pathological history information of a patient.
 * It uses various subcomponents and utilities to display the data and handle state management.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.getNonPathologicalHistory - Function to fetch non-pathological history data.
 * @param {Function} props.getBloodTypePatientInfo - Function to fetch blood type information of the patient.
 * @param {Function} props.updateStudentNonPathologicalHistory - Function to update the non-pathological history.
 * @param {Object} props.sidebarConfig - Configuration properties for the sidebar component.
 * @param {Function} props.useStore - Custom hook for accessing the global state to retrieve the selected patient ID.
 * @returns {JSX.Element} The NonPathologicalHistory component visual structure.
 */
export function StudentNonPathologicalHistory({
	getNonPathologicalHistory,
	getBloodTypePatientInfo,
	updateStudentNonPathologicalHistory,
	sidebarConfig,
	useStore,
}) {
	const [reload, setReload] = useState(false); // Controls reload toggling for refetching data

	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	// Fetching patient ID from global state
	const id = useStore((s) => s.selectedPatientId);
	//const id = 1;

	// Memoizing resources for blood type and history to avoid refetching unless ID changes or a reload is triggered
	// biome-ignore  lint/correctness/useExhaustiveDependencies: Reload the page
	const bloodTypeResource = useMemo(
		() => WrapPromise(getBloodTypePatientInfo(id)),
		[id, reload, getBloodTypePatientInfo],
	);
	// biome-ignore  lint/correctness/useExhaustiveDependencies: Reload the page
	const nonPathologicalHistoryResource = useMemo(
		() => WrapPromise(getNonPathologicalHistory(id)),
		[id, reload, getNonPathologicalHistory],
	);

	// Triggers a state change to force reloading of data
	const triggerReload = () => {
		setReload((prev) => !prev);
	};

	// Suspense fallback component
	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes no patológicos..." />
		);
	};

	const getResponsiveStyles = (width) => {
		const isMobile = width < 768;
		return {
			title: {
				color: colors.titleText,
				fontFamily: fonts.titleFont,
				fontSize: fontSize.titleSize,
				textAlign: isMobile ? "center" : "left", // Centrar el título en móviles
			},
			subtitle: {
				fontFamily: fonts.textFont,
				fontWeight: "normal",
				fontSize: fontSize.subtitleSize,
				paddingTop: "0.5rem",
				paddingBottom: "3rem",
				textAlign: isMobile ? "center" : "left",
			},
			container: {
				display: "flex",
				flexDirection: isMobile ? "column" : "row",
				backgroundColor: colors.primaryBackground,
				minHeight: "100vh",
				overflow: isMobile ? "auto" : "none",
				padding: "2rem",
			},
			innerContent: {
				backgroundColor: colors.secondaryBackground,
				padding: "2rem",
				borderRadius: "0.625rem",
				overflow: "auto",
				minHeight: "84vh",
				flex: 1,
			},
		};
	};

	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const styles = getResponsiveStyles(windowWidth);

	return (
		<div style={styles.container}>
			<div
				style={{
					height: "100%",
					width: "100%",
				}}
			>
				<div
					style={{
						width: "100%",
						padding: "0 0 1rem 0",
						flex: "0 0 20%",
					}}
				>
					<StudentDashboardTopbar
						{...sidebarConfig}
						activeSectionProp="no_patologicos"
					/>
				</div>

				<div style={styles.innerContent}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<h1 style={styles.title}>Antecedentes No Patológicos</h1>
						<h3 style={styles.subtitle}>
							Por favor, completa la información solicitada; será tratada con
							estricta confidencialidad.
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
							<NonPathologicalView
								id={id}
								nonPathologicalHistoryResource={nonPathologicalHistoryResource}
								bloodTypeResource={bloodTypeResource}
								updateStudentNonPathologicalHistory={
									updateStudentNonPathologicalHistory
								}
								triggerReload={triggerReload}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Renders and manages the UI for displaying and editing non-pathological health records of a patient.
 * Handles user inputs, displays current health records, and allows modifications.
 *
 * @typedef {Object} NonPathologicalViewProps
 * @property {string} id - Unique identifier for the patient.
 * @property {Object} nonPathologicalHistoryResource - Promise-based resource for non-pathological history data.
 * @property {Object} bloodTypeResource - Promise-based resource for blood type data.
 * @property {Function} updateStudentNonPathologicalHistory - Function to update the non-pathological history records.
 * @property {Function} triggerReload - Function to trigger reloading of data.
 *
 * @param {NonPathologicalViewProps} props - Props passed to NonPathologicalView component.
 * @returns {JSX.Element} - Rendered view for managing non-pathological history.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Is the main function of the view
function NonPathologicalView({
	id,
	nonPathologicalHistoryResource,
	bloodTypeResource,
	updateStudentNonPathologicalHistory,
	triggerReload,
}) {
	// Reading the results from the provided resources.
	const nonPathologicalHistoryResult = nonPathologicalHistoryResource.read();
	const bloodTypeResult = bloodTypeResource.read();

	// Extracting data from the fetched results, defaulting to predefined values if not found.
	const {
		smoker = { data: { smokes: false, cigarettesPerDay: "", years: "" } },
		drink = { data: { drinks: false, drinksPerMonth: "" } },
		drugs = { data: { usesDrugs: false, drugType: "", frequency: "" } },
	} = nonPathologicalHistoryResult.result?.medicalHistory || {};

	// State hooks for managing the input values.
	const [smokingStatus, setSmokingStatus] = useState(
		smoker.data ? smoker.data.smokes : false,
	);
	const [cigarettesPerDay, setCigarettesPerDay] = useState(
		smoker.data && smoker.data.cigarettesPerDay != null
			? smoker.data.cigarettesPerDay.toString()
			: "",
	);
	const [smokingYears, setSmokingYears] = useState(
		smoker.data && smoker.data.years != null
			? smoker.data.years.toString()
			: "",
	);

	const [alcoholConsumption, setAlcoholConsumption] = useState(
		drink.data ? drink.data.drinks : false,
	);
	const [drinksPerMonth, setDrinksPerMonth] = useState(
		drink.data && drink.data.drinksPerMonth != null
			? drink.data.drinksPerMonth.toString()
			: "",
	);

	const [drugUse, setDrugUse] = useState(
		drugs.data ? drugs.data.usesDrugs : false,
	);
	const [drugType, setDrugType] = useState(
		drugs.data ? drugs.data.drugType : "",
	);
	const [drugFrequency, setDrugFrequency] = useState(
		drugs.data && drugs.data.frequency != null
			? drugs.data.frequency.toString()
			: "",
	);

	const [isSmokingEditable, setIsSmokingEditable] = useState(false);
	const [isAlcoholEditable, setIsAlcoholEditable] = useState(false);
	const [isDrugUseEditable, setIsDrugUseEditable] = useState(false);

	// Error handling based on the response status.
	let errorMessage = "";
	if (nonPathologicalHistoryResult.error) {
		const error = nonPathologicalHistoryResult.error;
		if (error?.response) {
			const { status } = error.response;
			if (status < 500) {
				errorMessage =
					"Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!";
			} else {
				errorMessage = "Ha ocurrido un error interno, lo sentimos.";
			}
		} else {
			errorMessage =
				"Ha ocurrido un error procesando tu solicitud, por favor vuelve a intentarlo.";
		}
	}
	if (bloodTypeResult.error) {
		const error = bloodTypeResult.error;
		if (error?.response) {
			const { status } = error.response;
			if (status < 500) {
				errorMessage =
					"Ha ocurrido un error en la búsqueda del tipo de sangre, ¡Por favor vuelve a intentarlo!";
			} else {
				errorMessage = "Ha ocurrido un error interno, lo sentimos.";
			}
		} else {
			errorMessage =
				"Ha ocurrido un error procesando tu solicitud para obtener el tipo de sangre, por favor vuelve a intentarlo.";
		}
	}

	const nonPathologicalHistoryData = nonPathologicalHistoryResult.result;

	// Checking if it is the user's first time to display a different UI.
	const isFirstTime = !(
		(smoker.data.cigarettesPerDay !== null &&
			smoker.data.cigarettesPerDay !== undefined &&
			smoker.data.cigarettesPerDay !== 0) ||
		(smoker.data.howManyYears !== null &&
			smoker.data.howManyYears !== undefined &&
			smoker.data.howManyYears !== 0) ||
		(drink.data.drinksPerMonth !== null &&
			drink.data.drinksPerMonth !== undefined &&
			drink.data.drinksPerMonth !== 0) ||
		drugs.data.whichOne?.trim() !== "" ||
		drugs.data.frequency?.trim() !== ""
	);

	const validateSmokingDetails = () => {
		if (
			smokingStatus &&
			(cigarettesPerDay === "" || Number.parseInt(cigarettesPerDay) < 1)
		) {
			toast.error(
				"Por favor, ingrese la cantidad de cigarrillos al día (mayor que cero).",
			);
			return false;
		}
		if (
			smokingStatus &&
			(smokingYears === "" || Number.parseInt(smokingYears) < 1)
		) {
			toast.error("Por favor, ingrese desde hace cuántos años ha fumado.");
			return false;
		}
		return true;
	};

	const validateAlcoholConsumption = () => {
		if (
			alcoholConsumption &&
			(drinksPerMonth === "" || Number.parseInt(drinksPerMonth) < 1)
		) {
			toast.error(
				"Por favor, ingrese cuántas bebidas alcohólicas consume al mes (mayor que cero).",
			);
			return false;
		}
		return true;
	};

	const validateDrugUse = () => {
		if (
			drugUse &&
			(drugType === "" ||
				drugFrequency === "" ||
				Number.parseInt(drugFrequency) < 1)
		) {
			toast.error(
				"Por favor, complete todos los detalles del consumo de drogas.",
			);
			return false;
		}
		return true;
	};

	// Function to handle saving the changes to the server.
	// biome-ignore  lint/complexity/noExcessiveCognitiveComplexity: Save non pathological data
	const handleSaveNonPathological = async () => {
		if (!validateSmokingDetails()) return;
		if (!validateAlcoholConsumption()) return;
		if (!validateDrugUse()) return;

		const updateDetails = {
			bloodType: bloodTypeResult?.result?.bloodType,
			smoker: {
				version: nonPathologicalHistoryData?.medicalHistory.smoker.version || 1,
				data: {
					smokes: smokingStatus,
					cigarettesPerDay: !smokingStatus
						? 0
						: Number.parseInt(cigarettesPerDay) || 0,
					years: !smokingStatus ? 0 : Number.parseInt(smokingYears) || 0,
				},
			},
			drink: {
				version: nonPathologicalHistoryData?.medicalHistory.drink.version || 1,
				data: {
					drinks: alcoholConsumption,
					drinksPerMonth: !alcoholConsumption
						? 0
						: Number.parseInt(drinksPerMonth) || 0,
				},
			},
			drugs: {
				version: nonPathologicalHistoryData?.medicalHistory.drugs.version || 1,
				data: {
					usesDrugs: drugUse,
					drugType: drugUse ? drugType : "",
					frequency: drugUse ? drugFrequency : "",
				},
			},
		};

		toast.info("Guardando antecedente no patológico...");

		const result = await updateStudentNonPathologicalHistory(id, updateDetails);
		if (!result.error) {
			toast.success("Antecedentes no patológicos guardados con éxito.");
			triggerReload();
		} else {
			toast.error(
				`Error al guardar los antecedentes no patológicos: ${result.error}`,
			);
		}
	};

	useEffect(() => {
		const smokerData =
			nonPathologicalHistoryResult.result?.medicalHistory.smoker;
		const drinkData = nonPathologicalHistoryResult.result?.medicalHistory.drink;
		const drugsData = nonPathologicalHistoryResult.result?.medicalHistory.drugs;

		const initSmokingEditable =
			(smokerData?.data?.cigarettesPerDay ?? 0) === 0 &&
			(smokerData?.data?.years ?? 0) === 0;
		const initAlcoholEditable = (drinkData?.data?.drinksPerMonth ?? 0) === 0;
		const initDrugUseEditable =
			(drugsData?.data?.drugType ?? "") === "" &&
			(drugsData?.data?.frequency ?? "") === "";

		setSmokingStatus(smokerData?.data?.smokes ?? false);
		setCigarettesPerDay((smokerData?.data?.cigarettesPerDay ?? 0).toString());
		setSmokingYears((smokerData?.data?.years ?? 0).toString());
		setIsSmokingEditable(initSmokingEditable);

		setAlcoholConsumption(drinkData?.data?.drinks ?? false);
		setDrinksPerMonth((drinkData?.data?.drinksPerMonth ?? 0).toString());
		setIsAlcoholEditable(initAlcoholEditable);

		setDrugUse(drugsData?.data?.usesDrugs ?? false);
		setDrugType(drugsData?.data?.drugType ?? "");
		setDrugFrequency((drugsData?.data?.frequency ?? "").toString());
		setIsDrugUseEditable(initDrugUseEditable);
	}, [nonPathologicalHistoryResult]);

	// Ajustes en los manejadores para controlar la editabilidad correctamente
	const handleSmokingChange = (newStatus) => {
		setSmokingStatus(newStatus);
		if (
			!newStatus ||
			(Number.parseInt(cigarettesPerDay) === 0 &&
				Number.parseInt(smokingYears) === 0)
		) {
			setIsSmokingEditable(true);
		} else {
			setIsSmokingEditable(false);
		}
	};

	const handleAlcoholChange = (newStatus) => {
		setAlcoholConsumption(newStatus);
		if (!newStatus || Number.parseInt(drinksPerMonth) === 0) {
			setIsAlcoholEditable(true);
		} else {
			setIsAlcoholEditable(false);
		}
	};

	const handleDrugUseChange = (newStatus) => {
		setDrugUse(newStatus);
		if (!newStatus || (drugType === "" && drugFrequency === "")) {
			setIsDrugUseEditable(true);
		} else {
			setIsDrugUseEditable(false);
		}
	};

	const areAllFieldsPreFilled = () => {
		const smokerData =
			nonPathologicalHistoryResult.result?.medicalHistory.smoker.data;
		const drinkData =
			nonPathologicalHistoryResult.result?.medicalHistory.drink.data;
		const drugsData =
			nonPathologicalHistoryResult.result?.medicalHistory.drugs.data;

		return (
			smokerData.smokes &&
			smokerData.cigarettesPerDay &&
			smokerData.years &&
			drinkData.drinks &&
			drinkData.drinksPerMonth &&
			drugsData.usesDrugs &&
			drugsData.drugType.trim() !== "" &&
			drugsData.frequency.trim() !== ""
		);
	};

	const getResponsiveStyles = (width) => {
		const isMobile = width < 768;

		return {
			container: {
				display: "flex",
				flexDirection: isMobile ? "column" : "row",
				width: "100%",
				height: "100%",
				gap: "1.5rem",
			},
			innerContainer: {
				border: `1px solid ${colors.primaryBackground}`,
				borderRadius: "10px",
				padding: isMobile ? "0.5rem" : "1rem",
				height: "65vh",
				flex: 1,
				overflowY: "auto",
			},
			baseInput: {
				width: isMobile ? "12rem" : "20rem",
				height: "2.5rem",
				fontFamily: fonts.textFont,
				fontSize: "1rem",
			},
		};
	};

	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	useEffect(() => {
		const handleResize = () => {
			setWindowWidth(window.innerWidth);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const styles = getResponsiveStyles(windowWidth);

	return (
		<div style={styles.container}>
			<div style={styles.innerContainer}>
				{errorMessage ? (
					<div
						style={{
							color: "red",
							paddingTop: "1rem",
							paddingBottom: "1rem",
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
								Por favor ingrese sus datos, parece que es su primera vez aquí.
							</div>
						)}
						<div
							style={{
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
								padding: "2rem 0 2rem 1rem",
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
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
										marginRight: "1rem",
										paddingBottom: "0.5rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									Tipo de sangre:
								</p>
								<BaseInput
									type="text"
									value={bloodTypeResult?.result?.bloodType ?? ""}
									readOnly
									placeholder="Tipo de sangre:"
									style={styles.baseInput}
								/>
							</div>
						</div>
						<div
							style={{
								paddingLeft: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
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
								¿Fuma?
							</p>
							<div
								style={{
									display: "flex",
									gap: "1rem",
									alignItems: "center",
									paddingBottom: "2rem",
								}}
							>
								<RadioInput
									name="smoking"
									checked={smokingStatus}
									onChange={() => handleSmokingChange(true)}
									label="Sí"
									disabled={!isSmokingEditable}
								/>
								<RadioInput
									name="smoking"
									checked={!smokingStatus}
									onChange={() => handleSmokingChange(false)}
									label="No"
									disabled={!isSmokingEditable}
								/>
							</div>
							{smokingStatus && (
								<div style={{ display: "flex", flexDirection: "column" }}>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											paddingBottom: "2rem",
										}}
									>
										<div>
											<p
												style={{
													paddingBottom: "0.5rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												¿Cuántos cigarrillos al día?
											</p>
											<BaseInput
												type="number"
												value={cigarettesPerDay}
												onChange={(e) => setCigarettesPerDay(e.target.value)}
												placeholder="Ingrese cuántos cigarrillos al día"
												min="1"
												readOnly={!isSmokingEditable}
												style={{
													width: "20rem",
													height: "2.5rem",
													fontFamily: fonts.textFont,
													fontSize: "1rem",
												}}
											/>
										</div>
										<div>
											<p
												style={{
													paddingBottom: "0.5rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												¿Desde hace cuántos años?
											</p>
											<BaseInput
												type="number"
												value={smokingYears}
												onChange={(e) => setSmokingYears(e.target.value)}
												placeholder="Ingrese desde hace cuántos años"
												min="1"
												readOnly={!isSmokingEditable}
												style={{
													width: "20rem",
													height: "2.5rem",
													fontFamily: fonts.textFont,
													fontSize: "1rem",
												}}
											/>
										</div>
									</div>
								</div>
							)}
						</div>

						<div
							style={{
								paddingLeft: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
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
								¿Consumes bebidas alcohólicas?
							</p>
							<div
								style={{
									display: "flex",
									gap: "1rem",
									alignItems: "center",
									paddingBottom: "2rem",
								}}
							>
								<RadioInput
									name="alcoholConsumption"
									checked={alcoholConsumption}
									onChange={() => handleAlcoholChange(true)}
									label="Sí"
									disabled={!isAlcoholEditable}
								/>
								<RadioInput
									name="alcoholConsumption"
									checked={!alcoholConsumption}
									onChange={() => handleAlcoholChange(false)}
									label="No"
									disabled={!isAlcoholEditable}
								/>
							</div>
							{alcoholConsumption && (
								<div style={{ display: "flex", flexDirection: "column" }}>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											paddingBottom: "2rem",
										}}
									>
										<div>
											<p
												style={{
													paddingBottom: "0.5rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												¿Cuántas bebidas alcohólicas consumes al mes?
											</p>
											<BaseInput
												type="number"
												value={drinksPerMonth}
												onChange={(e) => setDrinksPerMonth(e.target.value)}
												placeholder="Ingrese cuántas bebidas al mes"
												min="1"
												readOnly={!isAlcoholEditable}
												style={{
													width: "20rem",
													height: "2.5rem",
													fontFamily: fonts.textFont,
													fontSize: "1rem",
												}}
											/>
										</div>
									</div>
								</div>
							)}
						</div>

						<div
							style={{
								paddingLeft: "1rem",
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
								¿Consumes alguna droga?
							</p>
							<div
								style={{
									display: "flex",
									gap: "1rem",
									alignItems: "center",
									paddingBottom: "2rem",
								}}
							>
								<RadioInput
									name="drugUse"
									checked={drugUse}
									onChange={() => handleDrugUseChange(true)}
									label="Sí"
									disabled={!isDrugUseEditable}
								/>
								<RadioInput
									name="drugUse"
									checked={!drugUse}
									onChange={() => handleDrugUseChange(false)}
									label="No"
									disabled={!isDrugUseEditable}
								/>
							</div>
							{drugUse && (
								<div style={{ display: "flex", flexDirection: "column" }}>
									<div
										style={{
											display: "flex",
											gap: "1rem",
											paddingBottom: "2rem",
										}}
									>
										<div>
											<p
												style={{
													paddingBottom: "0.5rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												¿Cuál?
											</p>
											<BaseInput
												type="text"
												value={drugType}
												onChange={(e) => setDrugType(e.target.value)}
												placeholder="Ingrese el tipo de droga"
												min="1"
												readOnly={!isDrugUseEditable}
												style={{
													width: "20rem",
													height: "2.5rem",
													fontFamily: fonts.textFont,
													fontSize: "1rem",
												}}
											/>
										</div>
										<div>
											<p
												style={{
													paddingBottom: "0.5rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												¿Con qué frecuencia?
											</p>
											<BaseInput
												type="text"
												value={drugFrequency}
												onChange={(e) => setDrugFrequency(e.target.value)}
												placeholder="Ingrese la frecuencia del consumo"
												readOnly={!isDrugUseEditable}
												style={{
													width: "20rem",
													height: "2.5rem",
													fontFamily: fonts.textFont,
													fontSize: "1rem",
												}}
											/>
										</div>
									</div>
								</div>
							)}
						</div>

						{!areAllFieldsPreFilled() && (
							<>
								<div
									style={{
										borderBottom: `0.04rem  solid ${colors.darkerGrey}`,
									}}
								/>
								<div
									style={{
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										padding: "2rem 0 1rem 0",
									}}
								>
									<BaseButton
										text="Guardar"
										onClick={handleSaveNonPathological}
										style={{ width: "30%", height: "3rem" }}
									/>
								</div>
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}
