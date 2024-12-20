import React, { Suspense, useState, useEffect, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DropdownMenu from "src/components/DropdownMenu";
import InformationCard from "src/components/InformationCard";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import { BaseInput } from "src/components/Input/index";
import WrapPromise from "src/utils/promiseWrapper";
import StudentDashboardTopbar from "src/components/StudentDashboardTopBar";
import useWindowSize from "src/utils/useWindowSize";
import { getErrorMessage } from "src/utils/errorhandlerstoasts";

/**
 * @typedef {Object} StudentPersonalHistoryProps
 * @property {Function} getStudentPersonalHistory - Function to fetch the Personal history of a patient.
 * @property {Function} updateStudentPersonalHistory - Function to update or add new Personal records for a patient.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a student's Personal history, allowing users to add and view records.
 *
 * @param {StudentPersonalHistoryProps} props - The props passed to the StudentPersonalHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */
export function StudentPersonalHistory({
	getBirthdayPatientInfo,
	getStudentPersonalHistory,
	updateStudentPersonalHistory,
	sidebarConfig,
	useStore,
}) {
	const { width } = useWindowSize();
	const id = useStore((s) => s.selectedPatientId);

	const birthdayResource = useMemo(
		() => WrapPromise(getBirthdayPatientInfo(id)),
		[getBirthdayPatientInfo, id],
	);
	const personalHistoryResource = useMemo(
		() => WrapPromise(getStudentPersonalHistory(id)),
		[getStudentPersonalHistory, id],
	);

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes personales..." />
		);
	};

	const getResponsiveStyles = (width) => {
		const isMobile = width < 768;
		return {
			title: {
				color: colors.titleText,
				fontFamily: fonts.titleFont,
				fontSize: fontSize.titleSize,
				textAlign: isMobile ? "center" : "left",
			},
			subtitle: {
				fontFamily: fonts.textFont,
				fontWeight: "normal",
				fontSize: fontSize.subtitleSize,
				paddingTop: "0.5rem",
				paddingBottom: "0.5rem",
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
			},
			innerContainer: {
				border: `1px solid ${colors.primaryBackground}`,
				borderRadius: "10px",
				padding: "1rem",
				paddingLeft: isMobile ? "1rem" : "2rem",
				height: isMobile ? "55vh" : "65vh",
				overflowY: "auto",
				display: "flex",
				flexDirection: "column",
				"& > *:first-child": {},
			},
			addButton: {
				width: "100%",
				height: "3rem",
			},
		};
	};

	const styles = getResponsiveStyles(width);

	return (
		<div style={{ ...styles.container, overflow: "auto" }}>
			<div
				style={{
					height: "100%",
					width: "100%",
				}}
			>
				<div style={styles.innerContent}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<h1 style={styles.title}>Antecedentes Personales</h1>
						<h3 style={styles.subtitle}>
							¿Ha sido diagnosticado con alguna de las siguientes enfermedades?
						</h3>
						<h3
							style={{
								fontFamily: fonts.textFont,
								fontWeight: "normal",
								fontSize: fontSize.subtitleSize,
								paddingBottom: "1.5rem",
								textAlign: "center",
							}}
						>
							Si no recibe medicación para su condición, por favor indíquelo en
							el campo de medicamentos y frecuencia como "No me medico"
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
							<PersonalView
								id={id}
								birthdayResource={birthdayResource}
								personalHistoryResource={personalHistoryResource}
								updateStudentPersonalHistory={updateStudentPersonalHistory}
							/>
						</Suspense>
					</div>
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
						activeSectionProp="personales"
					/>
				</div>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} PersonalViewProps
 * @property {string} id - The unique identifier for the patient.
 * @property {Object} personalHistoryResource - Wrapped promise containing the personal history data.
 * @property {Function} updateStudentPersonalHistory - Function to update personal history records.
 *
 * This component handles the display and interaction of the personal medical history. It allows the user
 * to view existing records, add new entries, and manage interaction states like error handling and data submissions.
 *
 * @param {PersonalViewProps} props - The props used in the PersonalView component.
 * @returns {JSX.Element} - A section of the UI that lets users interact with the personal history data.
 */
