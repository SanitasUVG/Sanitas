import React, { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import InformationCard from "src/components/InformationCard";
import { BaseInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * @typedef {Object} AllergicHistoryProps
 * @property {Function} getBirthdayPatientInfo - Function to fetch the patient's birthdate.
 * @property {Function} getAllergicHistory - Function to fetch the allergic history of a patient.
 * @property {Function} updateAllergicHistory - Function to update or add new allergic records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's allergic history, allowing users to add and view records.
 *
 * @param {AllergicHistoryProps} props - The props passed to the AllergicHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */
export function AlergicHistory({
	getBirthdayPatientInfo,
	getAllergicHistory,
	updateAllergicHistory,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
	const birthdayResource = WrapPromise(getBirthdayPatientInfo(id));
	const allergicHistoryResource = WrapPromise(getAllergicHistory(id));

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes alérgicos..." />
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
							Antecedentes Alérgicos
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
							Registro de antecedentes Alérgicos
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
							<AllergicView
								id={id}
								birthdayResource={birthdayResource}
								allergicHistoryResource={allergicHistoryResource}
								updateAllergicHistory={updateAllergicHistory}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} AllergicViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} birthdayResource - Wrapped resource for fetching birthdate data.
 * @property {Object} allergicHistoryResource - Wrapped resource for fetching Allergic history data.
 * @property {Function} updateAllergicHistory - Function to update the Allergic history.
 *
 * Internal view component for managing the display and modification of a patient's Allergic history, with options to add or edit records.
 *
 * @param {AllergicViewProps} props - Specific props for the AllergicViewiew component.
 * @returns {JSX.Element} - A detailed view for managing allergic history with interactivity to add or edit records.
 */
function AllergicView({
	id,
	birthdayResource,
	allergicHistoryResource,
	updateAllergicHistory,
}) {
	const [selectedAllergie, setSelectedAllergie] = useState({
		selectedMed: "",
		whichAllergie: "",
		reactionType: "",
	});
	const [addingNew, setAddingNew] = useState(false);
	const [yearOptions, setYearOptions] = useState([]);

	const birthYearResult = birthdayResource.read();
	const allergicHistoryResult = allergicHistoryResource.read();

	console.log("Allergic History Result:", allergicHistoryResult);

	let errorMessage = "";

	if (birthYearResult.error || allergicHistoryResult.error) {
		const error = birthYearResult.error || allergicHistoryResult.error;
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

	const birthYearData = birthYearResult.result;
	const allergicHistoryData = allergicHistoryResult.result;

	let sortedData = allergicHistoryData?.medicalHistory.data || [];

	const [AllergicHistory, setAllergicHistory] = useState({
		data: allergicHistoryData?.medicalHistory.data || [],
		version: allergicHistoryData?.medicalHistory.version || 1,
	});

	// No allergic data in API
	const noAllergicData =
		!AllergicHistory.data || AllergicHistory.data.length === 0;

	const currentYear = new Date().getFullYear();

	const birthYear = birthYearData?.birthdate
		? new Date(birthYearData.birthdate).getFullYear()
		: null;

	useEffect(() => {
		const options = [];
		if (birthYear) {
			for (let year = birthYear; year <= currentYear; year++) {
				options.push({ value: year, label: year.toString() });
			}
		}
		setYearOptions(options);
	}, [birthYear]);

	// Event handlers for adding, editing, and saving allergic history records
	const handleOpenNewForm = () => {
		setSelectedAllergie({
			selectedMed: "",
			whichAllergie: "",
			reactionType: "",
		});
		setAddingNew(true);
	};

	// Save the new Allergic record to the database
	const handleSaveNewAllergie = async () => {
		if (
			!selectedAllergie.selectedMed ||
			!selectedAllergie.whichAllergie ||
			!selectedAllergie.reactionType
		) {
			toast.error("Complete todos los campos requeridos.");
			return;
		}

		toast.info("Guardando antecedente alérgico...");

		const updatedCategory = {
			version: 1,
			data: [
				...(AllergicHistory[selectedAllergie.selectedMed]?.data || []),
				{
					name: selectedAllergie.whichAllergie,
					severity: selectedAllergie.reactionType,
				},
			],
		};

		const updatedMedicalHistory = {
			[selectedAllergie.selectedMed]: updatedCategory,
		};

		try {
			const response = await updateAllergicHistory(id, updatedMedicalHistory);
			if (!response.error) {
				// Merge the updated category back into the state
				setAllergicHistory((prevState) => ({
					...prevState,
					[selectedAllergie.selectedMed]: updatedCategory,
				}));
				setAddingNew(false);
				setSelectedAllergie({
					selectedMed: "",
					whichAllergie: "",
					reactionType: "",
				});
				toast.success("Antecedente alérgico guardado con éxito.");
			} else {
				toast.error(`Error al guardar: ${response.error}`);
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`);
		}
	};

	const handleSelectAllergie = (event) => {
		const selectedValue = event.target.value;
		setSelectedAllergie((prevAllergie) => ({
			...prevAllergie,
			selectedMed: selectedValue,
		}));
	};

	const handleFieldChange = (fieldName, value) => {
		setSelectedAllergie((prevAllergie) => ({
			...prevAllergie,
			[fieldName]: value,
		}));
	};

	const handleCancel = () => {
		setSelectedAllergie(null);
		setAddingNew(false);
	};

	const allergyOptions = [
		{ label: "Medicamentos", value: "medication" },
		{ label: "Comida", value: "food" },
		{ label: "Polvo", value: "dust" },
		{ label: "Polen", value: "pollen" },
		{ label: "Cambio Climático", value: "climateChange" },
		{ label: "Animales", value: "animals" },
		{ label: "Otros", value: "others" },
	];

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
				<div
					style={{
						paddingBottom: "0.5rem",
					}}
				>
					<BaseButton
						text="Agregar antecedente Alérgico"
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

				{noAllergicData && !errorMessage ? (
					<p style={{ textAlign: "center", paddingTop: "20px" }}>
						¡Parece que no hay antecedentes alérgicos! Agrega uno en el botón de
						arriba.
					</p>
				) : (
					Object.keys(allergicHistoryData?.medicalHistory || {}).map(
						(category, index) => {
							return allergicHistoryData.medicalHistory[category].data.map(
								(allergy, idx) => (
									<InformationCard
										key={`${index}-${idx}`}
										type="allergy"
										label={allergy.name || allergy.source || allergy.type}
										severity={allergy.severity}
										onClick={() => handleSelectAllergie(allergy)}
									/>
								),
							);
						},
					)
				)}
			</div>

			{addingNew || selectedAllergie ? (
				<div
					style={{
						border: `1px solid ${colors.primaryBackground}`,
						borderRadius: "10px",
						padding: "1rem",
						height: "65vh",
						flex: 1.5,
						overflowY: "auto",
						width: "100%",
						paddingLeft: "2rem",
					}}
				>
					<p
						style={{
							paddingBottom: "0.5rem",
							paddingTop: "1.5rem",
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
						}}
					>
						¿Es alérgico a uno de los siguientes?
					</p>
					<DropdownMenu
						options={allergyOptions}
						value={selectedAllergie?.selectedMed || ""}
						readOnly={!addingNew}
						onChange={handleSelectAllergie}
						style={{
							container: { width: "80%" },
							select: {},
							option: {},
							indicator: {},
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
						¿A cual?
					</p>
					<BaseInput
						value={selectedAllergie?.whichAllergie || ""}
						onChange={(e) => handleFieldChange("whichAllergie", e.target.value)}
						placeholder="Ingrese a cuál del tipo seleccionado"
						style={{
							width: "90%",
							height: "2.5rem",
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
						Tipo de reacción
					</p>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "0.5rem",
							paddingLeft: "1.5rem",
						}}
					>
						<RadioInput
							label="Cutánea"
							name="reactionType"
							checked={selectedAllergie?.reactionType === "Cutánea"}
							onChange={() => handleFieldChange("reactionType", "Cutánea")}
							style={{ label: { fontFamily: fonts.textFont } }}
						/>
						<RadioInput
							label="Respiratoria"
							name="reactionType"
							checked={selectedAllergie?.reactionType === "Respiratoria"}
							onChange={() => handleFieldChange("reactionType", "Respiratoria")}
							style={{ label: { fontFamily: fonts.textFont } }}
						/>
						<RadioInput
							label="Ambos"
							name="reactionType"
							checked={selectedAllergie?.reactionType === "Ambos"}
							onChange={() => handleFieldChange("reactionType", "Ambos")}
							style={{ label: { fontFamily: fonts.textFont } }}
						/>
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
									onClick={handleSaveNewAllergie}
									style={{ width: "30%", height: "3rem" }}
								/>
								<div style={{ width: "1rem" }}></div>
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
				</div>
			) : null}
		</div>
	);
}
