import { Suspense, useMemo, useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import IconButton from "src/components/Button/Icon";
import DashboardSidebar from "src/components/DashboardSidebar";
import { BaseInput } from "src/components/Input/index";
import { RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import { getErrorMessage } from "scr/utils/errorhandlerstoasts";

/**
 * Component responsible for managing and displaying non-pathological history information of a patient.
 * It uses various subcomponents and utilities to display the data and handle state management.
 *
 * @param {Object} props - Component props.
 * @param {Function} props.getNonPathologicalHistory - Function to fetch non-pathological history data.
 * @param {Function} props.getBloodTypePatientInfo - Function to fetch blood type information of the patient.
 * @param {Function} props.updateNonPathologicalHistory - Function to update the non-pathological history.
 * @param {Object} props.sidebarConfig - Configuration properties for the sidebar component.
 * @param {Function} props.useStore - Custom hook for accessing the global state to retrieve the selected patient ID.
 * @returns {JSX.Element} The NonPathologicalHistory component visual structure.
 */
export function NonPathologicalHistory({
	getNonPathologicalHistory,
	getBloodTypePatientInfo,
	updateNonPathologicalHistory,
	sidebarConfig,
	useStore,
}) {
	const [reload, setReload] = useState(false); // Controls reload toggling for refetching data

	// Fetching patient ID from global state
	const id = useStore((s) => s.selectedPatientId);

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
							Antecedentes No Patológicos
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
							Registro de antecedentes no patológicos
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
								updateNonPathologicalHistory={updateNonPathologicalHistory}
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
 * @property {Function} updateNonPathologicalHistory - Function to update the non-pathological history records.
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
	updateNonPathologicalHistory,
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
		smoker.data &&
			smoker.data.cigarettesPerDay != null &&
			smoker.data.cigarettesPerDay !== 0
			? smoker.data.cigarettesPerDay.toString()
			: "",
	);
	const [smokingYears, setSmokingYears] = useState(
		smoker.data && smoker.data.years != null && smoker.data.howManyYears !== 0
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
		drugs.data && drugs.data.frequency != null && drugs.data.frequency !== ""
			? drugs.data.frequency.toString()
			: "",
	);

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
		(
			(smoker.data.cigarettesPerDay !== null &&
				smoker.data.cigarettesPerDay !== undefined &&
				smoker.data.cigarettesPerDay !== 0) ||
			(smoker.data.howManyYears !== null &&
				smoker.data.howManyYears !== undefined &&
				smoker.data.howManyYears !== 0) ||
			(drink.data.drinksPerMonth !== null &&
				drink.data.drinksPerMonth !== undefined &&
				drink.data.drinksPerMonth !== 0) ||
			drugs.data.whichOne?.trim() !== "" || // Usando encadenamiento opcional aquí
			drugs.data.frequency?.trim() !== ""
		) // Y aquí
	);
	// Edit mode state to toggle between view and edit modes.
	const [isEditable, setIsEditable] = useState(isFirstTime);

	// Original info
	const [originalSmokingStatus, setOriginalSmokingStatus] =
		useState(smokingStatus);
	const [originalCigarettesPerDay, setOriginalCigarettesPerDay] =
		useState(cigarettesPerDay);
	const [originalSmokingYears, setOriginalSmokingYears] =
		useState(smokingYears);
	const [originalAlcoholConsumption, setOriginalAlcoholConsumption] =
		useState(alcoholConsumption);
	const [originalDrinksPerMonth, setOriginalDrinksPerMonth] =
		useState(drinksPerMonth);
	const [originalDrugUse, setOriginalDrugUse] = useState(drugUse);
	const [originalDrugType, setOriginalDrugType] = useState(drugType);
	const [originalDrugFrequency, setOriginalDrugFrequency] =
		useState(drugFrequency);

	// biome-ignore lint/correctness/useExhaustiveDependencies: UseEffect for the cancel method
	useEffect(() => {
		setOriginalSmokingStatus(smokingStatus);
		setOriginalCigarettesPerDay(cigarettesPerDay);
		setOriginalSmokingYears(smokingYears);
		setOriginalAlcoholConsumption(alcoholConsumption);
		setOriginalDrinksPerMonth(drinksPerMonth);
		setOriginalDrugUse(drugUse);
		setOriginalDrugType(drugType);
		setOriginalDrugFrequency(drugFrequency);
	}, [nonPathologicalHistoryResult]);

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
			toast.error("Por favor, ingrese cuántos años ha fumado.");
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
				"Por favor, complete los detalles del consumo de drogas (mayor que cero).",
			);
			return false;
		}
		return true;
	};

	// Function to handle saving the changes to the server.
	// biome-ignore  lint/complexity/noExcessiveCognitiveComplexity: Save non pathological data
	const handleSaveNonPathological = async () => {
		const isUpdating = !!nonPathologicalHistoryData?.medicalHistory; // Determina si se está actualizando
		toast.info(
			isUpdating
				? "Actualizando antecedentes no patológicos..."
				: "Guardando antecedentes no patológicos...",
		); // Mensaje de inicio

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

		const result = await updateNonPathologicalHistory(id, updateDetails);
		if (!result.error) {
			toast.success("Antecedentes no patológicos actualizados con éxito.");
			setIsEditable(false);
			triggerReload();
		} else {
			toast.error(getErrorMessage(result, "paciente"));
		}
	};

	// Handler for smoking state
	const handleSmokingChange = (newStatus) => {
		setSmokingStatus(newStatus);
		if (!newStatus) {
			setCigarettesPerDay("");
			setSmokingYears("");
		}
	};

	// Handler for alcohol consumption
	const handleAlcoholChange = (newStatus) => {
		setAlcoholConsumption(newStatus);
		if (!newStatus) {
			setDrinksPerMonth("");
		}
	};

	// Handler for drug use
	const handleDrugUseChange = (newStatus) => {
		setDrugUse(newStatus);
		if (!newStatus) {
			setDrugType("");
			setDrugFrequency("");
		}
	};

	// Canceling update
	const handleCancel = () => {
		setIsEditable(false);
		setSmokingStatus(originalSmokingStatus);
		setCigarettesPerDay(originalCigarettesPerDay);
		setSmokingYears(originalSmokingYears);
		setAlcoholConsumption(originalAlcoholConsumption);
		setDrinksPerMonth(originalDrinksPerMonth);
		setDrugUse(originalDrugUse);
		setDrugType(originalDrugType);
		setDrugFrequency(originalDrugFrequency);
		toast.info("Edición cancelada.");
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
									Tipo de sangre (para editarlo, vaya a la pestaña "General"):
								</p>
								<BaseInput
									type="text"
									value={bloodTypeResult?.result?.bloodType ?? ""}
									readOnly
									placeholder="Tipo de sangre:"
									style={{
										width: "20rem",
										height: "2.5rem",
										fontFamily: fonts.textFont,
										fontSize: "1rem",
									}}
								/>
							</div>
							{!isFirstTime &&
								(isEditable ? (
									<div style={{ display: "flex", gap: "1rem" }}>
										<IconButton
											icon={CheckIcon}
											onClick={handleSaveNonPathological}
										/>
										<IconButton icon={CancelIcon} onClick={handleCancel} />
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
									disabled={!isEditable}
								/>
								<RadioInput
									name="smoking"
									checked={!smokingStatus}
									onChange={() => handleSmokingChange(false)}
									label="No"
									disabled={!isEditable}
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
												readOnly={!isEditable}
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
												readOnly={!isEditable}
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
									disabled={!isEditable}
								/>
								<RadioInput
									name="alcoholConsumption"
									checked={!alcoholConsumption}
									onChange={() => handleAlcoholChange(false)}
									label="No"
									disabled={!isEditable}
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
												readOnly={!isEditable}
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
									disabled={!isEditable}
								/>
								<RadioInput
									name="drugUse"
									checked={!drugUse}
									onChange={() => handleDrugUseChange(false)}
									label="No"
									disabled={!isEditable}
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
												readOnly={!isEditable}
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
												readOnly={!isEditable}
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
						{isFirstTime && (
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