// TODO: Simplify so the linter doesn't trigger
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: In the future we should think to simplify this...
function PersonalView({
	id,
	birthdayResource,
	personalHistoryResource,
	updateStudentPersonalHistory,
}) {
	// State hooks to manage the selected personal disease and whether adding a new entry
	const [selectedPersonal, setSelectedPersonal] = useState({});
	const [addingNew, setAddingNew] = useState(false);
	const [yearOptions, setYearOptions] = useState([]);
	const [isEditable, setIsEditable] = useState(false);

	const { width } = useWindowSize();

	// Read the data from the resource and handle any potential errors
	const personalHistoryResult = personalHistoryResource.read();
	const birthYearResult = birthdayResource.read();

	let errorMessage = "";
	if (personalHistoryResult.error) {
		const error = personalHistoryResult.error;
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

	// Extract the personal history data and establish initial state
	const personalHistoryData = personalHistoryResult.result;
	const [personalHistory, setPersonalHistory] = useState({
		hypertension: {
			data: personalHistoryData?.medicalHistory.hypertension.data || [],
			version: personalHistoryData?.medicalHistory.hypertension.version || 1,
		},
		diabetesMellitus: {
			data: personalHistoryData?.medicalHistory.diabetesMellitus.data || [],
			version:
				personalHistoryData?.medicalHistory.diabetesMellitus.version || 1,
		},
		hypothyroidism: {
			data: personalHistoryData?.medicalHistory.hypothyroidism.data || [],
			version: personalHistoryData?.medicalHistory.hypothyroidism.version || 1,
		},
		asthma: {
			data: personalHistoryData?.medicalHistory.asthma.data || [],
			version: personalHistoryData?.medicalHistory.asthma.version || 1,
		},
		convulsions: {
			data: personalHistoryData?.medicalHistory.convulsions.data || [],
			version: personalHistoryData?.medicalHistory.convulsions.version || 1,
		},
		myocardialInfarction: {
			data: personalHistoryData?.medicalHistory.myocardialInfarction.data || [],
			version:
				personalHistoryData?.medicalHistory.myocardialInfarction.version || 1,
		},
		cancer: {
			data: personalHistoryData?.medicalHistory.cancer.data || [],
			version: personalHistoryData?.medicalHistory.cancer.version || 1,
		},
		cardiacDiseases: {
			data: personalHistoryData?.medicalHistory.cardiacDiseases.data || [],
			version: personalHistoryData?.medicalHistory.cardiacDiseases.version || 1,
		},
		renalDiseases: {
			data: personalHistoryData?.medicalHistory.renalDiseases.data || [],
			version: personalHistoryData?.medicalHistory.renalDiseases.version || 1,
		},
		others: {
			data: personalHistoryData?.medicalHistory.others.data || [],
			version: personalHistoryData?.medicalHistory.others.version || 1,
		},
	});

	// No personal data in API
	const noPersonalData = Object.keys(personalHistory).every(
		(key) => personalHistory[key]?.data?.length === 0,
	);

	const currentYear = new Date().getFullYear();

	const birthYearData = birthYearResult.result;
	const birthYear = birthYearData?.birthdate
		? new Date(birthYearData.birthdate).getUTCFullYear()
		: null;

	useEffect(() => {
		const options = [];
		if (birthYear) {
			for (let year = birthYear; year <= currentYear; year++) {
				options.push({ value: year, label: year.toString() });
			}
		}
		setYearOptions(options);
	}, [birthYear, currentYear]);

	// Handlers for different actions within the component
	const handleOpenNewForm = () => {
		const initialDisease = "hypertension";
		setSelectedPersonal({ disease: initialDisease });
		setAddingNew(true);
		setIsEditable(true);
		validateDisease(initialDisease);
	};

	const validateDisease = (disease) => {
		// Validation to ensure the selected disease exists in the state
		if (!personalHistory[disease]) {
			toast.error("Por favor, selecciona una enfermedad válida.");
			return false;
		}
		return true;
	};

	// Handler for selecting a disease card, setting state to show details without adding new data
	const handleSelectDiseaseCard = (diseaseKey, entry) => {
		setSelectedPersonal({
			disease: diseaseKey,
			...entry,
		});
		setAddingNew(false);
		setIsEditable(false);
	};

	const handleCancel = () => {
		setSelectedPersonal({});
		setAddingNew(false);
	};

	// Changes the disease selection from the dropdown, resetting other fields
	const handleDiseaseChange = (e) => {
		const disease = e.target.value;
		setSelectedPersonal({
			disease: disease,
			relative: "",
			typeOfDisease: "",
		});
	};

	// Handles the saving of new or modified family medical history
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: In the future we should think to simplify this...
	const handleSaveNewPersonal = async () => {
		if (
			!(selectedPersonal.disease && personalHistory[selectedPersonal.disease])
		) {
			toast.error("Por favor, selecciona una enfermedad válida.");
			return;
		}

		const diseaseFieldsMap = {
			cancer: ["typeOfDisease", "treatment"],
			myocardialInfarction: ["surgeryYear"],
			hypertension: ["medicine", "frequency"],
			diabetesMellitus: ["medicine", "frequency"],
			hypothyroidism: ["medicine", "frequency"],
			asthma: ["medicine", "frequency"],
			convulsions: ["medicine", "frequency"],
			cardiacDiseases: ["typeOfDisease", "medicine", "frequency"],
			renalDiseases: ["typeOfDisease", "medicine", "frequency"],
			default: ["typeOfDisease", "medicine", "frequency"],
		};

		const optionalFieldsMap = {
			hypertension: ["dose"],
			diabetesMellitus: ["dose"],
			asthma: ["dose"],
			hypothyroidism: ["dose"],
			convulsions: ["dose"],
			cardiacDiseases: ["dose"],
			renalDiseases: ["dose"],
		};

		// Get the required fields for the selected disease or use default fields
		const requiredFields =
			diseaseFieldsMap[selectedPersonal.disease] || diseaseFieldsMap.default;
		const optionalFields = optionalFieldsMap[selectedPersonal.disease] || [];

		// Prepare new entry for saving
		const newEntry = {};
		for (const field of requiredFields) {
			newEntry[field] = selectedPersonal[field] || "";
		}

		for (const optionalField of optionalFields) {
			if (selectedPersonal[optionalField]) {
				newEntry[optionalField] = selectedPersonal[optionalField];
			}
		}

		// Validate required fields
		const missingFields = requiredFields.filter(
			(field) => !newEntry[field] || newEntry[field].trim() === "",
		);

		if (missingFields.length > 0) {
			toast.error("Complete todos los campos requeridos.");
			return;
		}

		toast.info("Guardando antecedente personal...");

		// Update the data for the current disease
		const updatedData = [
			...personalHistory[selectedPersonal.disease].data,
			newEntry,
		];
		const updatedHistory = {
			...personalHistory[selectedPersonal.disease],
			data: updatedData,
		};

		const updatedPersonalHistory = {
			...personalHistory,
			[selectedPersonal.disease]: updatedHistory,
		};

		try {
			const response = await updateStudentPersonalHistory(
				id,
				updatedPersonalHistory,
			);

			if (response.error) {
				toast.error(getErrorMessage(response, "personales"));
			} else {
				toast.success("Antecedente personal guardado con éxito.");
				setPersonalHistory(updatedPersonalHistory);
				setSelectedPersonal({});
				setAddingNew(false);
			}
		} catch (error) {
			console.error(error);
			toast.error("Error al conectar con el servidor");
		}
	};

	// Definitions of disease options for the dropdown
	const diseaseOptions = [
		{ label: "Hipertensión arterial", value: "hypertension" },
		{ label: "Diabetes Mellitus", value: "diabetesMellitus" },
		{ label: "Hipotiroidismo", value: "hypothyroidism" },
		{ label: "Asma", value: "asthma" },
		{ label: "Convulsiones", value: "convulsions" },
		{ label: "Infarto Agudo de Miocardio", value: "myocardialInfarction" },
		{ label: "Cáncer", value: "cancer" },
		{ label: "Enfermedades cardiacas", value: "cardiacDiseases" },
		{ label: "Enfermedades renales", value: "renalDiseases" },
		{ label: "Otros", value: "others" },
	];

	// Function to translate disease keys into more readable format
	const translateDisease = (diseaseKey) => {
		const translations = {
			hypertension: "Hipertensión arterial",
			diabetesMellitus: "Diabetes Mellitus",
			hypothyroidism: "Hipotiroidismo",
			asthma: "Asma",
			convulsions: "Convulsiones",
			myocardialInfarction: "Infarto Agudo de Miocardio",
			cancer: "Cáncer",
			cardiacDiseases: "Enfermedades cardiacas",
			renalDiseases: "Enfermedades renales",
			others: "Otros",
		};

		return translations[diseaseKey] || diseaseKey;
	};

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Provides responsive styles
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
			leftContainer: {
				flex: isMobile ? "0 0 100%" : 1,
				order: isMobile ? 2 : 1,
				transition: "flex 0.3s ease-in-out",
			},
			rightContainer: {
				flex: isMobile ? "0 0 100%" : 1,
				order: isMobile ? 1 : 2,
				transition: "flex 0.3s ease-in-out",
				display: addingNew || selectedPersonal.disease ? "block" : "none",
			},
			innerContainer: {
				border: `1px solid ${colors.primaryBackground}`,
				borderRadius: "10px",
				padding: "1rem",
				paddingLeft: isMobile ? "1rem" : "2rem",
				height: isMobile ? "60vh" : "65vh",
				overflowY: "auto",
				display: "flex",
				flexDirection: "column",
				"& button": {
					height: "3rem",
					fontSize: isMobile ? "0.875rem" : "1rem",
				},
			},
			addDiseaseContainer: {
				border: `1px solid ${colors.primaryBackground}`,
				borderRadius: "10px",
				padding: isMobile ? "1rem" : "2rem",
				height: isMobile ? "auto" : "65vh",
				overflowY: "auto",
				display: "flex",
				flexDirection: "column",
				"& button": {
					height: "3rem",
					fontSize: isMobile ? "0.875rem" : "1rem",
				},
			},
			baseInput: {
				width: isMobile ? "100%" : "90%",
				height: "3rem",
				fontFamily: fonts.textFont,
				fontSize: "1rem",
			},
			dropdownContainer: {
				width: isMobile ? "100%" : "90%",
			},
			dropdownSelect: {
				width: "100%",
			},
			buttonContainer: {
				display: "flex",
				flexDirection: isMobile ? "column" : "row",
				alignItems: "center",
				justifyContent: "center",
				gap: isMobile ? "1rem" : "1rem",
				paddingTop: "3rem",
			},
			button: {
				width: isMobile ? "100%" : "12rem",
				height: "3rem",
			},
			addButton: {
				width: "100%",
				height: "3rem",
			},
			formContent: {
				display: "flex",
				flexDirection: "column",
			},
			spacer: {
				flex: 1,
			},
		};
	};

	const styles = getResponsiveStyles(width);

	return (
		<div style={styles.container}>
			<div style={styles.leftContainer}>
				<div style={styles.innerContainer}>
					<div style={{ paddingBottom: "0.5rem" }}>
						<BaseButton
							text="Agregar antecedente personal"
							onClick={handleOpenNewForm}
							style={styles.addButton}
						/>
					</div>

					{errorMessage && (
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
					)}

					{noPersonalData && !errorMessage ? (
						<p style={{ textAlign: "center", paddingTop: "20px" }}>
							¡Parece que no hay antecedentes personales! Agrega uno en el botón
							de arriba.
						</p>
					) : (
						Object.entries(personalHistory).map(
							([diseaseKey, { data = [], version: _version }]) => {
								if (data.length === 0) {
									return null;
								}

								const displayedDisease = translateDisease(diseaseKey);
								if (diseaseKey === "myocardialInfarction") {
									return data.map((entry, _index) => {
										return (
											<InformationCard
												key={`${diseaseKey}-${entry.surgeryYear}`}
												type="personalMiocadio"
												disease={displayedDisease}
												year={entry.surgeryYear}
												onClick={() =>
													handleSelectDiseaseCard(diseaseKey, entry)
												}
											/>
										);
									});
								}

								return data.map((entry, _index) => {
									return (
										<InformationCard
											key={`${diseaseKey}-${entry.medicine}-${entry.treatment}`}
											type="personal"
											disease={displayedDisease}
											reasonInfo={
												entry.medicine ? entry.medicine : entry.treatment
											}
											onClick={() => handleSelectDiseaseCard(diseaseKey, entry)}
										/>
									);
								});
							},
						)
					)}
				</div>
			</div>

			<div style={styles.rightContainer}>
				{(addingNew || selectedPersonal.disease) && (
					<div style={styles.addDiseaseContainer}>
						<div style={styles.formContent}>
							<div style={styles.dropdownContainer}>
								<p
									style={{
										paddingBottom: "0.5rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
										fontWeight: "bold",
									}}
								>
									Seleccione la enfermedad:
								</p>
								<DropdownMenu
									options={diseaseOptions}
									value={selectedPersonal.disease || ""}
									onChange={handleDiseaseChange}
									style={{
										container: { width: "100%" },
										select: styles.dropdownSelect,
										option: {},
										indicator: {},
									}}
								/>
							</div>

							{selectedPersonal.disease && (
								<>
									{selectedPersonal.disease === "cancer" && (
										<React.Fragment>
											<p
												style={{
													paddingBottom: "0.5rem",
													paddingTop: "1.5rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												Tipo:
											</p>
											<BaseInput
												value={
													selectedPersonal.typeOfDisease
														? selectedPersonal.typeOfDisease
														: ""
												}
												onChange={(e) =>
													setSelectedPersonal({
														...selectedPersonal,
														typeOfDisease: e.target.value,
													})
												}
												disabled={!isEditable}
												placeholder="Especifique un único tipo de cáncer"
												style={styles.baseInput}
											/>

											<p
												style={{
													paddingBottom: "0.5rem",
													paddingTop: "1.5rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												Tratamiento:
											</p>
											<BaseInput
												value={
													selectedPersonal.treatment
														? selectedPersonal.treatment
														: ""
												}
												onChange={(e) =>
													setSelectedPersonal({
														...selectedPersonal,
														treatment: e.target.value,
													})
												}
												disabled={!isEditable}
												placeholder="Ingrese el tratamiento administrado"
												style={styles.baseInput}
											/>
										</React.Fragment>
									)}

									{selectedPersonal.disease === "myocardialInfarction" && (
										<React.Fragment>
											<p
												style={{
													paddingBottom: "0.5rem",
													paddingTop: "2rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												¿En qué año?
											</p>
											<DropdownMenu
												options={yearOptions}
												value={selectedPersonal.surgeryYear}
												disabled={!isEditable}
												onChange={(e) =>
													setSelectedPersonal({
														...selectedPersonal,
														surgeryYear: e.target.value,
													})
												}
												style={{
													container: {
														minWidth: "90%",
													},
												}}
											/>
										</React.Fragment>
									)}

									{selectedPersonal.disease !== "cancer" &&
										selectedPersonal.disease !== "myocardialInfarction" && (
											<React.Fragment>
												{selectedPersonal.disease !== "hypertension" &&
													selectedPersonal.disease !== "asthma" &&
													selectedPersonal.disease !== "convulsions" &&
													selectedPersonal.disease !== "diabetesMellitus" &&
													selectedPersonal.disease !== "hypothyroidism" && (
														<React.Fragment>
															<p
																style={{
																	paddingBottom: "0.5rem",
																	paddingTop: "1.5rem",
																	fontFamily: fonts.textFont,
																	fontSize: fontSize.textSize,
																}}
															>
																¿Qué enfermedad?
															</p>
															<BaseInput
																value={
																	selectedPersonal.typeOfDisease
																		? selectedPersonal.typeOfDisease
																		: ""
																}
																onChange={(e) =>
																	setSelectedPersonal({
																		...selectedPersonal,
																		typeOfDisease: e.target.value,
																	})
																}
																disabled={!isEditable}
																placeholder="Ingrese el tipo de enfermedad"
																style={styles.baseInput}
															/>
														</React.Fragment>
													)}

												<p
													style={{
														paddingBottom: "0.5rem",
														paddingTop: "1.5rem",
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
													}}
												>
													Medicamento:
												</p>
												<BaseInput
													value={
														selectedPersonal.medicine
															? selectedPersonal.medicine
															: ""
													}
													onChange={(e) =>
														setSelectedPersonal({
															...selectedPersonal,
															medicine: e.target.value,
														})
													}
													disabled={!isEditable}
													placeholder="Ingrese el tratamiento administrado"
													style={styles.baseInput}
												/>

												<p
													style={{
														paddingBottom: "0.5rem",
														paddingTop: "1.5rem",
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
													}}
												>
													Dosis:
												</p>
												<BaseInput
													value={
														selectedPersonal.dose ? selectedPersonal.dose : ""
													}
													onChange={(e) =>
														setSelectedPersonal({
															...selectedPersonal,
															dose: e.target.value,
														})
													}
													disabled={!isEditable}
													placeholder="Ingrese el tratamiento administrado (opcional)"
													style={styles.baseInput}
												/>

												<p
													style={{
														paddingBottom: "0.5rem",
														paddingTop: "1.5rem",
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
													}}
												>
													Frecuencia:
												</p>
												<BaseInput
													value={
														selectedPersonal.frequency
															? selectedPersonal.frequency
															: ""
													}
													onChange={(e) =>
														setSelectedPersonal({
															...selectedPersonal,
															frequency: e.target.value,
														})
													}
													disabled={!isEditable}
													placeholder="Ingrese la frecuencia con la que toma el medicamento"
													style={styles.baseInput}
												/>
											</React.Fragment>
										)}

									<div style={styles.spacer} />
								</>
							)}
						</div>
						<div style={styles.buttonContainer}>
							{addingNew && (
								<>
									<BaseButton
										text="Guardar"
										onClick={handleSaveNewPersonal}
										style={styles.button}
									/>
									<BaseButton
										text="Cancelar"
										onClick={handleCancel}
										style={{
											...styles.button,
											backgroundColor: "#fff",
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
		</div>
	);
}
