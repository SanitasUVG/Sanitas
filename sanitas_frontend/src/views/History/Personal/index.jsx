import React, { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import InformationCard from "src/components/InformationCard";
import { BaseInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import IconButton from "src/components/Button/Icon";
import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";

/**
 * @typedef {Object} PersonalHistoryProps
 * @property {Function} getPersonalHistory - Function to fetch the personal history data.
 * @property {Function} updatePersonalHistory - Function to update the personal history records.
 * @property {Object} sidebarConfig - Configuration properties for the sidebar component.
 * @property {Function} useStore - Custom hook for accessing the global state to retrieve the selected patient ID.
 *
 * Component responsible for displaying and managing the personal history section in a medical dashboard.
 * It includes a sidebar and a main content area where the user can view and add family medical history records.
 *
 * @param {PersonalHistoryProps} props - The props passed to the PersonalHistory component.
 * @returns {JSX.Element} - The rendered component with sections for sidebar and personal history management.
 */
export function PersonalHistory({
	getBirthdayPatientInfo,
	getPersonalHistory,
	updatePersonalHistory,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
	const birthdayResource = WrapPromise(getBirthdayPatientInfo(id));
	const personalHistoryResource = WrapPromise(getPersonalHistory(id));

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes personales..." />
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
							Antecedentes Personales
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
							Registro de antecedentes personales
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
								updatePersonalHistory={updatePersonalHistory}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} PersonalViewProps
 * @property {string} id - The unique identifier for the patient.
 * @property {Object} personalHistoryResource - Wrapped promise containing the personal history data.
 * @property {Function} updatePersonalHistory - Function to update personal history records.
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
	updatePersonalHistory,
}) {
	// State hooks to manage the selected personal disease and whether adding a new entry
	const [selectedPersonal, setSelectedPersonal] = useState({});
	const [addingNew, setAddingNew] = useState(false);
	const [yearOptions, setYearOptions] = useState([]);
	const [isEditable, setIsEditable] = useState(false);

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
		toast.info("Edición cancelada");
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
			cardiacDiseases: ["medicine", "frequency"],
			renalDiseases: ["medicine", "frequency"],
			default: ["typeOfDisease", "medicine", "frequency"],
		};

		// Get the required fields for the selected disease or use default fields
		const requiredFields =
			diseaseFieldsMap[selectedPersonal.disease] || diseaseFieldsMap.default;

		// Prepare new entry for saving
		const newEntry = {};
		for (const field of requiredFields) {
			newEntry[field] = selectedPersonal[field] || "";
		}

		// Validate required fields
		const missingFields = requiredFields.filter(
			(field) => !newEntry[field] || newEntry[field].trim() === "",
		);

		if (missingFields.length > 0) {
			toast.info("Complete todos los campos requeridos.");
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
			const response = await updatePersonalHistory(id, updatedPersonalHistory);

			if (response.error) {
				toast.error(`Error al guardar la información: ${response.error}`);
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
						text="Agregar antecedente personal"
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
											onClick={() => handleSelectDiseaseCard(diseaseKey, entry)}
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

			{addingNew || selectedPersonal.disease ? (
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
							value={selectedPersonal.disease || ""}
							disabled={!isEditable}
							onChange={handleDiseaseChange}
							style={{
								container: { width: "80%" },
								select: {},
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
										placeholder="Ingrese el tipo de cáncer"
										style={{
											width: "95%",
											height: "10%",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
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
										style={{
											width: "95%",
											height: "10%",
											fontFamily: fonts.textFont,
											fontSize: "1rem",
										}}
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
										styles={{
											container: { width: "90%" },
											select: {},
											option: {},
											indicator: {},
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
														style={{
															width: "95%",
															height: "10%",
															fontFamily: fonts.textFont,
															fontSize: "1rem",
														}}
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
											style={{
												width: "95%",
												height: "10%",
												fontFamily: fonts.textFont,
												fontSize: "1rem",
											}}
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
											value={selectedPersonal.dose ? selectedPersonal.dose : ""}
											onChange={(e) =>
												setSelectedPersonal({
													...selectedPersonal,
													dose: e.target.value,
												})
											}
											disabled={!isEditable}
											placeholder="Ingrese el tratamiento administrado (opcional)"
											style={{
												width: "95%",
												height: "10%",
												fontFamily: fonts.textFont,
												fontSize: "1rem",
											}}
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
											style={{
												width: "95%",
												height: "10%",
												fontFamily: fonts.textFont,
												fontSize: "1rem",
											}}
										/>
									</React.Fragment>
								)}

							<div
								style={{
									display: "flex",
									flexDirection: "column",
									width: "100%",
								}}
							>
								<div style={{ display: "flex", justifyContent: "flex-end" }}>
									{!addingNew &&
										(isEditable ? (
											<div style={{ display: "flex", gap: "3rem" }}>
												<IconButton
													icon={CheckIcon}
													onClick={handleSaveNewPersonal}
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
							</div>
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
											onClick={handleSaveNewPersonal}
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
