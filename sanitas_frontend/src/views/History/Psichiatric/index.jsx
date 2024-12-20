import { Suspense, useEffect, useState, useMemo, useRef } from "react";
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
import { getErrorMessage } from "src/utils/errorhandlerstoasts";

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
	const [reload, setReload] = useState(false); // Controls reload toggling for refetching data

	// Memoizing resources for blood type and history to avoid refetching unless ID changes or a reload is triggered
	// biome-ignore  lint/correctness/useExhaustiveDependencies: Reload the page
	const psichiatricHistoryResource = useMemo(
		() => WrapPromise(getPsichiatricHistory(id)),
		[id, reload, getPsichiatricHistory],
	);

	const triggerReload = () => {
		setReload((prev) => !prev);
	};

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
 * Custom hook for managing the state of a specific psychiatric condition,
 * including medications and UBE follow-up status.
 *
 * @param {Array} initialData Initial array of medication objects.
 * @param {boolean} initialUBE Initial follow-up status under UBE.
 * @param {boolean} isFirstTime Flag indicating whether the patient's data is being loaded for the first time.
 * @returns {Object} Object containing various state and functions to manage the psychiatric condition.
 */
function useCondition(initialData, initialUBE, isEditable) {
	const [status, setStatus] = useState(
		initialData.length > 0 &&
			initialData.some((item) => item.medication || item.illness),
	);

	const [medications, setMedications] = useState(
		initialData.length > 0 &&
			initialData.some((item) => item.medication || item.illness)
			? initialData.map((item) => ({
					medication: item.medication || "",
					dose: item.dose || "",
					frequency: item.frequency || "",
					illness: item.illness || "",
					isNew: false,
				}))
			: [{ medication: "", dose: "", frequency: "", illness: "", isNew: true }],
	);

	const [UBE, setUBE] = useState(initialUBE);

	const originalData = useRef(null);

	useEffect(() => {
		if (!isEditable) {
			const newStatus =
				initialData.length > 0 &&
				initialData.some((item) => item.medication || item.illness);
			const newMedications =
				initialData.length > 0 &&
				initialData.some((item) => item.medication || item.illness)
					? initialData.map((item) => ({
							medication: item.medication || "",
							dose: item.dose || "",
							frequency: item.frequency || "",
							illness: item.illness || "",
							isNew: false,
						}))
					: [
							{
								medication: "",
								dose: "",
								frequency: "",
								illness: "",
								isNew: true,
							},
						];

			setStatus(newStatus);
			setMedications(newMedications);
			setUBE(initialUBE);

			// Actualizar originalData.current solo cuando no se está editando
			originalData.current = {
				status: newStatus,
				medications: newMedications,
				UBE: initialUBE,
			};
		}
	}, [initialData, initialUBE, isEditable]);

	const addMedication = () => {
		setMedications([
			...medications,
			{ medication: "", dose: "", frequency: "", illness: "", isNew: true },
		]);
	};

	const removeLastMedication = () => {
		setMedications((prev) => prev.slice(0, -1));
	};

	const handleMedicationChange = (index, field, value) => {
		const newMedications = [...medications];
		newMedications[index][field] = value;
		setMedications(newMedications);
	};

	const handleStatusChange = (newStatus) => {
		setStatus(newStatus);
		if (!newStatus) {
			setMedications([
				{ medication: "", dose: "", frequency: "", illness: "", isNew: true },
			]);
			setUBE(false);
		}
	};

	const handleUBEChange = (newUBE) => {
		setUBE(newUBE);
	};

	const resetToOriginal = () => {
		if (originalData.current) {
			setStatus(originalData.current.status);
			setMedications(originalData.current.medications);
			setUBE(originalData.current.UBE);
		}
	};

	const updateOriginalData = () => {
		originalData.current = {
			status,
			medications,
			UBE,
		};
	};

	return {
		status,
		setStatus,
		medications,
		addMedication,
		removeLastMedication,
		handleMedicationChange,
		UBE,
		setUBE: handleUBEChange,
		handleStatusChange,
		resetToOriginal,
		updateOriginalData,
	};
}

