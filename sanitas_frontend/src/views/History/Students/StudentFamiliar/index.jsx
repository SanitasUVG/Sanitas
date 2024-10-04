import { Suspense, useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DropdownMenu from "src/components/DropdownMenu";
import InformationCard from "src/components/InformationCard";
import { BaseInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import StudentDashboardTopbar from "src/components/StudentDashboardTopBar";

/**
 * @typedef {Object} StudentStudentFamiliarHistoryProps
 * @property {Function} getStudentFamilyHistory - Function to fetch the familiar history data.
 * @property {Function} updateStudentFamilyHistory - Function to update the familiar history records.
 * @property {Object} sidebarConfig - Configuration properties for the sidebar component.
 * @property {Function} useStore - Custom hook for accessing the global state to retrieve the selected patient ID.
 *
 * Component responsible for displaying and managing the familiar history section in a medical dashboard.
 * It includes a sidebar and a main content area where the user can view and add family medical history records.
 *
 * @param {StudentStudentFamiliarHistoryProps} props - The props passed to the StudentFamiliarHistory component.
 * @returns {JSX.Element} - The rendered component with sections for sidebar and familiar history management.
 */
export function StudentFamiliarHistory({
	getStudentFamilyHistory,
	updateStudentFamilyHistory,
	sidebarConfig,
	useStore,
}) {
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);
	const id = useStore((s) => s.selectedPatientId);
	const familiarHistoryResource = WrapPromise(getStudentFamilyHistory(id));

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes familiares..." />
		);
	};

	const getResponsiveStyles = (width) => {
		const isMobile = width < 768;
		return {
			title: {
				color: colors.titleText,
				fontFamily: fonts.titleFont,
				fontSize: isMobile ? "1.06rem" : fontSize.titleSize,
				textAlign: isMobile ? "center" : "left",
			},
			subtitle: {
				fontFamily: fonts.textFont,
				fontWeight: "normal",
				fontSize: isMobile ? "0.9rem" : fontSize.subtitleSize,
				paddingTop: "0.7rem",
				paddingBottom: "0.2rem",
				textAlign: isMobile ? "center" : "left",
			},
			container: {
				display: "flex",
				flexDirection: "column",
				backgroundColor: colors.primaryBackground,
				minHeight: "100vh",
				overflow: "hidden",
				padding: "0",
			},
			innerContent: {
				backgroundColor: colors.secondaryBackground,
				padding: "2rem",
				borderRadius: "0.625rem",
				overflow: "auto",
				minHeight: "calc(100vh - 4rem)",
				flex: 1,
				margin: isMobile ? "1rem" : "2rem",
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
			<div style={{ width: "100%" }}>
				<div
					style={{
						width: "100%",
						padding: "1rem 1rem 0 1rem",
						flex: "0 0 auto",
					}}
				>
					<StudentDashboardTopbar
						{...sidebarConfig}
						activeSectionProp="familiares"
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
						<h1 style={styles.title}>Antecedentes Familiares</h1>
						<h3 style={styles.subtitle}>
							¿Alguien en su familia (padres, abuelos, hermanos, tíos) padece
							alguna de las siguientes enfermedades?
						</h3>
						<h3
							style={{
								...styles.subtitle,
								paddingTop: "0.2rem",
								paddingBottom: "1.5rem",
							}}
						>
							Por favor ingrese un elemento por diagnóstico.
						</h3>
					</div>

					<Suspense fallback={<LoadingView />}>
						<FamiliarView
							id={id}
							familiarHistoryResource={familiarHistoryResource}
							updateStudentFamilyHistory={updateStudentFamilyHistory}
						/>
					</Suspense>
				</div>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} FamiliarViewProps
 * @property {string} id - The unique identifier for the patient.
 * @property {Object} StudentFamiliarHistoryResource - Wrapped promise containing the familiar history data.
 * @property {Function} updateStudentFamilyHistory - Function to update familiar history records.
 *
 * This component handles the display and interaction of the familiar medical history. It allows the user
 * to view existing records, add new entries, and manage interaction states like error handling and data submissions.
 *
 * @param {FamiliarViewProps} props - The props used in the FamiliarView component.
 * @returns {JSX.Element} - A section of the UI that lets users interact with the familiar history data.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: In the future we should think to simplify this...
function FamiliarView({
	id,
	familiarHistoryResource,
	updateStudentFamilyHistory,
}) {
	// State hooks to manage the selected familiar disease and whether adding a new entry
	const [selectedFamiliar, setSelectedFamiliar] = useState({});
	const [addingNew, setAddingNew] = useState(false);
	const [isEditable, setIsEditable] = useState(false);

	// Read the data from the resource and handle any potential errors
	const familiarHistoryResult = familiarHistoryResource.read();
	let errorMessage = "";
	if (familiarHistoryResult.error) {
		const error = familiarHistoryResult.error;
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

	// Extract the familiar history data and establish initial state
	const familiarHistoryData = familiarHistoryResult.result;
	const [familiarHistory, setFamiliarHistory] = useState({
		hypertension: {
			data: familiarHistoryData?.medicalHistory.hypertension.data || [],
			version: familiarHistoryData?.medicalHistory.hypertension.version || 1,
		},
		diabetesMellitus: {
			data: familiarHistoryData?.medicalHistory.diabetesMellitus.data || [],
			version:
				familiarHistoryData?.medicalHistory.diabetesMellitus.version || 1,
		},
		hypothyroidism: {
			data: familiarHistoryData?.medicalHistory.hypothyroidism.data || [],
			version: familiarHistoryData?.medicalHistory.hypothyroidism.version || 1,
		},
		asthma: {
			data: familiarHistoryData?.medicalHistory.asthma.data || [],
			version: familiarHistoryData?.medicalHistory.asthma.version || 1,
		},
		convulsions: {
			data: familiarHistoryData?.medicalHistory.convulsions.data || [],
			version: familiarHistoryData?.medicalHistory.convulsions.version || 1,
		},
		myocardialInfarction: {
			data: familiarHistoryData?.medicalHistory.myocardialInfarction.data || [],
			version:
				familiarHistoryData?.medicalHistory.myocardialInfarction.version || 1,
		},
		cancer: {
			data: familiarHistoryData?.medicalHistory.cancer.data || [],
			version: familiarHistoryData?.medicalHistory.cancer.version || 1,
		},
		cardiacDiseases: {
			data: familiarHistoryData?.medicalHistory.cardiacDiseases.data || [],
			version: familiarHistoryData?.medicalHistory.cardiacDiseases.version || 1,
		},
		renalDiseases: {
			data: familiarHistoryData?.medicalHistory.renalDiseases.data || [],
			version: familiarHistoryData?.medicalHistory.renalDiseases.version || 1,
		},
		others: {
			data: familiarHistoryData?.medicalHistory.others.data || [],
			version: familiarHistoryData?.medicalHistory.others.version || 1,
		},
	});

	// No familiar data in API
	const noFamiliarData = Object.keys(familiarHistory).every(
		(key) =>
			familiarHistory[key]?.data && familiarHistory[key].data.length === 0,
	);

	// Handlers for different actions within the component
	const handleOpenNewForm = () => {
		const initialDisease = "hypertension";
		setSelectedFamiliar({ disease: initialDisease });
		setAddingNew(true);
		setIsEditable(true);
		validateDisease(initialDisease);
	};

	const validateDisease = (disease) => {
		// Validation to ensure the selected disease exists in the state
		if (!familiarHistory[disease]) {
			toast.error("Por favor, selecciona una enfermedad válida.");
			return false;
		}
		return true;
	};

	// Handler for selecting a disease card, setting state to show details without adding new data
	const handleSelectDiseaseCard = (diseaseKey, entry, index) => {
		if (
			[
				"hypertension",
				"diabetesMellitus",
				"hypothyroidism",
				"asthma",
				"convulsions",
				"myocardialInfarction",
			].includes(diseaseKey)
		) {
			setSelectedFamiliar({
				disease: diseaseKey,
				relative: [...familiarHistory[diseaseKey].data],
				index: index,
			});
		} else {
			setSelectedFamiliar({
				disease: diseaseKey,
				relative: entry.who,
				typeOfDisease: entry.typeOfDisease || "",
				index: index,
			});
		}
		setAddingNew(false);
		setIsEditable(false);
	};

	const handleCancel = () => {
		setSelectedFamiliar({});
		setAddingNew(false);
		setIsEditable(false);
	};

	// Changes the disease selection from the dropdown, resetting other fields
	const handleDiseaseChange = (e) => {
		const disease = e.target.value;
		if (isEditable && selectedFamiliar.index !== undefined) {
			setSelectedFamiliar((prev) => ({
				...prev,
				disease: disease,
			}));
		} else {
			setSelectedFamiliar({
				disease: disease,
				relative: "",
				typeOfDisease: "",
			});
		}
	};

	const isValidDiseaseSelection = () => {
		if (
			!(selectedFamiliar.disease && familiarHistory[selectedFamiliar.disease])
		) {
			toast.error("Por favor, selecciona una enfermedad válida.");
			return false;
		}
		if (
			selectedFamiliar.disease === "others" &&
			!selectedFamiliar.typeOfDisease
		) {
			toast.error(
				"Por favor, proporciona detalles sobre la enfermedad en 'Otros'.",
			);
			return false;
		}
		if (!selectedFamiliar.relative) {
			toast.error("Por favor, indica el familiar asociado a la enfermedad.");
			return false;
		}
		if (
			selectedFamiliar.disease === "cancer" &&
			!selectedFamiliar.typeOfDisease
		) {
			toast.error("Por favor, especifica el tipo de cáncer.");
			return false;
		}
		return true;
	};

	const prepareNewEntry = () => {
		if (
			[
				"hypertension",
				"diabetesMellitus",
				"hypothyroidism",
				"asthma",
				"convulsions",
				"myocardialInfarction",
			].includes(selectedFamiliar.disease)
		) {
			return selectedFamiliar.relative.split(",").map((item) => item.trim());

			// biome-ignore lint/style/noUselessElse: Displays the info for cancer, renal, cardiac and other diseases
		} else {
			return selectedFamiliar.relative.split(",").map((relative) => ({
				who: relative.trim(),
				typeOfDisease: selectedFamiliar.typeOfDisease || "",
				disease:
					selectedFamiliar.disease === "others"
						? selectedFamiliar.typeOfDisease
						: undefined,
			}));
		}
	};

	// biome-ignore  lint/complexity/noExcessiveCognitiveComplexity: It's the function to update the arrays and objects in JSON.
	const updateStudentFamilyHistoryState = async (newEntry) => {
		const isUpdating = isEditable && selectedFamiliar.index !== undefined;
		toast.info(
			isUpdating
				? "Actualizando antecedente familiar..."
				: "Guardando nuevo antecedente familiar...",
		);

		let updatedData = [...familiarHistory[selectedFamiliar.disease].data];

		if (isUpdating) {
			if (
				Array.isArray(newEntry) &&
				newEntry.every((item) => typeof item === "string")
			) {
				updatedData = newEntry; // For arrays of strings.
			} else {
				// Ensure that newEntry is not an array when updating an object.
				const update = Array.isArray(newEntry) ? newEntry[0] : newEntry;
				updatedData[selectedFamiliar.index] = update; // Update the specific object at the index.
			}
		} else {
			if (
				Array.isArray(newEntry) &&
				newEntry.every((item) => typeof item === "string")
			) {
				updatedData = updatedData.concat(newEntry); // Concatenate if they are strings.
			} else if (
				Array.isArray(newEntry) &&
				newEntry.some((item) => typeof item === "object")
			) {
				updatedData.push(...newEntry); // Add each object individually.
			} else {
				updatedData.push(newEntry); // Add a single object.
			}
		}

		const updatedHistory = {
			...familiarHistory[selectedFamiliar.disease],
			data: updatedData,
		};

		const updatedFamiliarHistory = {
			...familiarHistory,
			[selectedFamiliar.disease]: updatedHistory,
		};

		try {
			const response = await updateStudentFamilyHistory(
				id,
				updatedFamiliarHistory,
			);
			if (!response.error) {
				toast.success(
					isUpdating
						? "Antecedente familiar actualizado con éxito."
						: "Antecedente familiar guardado con éxito.",
				);
				setFamiliarHistory(updatedFamiliarHistory);
				setSelectedFamiliar({});
				setAddingNew(false);
				setIsEditable(false);
			} else {
				toast.error(`Error al guardar la información: ${response.error}`);
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`);
		}
	};

	// Handles the saving of new or modified family medical history
	const handleSaveNewFamiliar = async () => {
		if (!isValidDiseaseSelection()) return;
		const newEntry = prepareNewEntry();
		await updateStudentFamilyHistoryState(newEntry);
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

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Provides styles for making it responsive
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
				height: isMobile ? "auto" : "calc(65vh - 2rem)",
				flex: 1,
				overflowY: "auto",
			},
			baseInput: {
				width: "100%",
				maxWidth: "20rem",
				height: "2.5rem",
				fontFamily: fonts.textFont,
				fontSize: "1rem",
			},
			dropdownContainer: {
				width: "100%",
				maxWidth: isMobile ? "100%" : "80%",
				marginBottom: "1rem",
			},
			dropdownSelect: {
				width: "100%",
			},
			button: {
				width: isMobile ? "45%" : "30%",
				height: isMobile ? "2.5rem" : "3rem",
				fontSize: isMobile ? "0.9rem" : "1rem",
			},
			buttonContainer: {
				display: "flex",
				justifyContent: "center",
				gap: "1rem",
				paddingTop: isMobile ? "3rem" : "5rem",
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
			{addingNew || selectedFamiliar.disease ? (
				<div
					style={{
						...styles.innerContainer,
						flex: 1.5,
						paddingLeft: windowWidth < 768 ? "0.5rem" : "2rem",
						flexGrow: 1,
						marginBottom: "1rem",
					}}
				>
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
							value={selectedFamiliar.disease || ""}
							onChange={handleDiseaseChange}
							style={{
								container: { width: "100%" },
								select: styles.dropdownSelect,
								option: {},
								indicator: {},
							}}
						/>
					</div>

					{selectedFamiliar.disease && (
						<>
							{selectedFamiliar.disease !== "others" && (
								<>
									<p
										style={{
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
											paddingTop: "1.5rem",
											paddingBottom: "0.5rem",
										}}
									>
										¿Quién padece de{" "}
										{translateDisease(selectedFamiliar.disease)}?
									</p>
									<BaseInput
										value={selectedFamiliar.relative || ""}
										onChange={(e) =>
											setSelectedFamiliar({
												...selectedFamiliar,
												relative: e.target.value,
											})
										}
										readOnly={!isEditable}
										placeholder="Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)"
										style={styles.baseInput}
									/>
								</>
							)}
							{[
								"cancer",
								"others",
								"cardiacDiseases",
								"renalDiseases",
							].includes(selectedFamiliar.disease) && (
								<>
									<p
										style={{
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
											paddingTop: "1.5rem",
											paddingBottom: "0.5rem",
										}}
									>
										{selectedFamiliar.disease === "cancer"
											? "Tipo de Cáncer:"
											: selectedFamiliar.disease === "others"
												? "¿Qué enfermedad?"
												: "Tipo de enfermedad:"}
									</p>
									<BaseInput
										value={selectedFamiliar.typeOfDisease || ""}
										onChange={(e) =>
											setSelectedFamiliar({
												...selectedFamiliar,
												typeOfDisease: e.target.value,
											})
										}
										placeholder={
											selectedFamiliar.disease === "cancer"
												? "Especifique el tipo de cáncer"
												: selectedFamiliar.disease === "others"
													? "Escriba la enfermedad"
													: "Especifique el tipo de enfermedad (no obligatorio)"
										}
										readOnly={!isEditable}
										style={styles.baseInput}
									/>
								</>
							)}

							{selectedFamiliar.disease === "others" && (
								<>
									<p
										style={{
											fontFamily: fonts.textFont,
											fontSize: fontSize.textSize,
											paddingTop: "1.5rem",
											paddingBottom: "0.5rem",
										}}
									>
										¿Quién?
									</p>
									<BaseInput
										value={selectedFamiliar.relative || ""}
										onChange={(e) =>
											setSelectedFamiliar({
												...selectedFamiliar,
												relative: e.target.value,
											})
										}
										placeholder="Ingrese el parentesco del familiar afectado. (Ej. Madre, Padre, Hermano...)"
										readOnly={!isEditable}
										style={styles.baseInput}
									/>
								</>
							)}
							<div style={styles.buttonContainer}>
								{addingNew && (
									<>
										<BaseButton
											text="Guardar"
											onClick={handleSaveNewFamiliar}
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
						</>
					)}
				</div>
			) : null}

			<div style={styles.innerContainer}>
				<div style={{ paddingBottom: "0.5rem" }}>
					<BaseButton
						text="Agregar antecedente familiar"
						onClick={handleOpenNewForm}
						style={{ width: "100%", height: "3rem" }}
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

				{noFamiliarData && !errorMessage ? (
					<p style={{ textAlign: "center", paddingTop: "20px" }}>
						¡Parece que no hay antecedentes familiares! Agrega uno en el botón
						de arriba.
					</p>
				) : (
					Object.entries(familiarHistory).map(
						([diseaseKey, { data = [], version: _version }]) => {
							if (data.length === 0) {
								return null;
							}

							let displayedDisease = translateDisease(diseaseKey);

							if (
								diseaseKey === "cancer" ||
								diseaseKey === "cardiacDiseases" ||
								diseaseKey === "renalDiseases" ||
								diseaseKey === "others"
							) {
								return data.map((entry, index) => {
									const details = entry.who;
									const uniqueKey = `${diseaseKey}-${entry.who}-${index}`;
									if (diseaseKey === "others") {
										displayedDisease = entry.disease;
									}
									return (
										<InformationCard
											key={uniqueKey}
											type="family"
											disease={displayedDisease}
											relative={details}
											onClick={() =>
												handleSelectDiseaseCard(diseaseKey, entry, index)
											}
										/>
									);
								});
							}

							// biome-ignore lint/style/noUselessElse: Displays the information card for the case where the disease is not cancer, renal or otherwise
							else {
								const displayedRelatives = data.join(", ");

								return (
									<InformationCard
										key={diseaseKey}
										type="family"
										disease={displayedDisease}
										relative={displayedRelatives}
										onClick={() =>
											data.forEach((relative, index) =>
												handleSelectDiseaseCard(
													diseaseKey,
													{ who: relative },
													index,
												),
											)
										}
									/>
								);
							}
						},
					)
				)}
			</div>
		</div>
	);
}
