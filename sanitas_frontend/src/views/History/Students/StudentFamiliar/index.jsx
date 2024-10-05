import { Suspense, useState } from "react";
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
	const id = useStore((s) => s.selectedPatientId);
	//const id = 1;
	const StudentFamiliarHistoryResource = WrapPromise(
		getStudentFamilyHistory(id),
	);

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes familiares..." />
		);
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				backgroundColor: colors.primaryBackground,
				minHeight: "100vh",
				padding: "2rem",
			}}
		>
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
						activeSectionProp="familiares"
					/>
				</div>
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
							Antecedentes Familiares
						</h1>
						<h3
							style={{
								fontFamily: fonts.textFont,
								fontWeight: "normal",
								fontSize: fontSize.subtitleSize,
								paddingTop: "0.5rem",
								paddingBottom: "0.5rem",
							}}
						>
							{" "}
							¿Alguien en su familia (padres, abuelos, hermanos, tíos) padece
							alguna de las siguientes enfermedades?{" "}
						</h3>{" "}
						<h3
							style={{
								fontFamily: fonts.textFont,
								fontWeight: "normal",
								fontSize: fontSize.subtitleSize,
								paddingBottom: "1.5rem",
							}}
						>
							{" "}
							Por favor ingrese un elemento por diagnóstico.{" "}
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
							<FamiliarView
								id={id}
								StudentFamiliarHistoryResource={StudentFamiliarHistoryResource}
								updateStudentFamilyHistory={updateStudentFamilyHistory}
							/>
						</Suspense>
					</div>
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
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity:  Is the main function of the view
function FamiliarView({
	id,
	StudentFamiliarHistoryResource,
	updateStudentFamilyHistory,
}) {
	// State hooks to manage the selected familiar disease and whether adding a new entry
	const [selectedFamiliar, setSelectedFamiliar] = useState({});
	const [addingNew, setAddingNew] = useState(false);
	const [isEditable, setIsEditable] = useState(false);

	// Read the data from the resource and handle any potential errors
	const StudentFamiliarHistoryResult = StudentFamiliarHistoryResource.read();
	let errorMessage = "";
	if (StudentFamiliarHistoryResult.error) {
		const error = StudentFamiliarHistoryResult.error;
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
	const StudentFamiliarHistoryData = StudentFamiliarHistoryResult.result;
	const [StudentFamiliarHistory, setStudentFamiliarHistory] = useState({
		hypertension: {
			data: StudentFamiliarHistoryData?.medicalHistory.hypertension.data || [],
			version:
				StudentFamiliarHistoryData?.medicalHistory.hypertension.version || 1,
		},
		diabetesMellitus: {
			data:
				StudentFamiliarHistoryData?.medicalHistory.diabetesMellitus.data || [],
			version:
				StudentFamiliarHistoryData?.medicalHistory.diabetesMellitus.version ||
				1,
		},
		hypothyroidism: {
			data:
				StudentFamiliarHistoryData?.medicalHistory.hypothyroidism.data || [],
			version:
				StudentFamiliarHistoryData?.medicalHistory.hypothyroidism.version || 1,
		},
		asthma: {
			data: StudentFamiliarHistoryData?.medicalHistory.asthma.data || [],
			version: StudentFamiliarHistoryData?.medicalHistory.asthma.version || 1,
		},
		convulsions: {
			data: StudentFamiliarHistoryData?.medicalHistory.convulsions.data || [],
			version:
				StudentFamiliarHistoryData?.medicalHistory.convulsions.version || 1,
		},
		myocardialInfarction: {
			data:
				StudentFamiliarHistoryData?.medicalHistory.myocardialInfarction.data ||
				[],
			version:
				StudentFamiliarHistoryData?.medicalHistory.myocardialInfarction
					.version || 1,
		},
		cancer: {
			data: StudentFamiliarHistoryData?.medicalHistory.cancer.data || [],
			version: StudentFamiliarHistoryData?.medicalHistory.cancer.version || 1,
		},
		cardiacDiseases: {
			data:
				StudentFamiliarHistoryData?.medicalHistory.cardiacDiseases.data || [],
			version:
				StudentFamiliarHistoryData?.medicalHistory.cardiacDiseases.version || 1,
		},
		renalDiseases: {
			data: StudentFamiliarHistoryData?.medicalHistory.renalDiseases.data || [],
			version:
				StudentFamiliarHistoryData?.medicalHistory.renalDiseases.version || 1,
		},
		others: {
			data: StudentFamiliarHistoryData?.medicalHistory.others.data || [],
			version: StudentFamiliarHistoryData?.medicalHistory.others.version || 1,
		},
	});

	// No familiar data in API
	const noFamiliarData = Object.keys(StudentFamiliarHistory).every(
		(key) =>
			StudentFamiliarHistory[key]?.data &&
			StudentFamiliarHistory[key].data.length === 0,
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
		if (!StudentFamiliarHistory[disease]) {
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
				relative: [...StudentFamiliarHistory[diseaseKey].data],
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
			!(
				selectedFamiliar.disease &&
				StudentFamiliarHistory[selectedFamiliar.disease]
			)
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

		let updatedData = [
			...StudentFamiliarHistory[selectedFamiliar.disease].data,
		];

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
			...StudentFamiliarHistory[selectedFamiliar.disease],
			data: updatedData,
		};

		const updatedStudentFamiliarHistory = {
			...StudentFamiliarHistory,
			[selectedFamiliar.disease]: updatedHistory,
		};

		try {
			const response = await updateStudentFamilyHistory(
				id,
				updatedStudentFamiliarHistory,
			);
			if (!response.error) {
				toast.success(
					isUpdating
						? "Antecedente familiar actualizado con éxito."
						: "Antecedente familiar guardado con éxito.",
				);
				setStudentFamiliarHistory(updatedStudentFamiliarHistory);
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
					Object.entries(StudentFamiliarHistory).map(
						([diseaseKey, { data = [] }]) => {
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

			{addingNew || selectedFamiliar.disease ? (
				<div
					style={{
						border: `0.063rem solid ${colors.primaryBackground}`,
						borderRadius: "0.625rem",
						padding: "1rem",
						height: "65vh",
						flex: 1.5,
						width: "100%",
						paddingLeft: "2rem",
						flexGrow: 1,
						overflowY: "auto",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							width: "100%",
						}}
					>
						<p
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "1.5rem",
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
							disabled={!addingNew}
							onChange={handleDiseaseChange}
							style={{
								container: { width: "80%" },
								select: {},
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
										style={{ width: "90%", height: "2.5rem" }}
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
										style={{ width: "90%", height: "2.5rem" }}
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
										style={{ width: "90%", height: "2.5rem" }}
									/>
								</>
							)}
							<div
								style={{
									paddingTop: "5rem",
									display: "flex",
									justifyContent: "center",
								}}
							>
								{addingNew && (
									<>
										<BaseButton
											text="Guardar"
											onClick={handleSaveNewFamiliar}
											style={{ width: "30%", height: "3rem" }}
										/>
										<div style={{ width: "1rem" }} />
										<BaseButton
											text="Cancelar"
											onClick={handleCancel}
											style={{
												width: "30%",
												height: "3rem",
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
		</div>
	);
}