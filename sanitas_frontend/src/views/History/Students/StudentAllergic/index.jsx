import { Suspense, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DropdownMenu from "src/components/DropdownMenu";
import InformationCard from "src/components/InformationCard";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import { BaseInput, RadioInput } from "src/components/Input/index";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * @typedef {Object} StudentAllergicHistoryProps
 * @property {Function} getStudentAllergicHistory - Function to fetch the allergic history of a patient.
 * @property {Function} updateStudentAllergicHistory - Function to update or add new allergic records for a patient.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a student's allergic history, allowing users to add and view records.
 *
 * @param {StudentAllergicHistoryProps} props - The props passed to the StudentAllergicHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */
export function StudentAllergicHistory({
	getStudentAllergicHistory,
	updateStudentAllergicHistory,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);

	const allergicHistoryResource = WrapPromise(getStudentAllergicHistory(id));

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
							Registro de antecedentes alérgicos
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
								allergicHistoryResource={allergicHistoryResource}
								updateStudentAllergicHistory={updateStudentAllergicHistory}
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
 * @property {Object} allergicHistoryResource - Wrapped resource for fetching allergic history data.
 * @property {Function} updateStudentAllergicHistory - Function to update the allergic history.
 *
 * Internal view component for managing the display and modification of a student's allergic history, with options to add or edit records.
 *
 * @param {AllergicViewProps} props - Specific props for the AllergicView component.
 * @returns {JSX.Element} - A detailed view for managing allergic history with interactivity to add or edit records.
 */

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
function AllergicView({
	id,
	allergicHistoryResource,
	updateStudentAllergicHistory,
}) {
	const [selectedAllergie, setSelectedAllergie] = useState(null);
	const [addingNew, setAddingNew] = useState(false);
	const [isEditable, setIsEditable] = useState(false);
	const isFirstTime = addingNew;
	const allergicHistoryResult = allergicHistoryResource.read();

	let errorMessage = "";
	if (allergicHistoryResult.error) {
		const error = allergicHistoryResult.error;
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

	const allergicHistoryData = allergicHistoryResult.result;

	const [AllergicHistory, setAllergicHistory] = useState(
		allergicHistoryData?.medicalHistory || {},
	);

	// No allergic data in API
	const noAllergicData = !Object.values(AllergicHistory).some(
		(category) => Array.isArray(category.data) && category.data.length > 0,
	);

	// Event handlers for adding, editing, and saving allergic history records
	const handleOpenNewForm = () => {
		setSelectedAllergie({
			selectedMed: "medication", // Valor predeterminado de Medicamentos
			whichAllergie: "",
			reactionType: "",
		});
		setAddingNew(true);
		setIsEditable(true);
	};

	// Save the new Allergic record to the database

	const handleSaveNewAllergie = async () => {
		if (
			!(
				selectedAllergie.selectedMed &&
				selectedAllergie.whichAllergie &&
				selectedAllergie.reactionType
			)
		) {
			toast.error("Complete todos los campos requeridos.");
			return;
		}

		toast.info("Guardando antecedente alérgico...");

		const updatedAllergy = {
			name: selectedAllergie.whichAllergie,
			severity: selectedAllergie.reactionType,
		};

		let updatedMedicalHistory;

		const currentCategoryData =
			AllergicHistory[selectedAllergie.selectedMed]?.data || [];
		const currentVersion =
			AllergicHistory[selectedAllergie.selectedMed]?.version || 1;

		// Determina si se añade a la lista existente o se reemplaza dependiendo del valor de isFirstTime
		const updatedCategory = {
			version: currentVersion + 1, // Incrementa la versión para cada cambio
			data: isFirstTime
				? [...currentCategoryData, updatedAllergy]
				: [updatedAllergy],
		};

		updatedMedicalHistory = {
			...AllergicHistory,
			[selectedAllergie.selectedMed]: updatedCategory,
		};

		try {
			const response = await updateStudentAllergicHistory(
				id,
				updatedMedicalHistory,
			);
			if (!response.error) {
				setAllergicHistory(updatedMedicalHistory);
				setAddingNew(false);
				setSelectedAllergie(null);
				setIsEditable(false);
				toast.success("Antecedente alérgico guardado con éxito.");
			} else {
				throw new Error(response.error); // Lanza un error si la respuesta incluye un error
			}
		} catch (error) {
			toast.error(
				`Error en la operación: ${error.message || "Error desconocido"}`,
			);
		}
	};

	const handleSelectAllergie = (allergy) => {
		setSelectedAllergie({
			selectedMed: allergy.selectedMed || "climateChange",
			whichAllergie: allergy.name || allergy.source || allergy.type,
			reactionType: allergy.severity,
		});
		setIsEditable(false);
		setAddingNew(false);
	};

	const handleFieldChange = (fieldName, value) => {
		setSelectedAllergie((prevAllergie) => ({
			...prevAllergie,
			[fieldName]: value,
		}));
	};

	const handleCancel = () => {
		if (addingNew) {
			setAddingNew(false);
			setSelectedAllergie(null);
			setIsEditable(false);
		} else if (selectedAllergie !== null) {
			setIsEditable(false);
			setSelectedAllergie(null);
			setAddingNew(false);
			toast.info("Edición cancelada.");
		}
	};

	const allergyOptions = [
		{ label: "Medicamentos", value: "medication" },
		{ label: "Comida", value: "food" },
		{ label: "Polvo", value: "dust" },
		{ label: "Polen", value: "pollen" },
		{ label: "Cambio de Clima", value: "climateChange" },
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
						text="Agregar antecedente alérgico"
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
					Object.keys(AllergicHistory || {}).map((category) => {
						return AllergicHistory[category]?.data?.map((allergy) => {
							return (
								<InformationCard
									key={`${category}-${allergy.name || allergy.id}`}
									type="allergy"
									disease={allergy.name || "Sin Nombre"}
									reasonInfo={allergy.severity || "Sin Severidad"}
									onClick={() =>
										handleSelectAllergie({ ...allergy, selectedMed: category })
									}
								/>
							);
						});
					})
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
						value={selectedAllergie?.selectedMed || "medication"}
						disabled={!addingNew}
						onChange={(e) => handleFieldChange("selectedMed", e.target.value)}
						style={{
							container: { width: "90%" },
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
						¿A cuál?
					</p>
					<BaseInput
						value={selectedAllergie?.whichAllergie || ""}
						onChange={(e) => handleFieldChange("whichAllergie", e.target.value)}
						placeholder="Ingrese a cuál del tipo seleccionado"
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
						Tipo de reacción:
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
							disabled={!isEditable}
						/>
						<RadioInput
							label="Respiratoria"
							name="reactionType"
							checked={selectedAllergie?.reactionType === "Respiratoria"}
							onChange={() => handleFieldChange("reactionType", "Respiratoria")}
							style={{ label: { fontFamily: fonts.textFont } }}
							disabled={!isEditable}
						/>
						<RadioInput
							label="Ambos"
							name="reactionType"
							checked={selectedAllergie?.reactionType === "Ambos"}
							onChange={() => handleFieldChange("reactionType", "Ambos")}
							style={{ label: { fontFamily: fonts.textFont } }}
							disabled={!isEditable}
						/>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
						}}
					>
						<div style={{ display: "flex", justifyContent: "flex-end" }} />
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
				</div>
			) : null}
		</div>
	);
}