/**
 * @typedef {Object} PsichiatricViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} psichiatricHistoryResource - Wrapped resource for fetching psichiatric history data.
 * @property {Function} updatePsichiatricHistory - Function to update the Allergic history.
 * @property {Function} triggerReload - Function to trigger reloading of data.
 * Internal view component for managing the display and modification of a patient's psichiatric history, with options to add or edit records.
 *
 *
 * @param {PsichiatricViewProps} props - Specific props for the PsichiatricViewiew component.
 * @returns {JSX.Element} - A detailed view for managing Psichiatric history with interactivity to add or edit records.
 */
function PsichiatricView({
	id,
	psichiatricHistoryResource,
	updatePsichiatricHistory,
	triggerReload,
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

	let errorMessage = "";
	if (psichiatricHistoryResult.error) {
		const error = psichiatricHistoryResult.error;
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
	} else if (psichiatricHistoryResult.result?.patientId === 0) {
		errorMessage =
			"Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!";
	}

	const isFirstTime = Object.values(medicalHistory).some(
		(condition) =>
			typeof condition.data === "object" &&
			!Array.isArray(condition.data) &&
			condition.data !== null &&
			Object.keys(condition.data).length !== 0,
	);

	const [isEditable, setIsEditable] = useState(isFirstTime);

	const depressionCondition = useCondition(
		medicalHistory.depression.data,
		medicalHistory.depression.data[0]?.ube,
		isEditable,
	);

	const anxietyCondition = useCondition(
		medicalHistory.anxiety.data,
		medicalHistory.anxiety.data[0]?.ube,
		isEditable,
	);

	const ocdCondition = useCondition(
		medicalHistory.ocd.data,
		medicalHistory.ocd.data[0]?.ube,
		isEditable,
	);

	const adhdCondition = useCondition(
		medicalHistory.adhd.data,
		medicalHistory.adhd.data[0]?.ube,
		isEditable,
	);

	const bipolarCondition = useCondition(
		medicalHistory.bipolar.data,
		medicalHistory.bipolar.data[0]?.ube,
		isEditable,
	);

	const otherCondition = useCondition(
		medicalHistory.other.data,
		medicalHistory.other.data[0]?.ube,
		isEditable,
	);

	const sections = {
		depression: {
			label: "¿Tiene depresión?",
			condition: depressionCondition,
		},
		anxiety: {
			label: "¿Tiene ansiedad?",
			condition: anxietyCondition,
		},
		ocd: {
			label: "¿Tiene TOC (Trastorno Obsesivo Compulsivo)?",
			condition: ocdCondition,
		},
		adhd: {
			label:
				"¿Tiene TDAH (Trastorno por Déficit de Atención e Hiperactividad)?",
			condition: adhdCondition,
		},
		bipolar: {
			label: "¿Tiene Trastorno Bipolar?",
			condition: bipolarCondition,
		},
		other: {
			label: "¿Tiene otra condición?",
			condition: otherCondition,
		},
	};

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Validate user inputs
	const validateInputs = () => {
		for (const [key, section] of Object.entries(sections)) {
			const { status, medications } = section.condition;

			if (status) {
				for (let i = 0; i < medications.length; i++) {
					const med = medications[i];
					if (!med.medication) {
						toast.error(
							`Por favor, ingresa el medicamento para ${section.label.toLowerCase()} (${i + 1}).`,
						);
						return false;
					}
					if (!med.frequency) {
						toast.error(
							`Por favor, ingresa la frecuencia para ${section.label.toLowerCase()} (${i + 1}).`,
						);
						return false;
					}
					if (key === "other" && !med.illness.trim()) {
						toast.error("Por favor, ingresa la condición en Otros.");
						return false;
					}
				}
			}
		}
		return true;
	};

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Save psycho history
	const handleSaveNewHistory = async () => {
		if (!validateInputs()) return;

		const isUpdating = !isFirstTime;

		toast.info(
			isUpdating
				? "Actualizando antecedentes psiquiátricos..."
				: "Guardando antecedentes psiquiátricos...",
		);

		const newHistoryData = {};

		for (const [key, section] of Object.entries(sections)) {
			const { medications, UBE, status } = section.condition;
			const version = medicalHistory[key]?.version || 1;

			let data;
			if (status) {
				data = medications.map((medication) => ({
					medication: medication.medication,
					dose: medication.dose,
					frequency: medication.frequency,
					ube: UBE,
					...(key === "other" && { illness: medication.illness || "" }),
				}));
			} else {
				data = [];
			}

			newHistoryData[key] = {
				version,
				data,
			};
		}

		try {
			const result = await updatePsichiatricHistory(id, newHistoryData);
			if (!result.error) {
				toast.success(
					isUpdating
						? "Antecedentes psiquiátricos actualizados con éxito."
						: "Antecedentes psiquiátricos guardados con éxito.",
				);
				for (const section of Object.values(sections)) {
					section.condition.updateOriginalData();
				}

				setIsEditable(false);
				triggerReload();
			} else {
				toast.error(getErrorMessage(result, "psiquiátricos"));
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`);
		}
	};

	const handleCancel = () => {
		for (const section of Object.values(sections)) {
			section.condition.resetToOriginal();
		}
		setIsEditable(false);
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
								Por favor ingrese sus datos, parece que es su primera vez aquí.
							</div>
						)}

						{Object.entries(sections).map(([key, section]) => {
							const {
								status,
								medications,
								UBE,
								setUBE,
								addMedication,
								removeLastMedication,
								handleMedicationChange,
								handleStatusChange,
							} = section.condition;

							return (
								<div
									key={key}
									style={{
										borderBottom: `0.1rem solid ${colors.darkerGrey}`,
										padding: "0 0 2rem 1rem",
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
										<div
											style={{
												display: "flex",
												flexDirection: "row",
												justifyContent: "space-between",
												width: "100%",
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
														paddingBottom: "0.7rem",
														paddingTop: "2rem",
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
													}}
												>
													{section.label}
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
														name={key}
														checked={status}
														onChange={() => handleStatusChange(true)}
														label="Sí"
														style={{
															label: {
																fontFamily: fonts.textFont,
																fontSize: fontSize.textSize,
															},
														}}
														disabled={!isEditable}
													/>
													<RadioInput
														name={key}
														checked={!status}
														onChange={() => handleStatusChange(false)}
														label="No"
														style={{
															label: {
																fontFamily: fonts.textFont,
																fontSize: fontSize.textSize,
															},
														}}
														disabled={!isEditable}
													/>
												</div>
											</div>

											{key === "depression" && (
												<div
													style={{
														display: "flex",
														justifyContent: "flex-end",
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
																	onClick={handleCancel}
																/>
															</div>
														) : (
															<IconButton
																icon={EditIcon}
																onClick={() => setIsEditable(true)}
															/>
														))}
												</div>
											)}
										</div>
									</div>

									{status && (
										<div style={{ paddingLeft: "0.5rem" }}>
											{medications.map((medication, index) => (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: Affects in user adding meds
													key={`${key}-medication-${index}`}
													style={{ marginBottom: "1rem" }}
												>
													{key === "other" && (
														<div>
															<div
																style={{
																	padding: "1rem",
																	borderBottom: `0.04rem  solid ${colors.darkerGrey}`,
																}}
															/>
															<p
																style={{
																	paddingTop: "1.5rem",
																	paddingBottom: "0.5rem",
																	fontFamily: fonts.textFont,
																	fontSize: fontSize.textSize,
																}}
															>
																¿Cuál es la condición?
															</p>
															<BaseInput
																value={medication.illness}
																onChange={(e) =>
																	handleMedicationChange(
																		index,
																		"illness",
																		e.target.value,
																	)
																}
																placeholder="Ingrese información adicional"
																style={{
																	width: "90%",
																	height: "3rem",
																	fontFamily: fonts.textFont,
																	fontSize: "1rem",
																}}
																disabled={!isEditable}
															/>
														</div>
													)}
													<div
														style={{
															padding: "1rem",
															borderBottom: `0.04rem  solid ${colors.darkerGrey}`,
														}}
													/>
													<p
														style={{
															paddingBottom: "0.5rem",
															paddingTop: "2rem",
															fontFamily: fonts.textFont,
															fontSize: fontSize.textSize,
															fontWeight: "bold",
														}}
													>
														Medicamento {index + 1}:
													</p>
													<BaseInput
														value={medication.medication}
														onChange={(e) =>
															handleMedicationChange(
																index,
																"medication",
																e.target.value,
															)
														}
														placeholder="Ingrese el medicamento administrado (terapia cuenta como medicamento)"
														style={{
															width: "90%",
															height: "3rem",
															fontFamily: fonts.textFont,
															fontSize: "1rem",
														}}
														disabled={!isEditable}
													/>
													<p
														style={{
															paddingBottom: "0.5rem",
															paddingTop: "2rem",
															fontFamily: fonts.textFont,
															fontSize: fontSize.textSize,
														}}
													>
														Dosis {index + 1}:
													</p>
													<BaseInput
														value={medication.dose}
														onChange={(e) =>
															handleMedicationChange(
																index,
																"dose",
																e.target.value,
															)
														}
														placeholder="Ingrese cuánto (opcional)"
														style={{
															width: "90%",
															height: "3rem",
															fontFamily: fonts.textFont,
															fontSize: "1rem",
														}}
														disabled={!isEditable}
													/>
													<p
														style={{
															paddingBottom: "0.5rem",
															paddingTop: "2rem",
															fontFamily: fonts.textFont,
															fontSize: fontSize.textSize,
														}}
													>
														Frecuencia {index + 1}:
													</p>
													<BaseInput
														value={medication.frequency}
														onChange={(e) =>
															handleMedicationChange(
																index,
																"frequency",
																e.target.value,
															)
														}
														placeholder="Ingrese cada cuánto administra el medicamento"
														style={{
															width: "90%",
															height: "3rem",
															fontFamily: fonts.textFont,
															fontSize: "1rem",
														}}
														disabled={!isEditable}
													/>
												</div>
											))}
											<p
												style={{
													paddingBottom: "0.5rem",
													paddingTop: "1rem",
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
													label="Sí"
													name={`${key}-ube`}
													checked={UBE}
													onChange={() => setUBE(true)}
													style={{
														label: {
															fontFamily: fonts.textFont,
															fontSize: fontSize.textSize,
														},
													}}
													disabled={!isEditable}
												/>
												<RadioInput
													label="No"
													name={`${key}-ube`}
													checked={!UBE}
													onChange={() => setUBE(false)}
													style={{
														label: {
															fontFamily: fonts.textFont,
															fontSize: fontSize.textSize,
														},
													}}
													disabled={!isEditable}
												/>
											</div>

											{isEditable && (
												<div
													style={{
														borderTop: `0.1rem solid ${colors.darkerGrey}`,
														paddingTop: "2rem",
														display: "flex",
														justifyContent: "center",
													}}
												>
													<BaseButton
														text="Agregar otro medicamento"
														onClick={addMedication}
														style={{
															width: "20%",
															height: "3rem",
															border: `1.5px solid ${colors.primaryBackground}`,
														}}
													/>

													<div style={{ width: "1rem" }} />
													{medications.length > 1 && (
														<BaseButton
															text="Eliminar último medicamento"
															onClick={removeLastMedication}
															style={{
																width: "20%",
																height: "3rem",
																backgroundColor: colors.secondaryBackground,
																color: colors.primaryBackground,
																border: `1.5px solid ${colors.primaryBackground}`,
															}}
														/>
													)}
												</div>
											)}
										</div>
									)}
								</div>
							);
						})}
					</>
				)}

				{isFirstTime && !errorMessage && (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							paddingTop: "2rem",
						}}
					>
						<BaseButton
							text="Guardar"
							onClick={handleSaveNewHistory}
							style={{ width: "30%", height: "3rem" }}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
