import { Suspense, useEffect, useState, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import { BaseInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import StudentDashboardTopbar from "src/components/StudentDashboardTopBar";
import useWindowSize from "src/utils/useWindowSize";
import { getErrorMessage } from "src/utils/errorhandlerstoasts";

/**
 * @typedef {Object} PsichiatricHistoryProps
 * @property {Function} getPsichiatricHistory - Function to fetch the allergic history of a patient.
 * @property {Function} updateStudentPsychiatricHistory - Function to update or add new allergic records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's allergic history, allowing users to add and view records.
 *
 * @param {PsichiatricHistoryProps} props - The props passed to the PsichiatricHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */

export function StudentPsichiatricHistory({
	getPsichiatricHistory,
	updateStudentPsychiatricHistory,
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
				flexDirection: "column",
				backgroundColor: colors.primaryBackground,
				minHeight: "100vh",
				padding: "2rem",
			}}
		>
			<div
				style={{
					backgroundColor: colors.secondaryBackground,
					padding: "2rem",
					borderRadius: "0.625rem",
					overflow: "auto",
					flex: "1",
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
						Antecedentes Psiquiátricos
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
						¿Actualmente se encuentra bajo tratamiento médico por alguna de las
						siguientes enfermedades?
					</h3>
				</div>

				<Suspense fallback={<LoadingView />}>
					<PsichiatricView
						id={id}
						psichiatricHistoryResource={psichiatricHistoryResource}
						updateStudentPsychiatricHistory={updateStudentPsychiatricHistory}
						triggerReload={triggerReload}
					/>
				</Suspense>
			</div>

			<div
				style={{
					width: "100%",
					padding: "1rem 0 0 0",
					flex: "0 0 20%",
				}}
			>
				<StudentDashboardTopbar
					{...sidebarConfig}
					activeSectionProp="psiquiatricos"
				/>
			</div>
		</div>
	);
}

function useCondition(
	initialData = [],
	initialUBE = false,
	isFirstTime = false,
) {
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

	const [UBE, setUBE] = useState(initialUBE || false);

	useEffect(() => {
		if (!isFirstTime) {
			setStatus(
				initialData.length > 0 &&
					initialData.some((item) => item.medication || item.illness),
			);
			setMedications(
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
						],
			);
			setUBE(initialUBE || false);
		}
	}, [initialData, isFirstTime, initialUBE]);

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
	};
}

/**
 * @typedef {Object} PsichiatricViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} psichiatricHistoryResource - Wrapped resource for fetching psichiatric history data.
 * @property {Function} updateStudentPsychiatricHistory - Function to update the Allergic history.
 * @property {Function} triggerReload - Function to trigger reloading of data.
 * Internal view component for managing the display and modification of a patient's psichiatric history, with options to add or edit records.
 *
 *
 * @param {PsichiatricViewProps} props - Specific props for the PsichiatricViewiew component.
 * @returns {JSX.Element} - A detailed view for managing Psichiatric history with interactivity to add or edit records.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
function PsichiatricView({
	id,
	psichiatricHistoryResource,
	updateStudentPsychiatricHistory,
	triggerReload,
}) {
	const psichiatricHistoryResult = psichiatricHistoryResource.read();
	const psichiatricHistoryData = psichiatricHistoryResult.result || {};
	const { width } = useWindowSize();
	const isMobile = width < 768;

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
	console.log(psichiatricHistoryResult);

	const isFirstTime = !(
		medicalHistory.depression.data.length ||
		medicalHistory.anxiety.data.length ||
		medicalHistory.ocd.data.length ||
		medicalHistory.adhd.data.length ||
		medicalHistory.bipolar.data.length ||
		medicalHistory.other.data.length
	);

	const depressionCondition = useCondition(
		medicalHistory.depression.data,
		medicalHistory.depression.data[0]?.ube,
		isFirstTime,
	);

	const anxietyCondition = useCondition(
		medicalHistory.anxiety.data,
		medicalHistory.anxiety.data[0]?.ube,
		isFirstTime,
	);

	const ocdCondition = useCondition(
		medicalHistory.ocd.data,
		medicalHistory.ocd.data[0]?.ube,
		isFirstTime,
	);

	const adhdCondition = useCondition(
		medicalHistory.adhd.data,
		medicalHistory.adhd.data[0]?.ube,
		isFirstTime,
	);

	const bipolarCondition = useCondition(
		medicalHistory.bipolar.data,
		medicalHistory.bipolar.data[0]?.ube,
		isFirstTime,
	);

	const otherCondition = useCondition(
		medicalHistory.other.data,
		medicalHistory.other.data[0]?.ube,
		isFirstTime,
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

	const buttonStyles = isMobile
		? {
				height: "3rem",
			}
		: {
				height: "3rem",
				minWidth: "15rem",
			};

	const inputStyles = isMobile
		? {
				width: "90%",
				height: "3rem",
				fontFamily: fonts.textFont,
				fontSize: "1rem",
			}
		: {
				width: "70%",
				height: "3rem",
				fontFamily: fonts.textFont,
				fontSize: "1rem",
			};

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

	const handleSaveNewHistory = async () => {
		if (!validateInputs()) return;

		toast.info("Guardando antecedentes psiquiátricos...");

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
			const result = await updateStudentPsychiatricHistory(id, newHistoryData);
			console.log(newHistoryData);
			if (!result.error) {
				toast.success("Antecedentes psiquiátricos guardados con éxito.");
				triggerReload();
			} else {
				toast.error("Error al guardar los datos.");
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`);
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
										borderBottom: `0.04rem solid ${colors.darkerGrey}`,
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
													/>
												</div>
											</div>
										</div>
									</div>

									{status && (
										<div style={{ paddingLeft: "0.5rem" }}>
											{medications.map((medication, index) => (
												<div
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
																style={{ ...inputStyles }}
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
														placeholder="Ingrese el medicamento administrado"
														style={{ ...inputStyles }}
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
														style={{ ...inputStyles }}
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
														style={{ ...inputStyles }}
													/>
												</div>
											))}
											<div
												style={{
													borderTop: `0.04rem solid ${colors.darkerGrey}`,
													paddingTop: "2rem",
													paddingBottom: "1.5rem",
													display: "flex",
													flexDirection: "column",
												}}
											>
												<p
													style={{
														paddingBottom: "0.5rem",
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
														paddingBottom: "1rem",
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
													/>
												</div>
											</div>
											{/* Botones para agregar y eliminar medicamentos */}
											<div
												style={{
													borderTop: `0.04rem solid ${colors.darkerGrey}`,
													paddingTop: "2rem",
													display: "flex",
													flexDirection: isMobile ? "column" : "row",
													justifyContent: "center",
													alignItems: "center",
												}}
											>
												<BaseButton
													text="Agregar otro medicamento"
													onClick={addMedication}
													style={{ ...buttonStyles }}
												/>
												{medications.length > 1 && (
													<>
														<div
															style={{
																width: "1rem",
																paddingTop: isMobile ? "0.5rem" : "0rem",
															}}
														/>
														<BaseButton
															text="Eliminar último medicamento"
															onClick={removeLastMedication}
															style={{
																...buttonStyles,
																backgroundColor: colors.secondaryBackground,
																color: colors.primaryBackground,
																border: `1.5px solid ${colors.primaryBackground}`,
															}}
														/>
													</>
												)}
											</div>
										</div>
									)}
								</div>
							);
						})}

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
								onClick={handleSaveNewHistory}
								style={{ width: "35%", height: "3rem" }}
							/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
