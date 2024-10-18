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
import useWindowSize from "src/utils/useWindowSize";

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

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				backgroundColor: colors.primaryBackground,
				minHeight: "100vh",
				padding: "2rem",
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

			<div
				style={{
					backgroundColor: colors.secondaryBackground,
					padding: "2rem",
					borderRadius: "0.625rem",
					overflow: "auto",
					flex: "1",
					display: "flex",
					flexDirection: "column",
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
							textAlign: "center",
						}}
					>
						Antecedentes No Patológicos
					</h1>
					<h3
						style={{
							fontFamily: fonts.textFont,
							fontWeight: "normal",
							fontSize: fontSize.subtitleSize,
							paddingTop: "0.7rem",
							paddingBottom: "1.3rem",
							textAlign: "center",
						}}
					>
						Por favor, completa la información solicitada; será tratada con
						estricta confidencialidad.
					</h3>
				</div>

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
	const { width } = useWindowSize();
	const isMobile = width < 768;

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
		smoker.data &&
			smoker.data.cigarettesPerDay != null &&
			smoker.data.cigarettesPerDay !== 0
			? smoker.data.cigarettesPerDay.toString()
			: "",
	);
	const [smokingYears, setSmokingYears] = useState(
		smoker.data && smoker.data.years != null && smoker.data.years !== 0
			? smoker.data.years.toString()
			: "",
	);

	const [alcoholConsumption, setAlcoholConsumption] = useState(
		drink.data ? drink.data.drinks : false,
	);
	const [drinksPerMonth, setDrinksPerMonth] = useState(
		drink.data &&
			drink.data.drinksPerMonth != null &&
			drink.data.drinksPerMonth !== 0
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
	const [showSaveButton, setShowSaveButton] = useState(true);

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
			// Deshabilitar todos los campos después de guardar
			setIsSmokingEditable(false);
			setIsAlcoholEditable(false);
			setIsDrugUseEditable(false);
			setShowSaveButton(false); // Ocultar el botón de guardar
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

		setSmokingStatus(smokerData?.data?.smokes ?? false);
		setCigarettesPerDay(
			smokerData?.data?.cigarettesPerDay > 0
				? smokerData.data.cigarettesPerDay.toString()
				: "",
		);
		setSmokingYears(
			smokerData?.data?.years > 0 ? smokerData.data.years.toString() : "",
		);
		setIsSmokingEditable(!smokerData?.data.smokes); // Deshabilitar si ya se guardó

		setAlcoholConsumption(drinkData?.data?.drinks ?? false);
		setDrinksPerMonth(
			drinkData?.data?.drinksPerMonth > 0
				? drinkData.data.drinksPerMonth.toString()
				: "",
		);
		setIsAlcoholEditable(!drinkData?.data.drinks); // Deshabilitar si ya se guardó

		setDrugUse(drugsData?.data?.usesDrugs ?? false);
		setDrugType(drugsData?.data?.drugType ?? "");
		setDrugFrequency(
			drugsData?.data?.frequency ? drugsData.data.frequency.toString() : "",
		);
		setIsDrugUseEditable(!drugsData?.data.usesDrugs); // Deshabilitar si ya se guardó
	}, [nonPathologicalHistoryResult]);

	const handleSmokingChange = (newStatus) => {
		setSmokingStatus(newStatus);
		setIsSmokingEditable(
			!nonPathologicalHistoryData?.medicalHistory.smoker.data.smokes,
		); // Deshabilitar si ya se guardó
	};

	const handleAlcoholChange = (newStatus) => {
		setAlcoholConsumption(newStatus);
		setIsAlcoholEditable(
			!nonPathologicalHistoryData?.medicalHistory.drink.data.drinks,
		); // Deshabilitar si ya se guardó
	};

	const handleDrugUseChange = (newStatus) => {
		setDrugUse(newStatus);
		setIsDrugUseEditable(
			!nonPathologicalHistoryData?.medicalHistory.drugs.data.usesDrugs,
		); // Deshabilitar si ya se guardó
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

	const dobleQInputs = isMobile
		? {
				display: "column",
				gap: "1rem",
				paddingBottom: "2rem",
			}
		: {
				display: "flex",
				gap: "1rem",
				paddingBottom: "2rem",
			};

	const dobleQLabels = isMobile
		? {
				paddingTop: "1rem",
				paddingBottom: "0.5rem",
				fontFamily: fonts.textFont,
				fontSize: fontSize.textSize,
			}
		: {
				paddingTop: "0rem",
				paddingBottom: "0.5rem",
				fontFamily: fonts.textFont,
				fontSize: fontSize.textSize,
			};

	const baseInput = isMobile
		? {
				width: "90%",
				height: "2.5rem",
				fontFamily: fonts.textFont,
				fontSize: "1rem",
			}
		: {
				width: "20rem",
				height: "2.5rem",
				fontFamily: fonts.textFont,
				fontSize: "1rem",
			};

	// Agrega esta función de utilidad en algún lugar apropiado de tu componente
	const handleNumericInput = (value, setter) => {
		// Permite solo dígitos y vacío
		if (value === "" || /^[0-9]+$/.test(value)) {
			setter(value);
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
								<div style={{ display: "flex", alignItems: "center" }}>
									<BaseInput
										type="text"
										value={bloodTypeResult?.result?.bloodType ?? ""}
										readOnly
										placeholder="Tipo de sangre:"
										style={{
											width: isMobile ? "13rem" : "20rem",
											height: "2.5rem",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
									/>
									{(!bloodTypeResult?.result?.bloodType ||
										bloodTypeResult?.result?.bloodType === "") && (
										<span
											style={{
												marginLeft: "1rem",
												color: colors.warning,
												fontFamily: fonts.textFont,
												fontSize: fontSize.smallText,
											}}
										>
											Por favor completar la información de tipo de sangre en la
											sección de generales
										</span>
									)}
								</div>
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
									disabled={false} // Siempre habilitado para cambiar antes de guardar
								/>
								<RadioInput
									name="smoking"
									checked={!smokingStatus}
									onChange={() => handleSmokingChange(false)}
									label="No"
									disabled={false} // Siempre habilitado para cambiar antes de guardar
								/>
							</div>
							{smokingStatus && (
								<div style={{ display: "flex", flexDirection: "column" }}>
									<div style={{ ...dobleQInputs }}>
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
												onChange={(e) =>
													handleNumericInput(
														e.target.value,
														setCigarettesPerDay,
													)
												}
												onKeyDown={(e) => {
													if (
														!/[0-9]/.test(e.key) &&
														e.key !== "Backspace" &&
														e.key !== "Delete" &&
														e.key !== "ArrowLeft" &&
														e.key !== "ArrowRight"
													) {
														e.preventDefault();
													}
												}}
												readOnly={!isSmokingEditable}
												placeholder="Ingrese cuántos cigarrillos al día"
												style={{ ...baseInput }}
											/>
										</div>
										<div>
											<p style={{ ...dobleQLabels }}>
												¿Desde hace cuántos años?
											</p>
											<BaseInput
												type="number"
												value={smokingYears}
												onChange={(e) =>
													handleNumericInput(e.target.value, setSmokingYears)
												}
												onKeyDown={(e) => {
													if (
														!/[0-9]/.test(e.key) &&
														e.key !== "Backspace" &&
														e.key !== "Delete" &&
														e.key !== "ArrowLeft" &&
														e.key !== "ArrowRight"
													) {
														e.preventDefault();
													}
												}}
												readOnly={!isSmokingEditable}
												placeholder="Ingrese desde hace cuántos años"
												style={{ ...baseInput }}
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
									disabled={false} // Siempre habilitado para cambiar antes de guardar
								/>
								<RadioInput
									name="alcoholConsumption"
									checked={!alcoholConsumption}
									onChange={() => handleAlcoholChange(false)}
									label="No"
									disabled={false} // Siempre habilitado para cambiar antes de guardar
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
												onChange={(e) =>
													handleNumericInput(e.target.value, setDrinksPerMonth)
												}
												placeholder="Ingrese cuántas bebidas al mes"
												style={{ ...baseInput }}
												readOnly={!isAlcoholEditable} // Deshabilitar si ya se guardó
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
									disabled={false} // Siempre habilitado para cambiar antes de guardar
								/>
								<RadioInput
									name="drugUse"
									checked={!drugUse}
									onChange={() => handleDrugUseChange(false)}
									label="No"
									disabled={false} // Siempre habilitado para cambiar antes de guardar
								/>
							</div>
							{drugUse && (
								<div style={{ display: "flex", flexDirection: "column" }}>
									<div style={{ ...dobleQInputs }}>
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
												style={{ ...baseInput }}
											/>
										</div>
										<div>
											<p style={{ ...dobleQLabels }}>¿Con qué frecuencia?</p>
											<BaseInput
												type="text"
												value={drugFrequency}
												onChange={(e) => setDrugFrequency(e.target.value)}
												placeholder="Ingrese la frecuencia del consumo"
												readOnly={!isDrugUseEditable}
												style={{ ...baseInput }}
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
								{showSaveButton && (
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
								)}
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}
