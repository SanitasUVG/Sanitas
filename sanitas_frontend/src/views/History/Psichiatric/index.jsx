import { Suspense, useEffect, useState } from "react";
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
	const psichiatricHistoryResource = WrapPromise(getPsichiatricHistory(id));

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
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} PsichiatricViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} psichiatricHistoryResource - Wrapped resource for fetching psichiatric history data.
 * @property {Function} updatePsichiatricHistory - Function to update the Allergic history.
 *
 * Internal view component for managing the display and modification of a patient's psichiatric history, with options to add or edit records.
 *
 * @param {PsichiatricViewProps} props - Specific props for the PsichiatricViewiew component.
 * @returns {JSX.Element} - A detailed view for managing Psichiatric history with interactivity to add or edit records.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
function PsichiatricView({
	id,
	psichiatricHistoryResource,
	updatePsichiatricHistory,
}) {
	const [selectedHistory, setSelectedHistory] = useState(null);
	const [addingNew, setAddingNew] = useState(false);

	const [showOtherInput, setShowOtherInput] = useState(false);

	const psichiatricHistoryResult = psichiatricHistoryResource.read();

	let errorMessage = "";

	if (psichiatricHistoryResult.error) {
		const error = psichiatricHistoryResult.error;
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

	const psichiatricHistoryData = psichiatricHistoryResult.result;

	const [PsichiatricHistory, setPsichiatricHistory] = useState(
		psichiatricHistoryData?.medicalHistory || {},
	);

	// No allergic data in API

	const noPsichiatricData = !Object.values(PsichiatricHistory).some(
		(category) => category?.data?.medication,
	);

	useEffect(() => {}, []);

	// Event handlers for adding, editing, and saving allergic history records
	const handleOpenNewForm = () => {
		setShowOtherInput(false);
		setSelectedHistory({
			selectedIll: "depression",
			medication: "",
			ill: "",
			dose: "",
			frecuency: "",
			ube: false,
			whichHistory: "",
		});
		setAddingNew(true);
	};

	// Save the new Allergic record to the database
	const handleSaveNewHistory = async () => {
		setShowOtherInput(false);
		if (!(selectedHistory.selectedIll && selectedHistory.medication)) {
			toast.error("Complete todos los campos requeridos.");
			return;
		}

		toast.info("Guardando antecedente psiquiátrico...");

		// Crear el nuevo registro de alergia
		const newHistoryData = {
			ill: selectedHistory.ill,
			medication: selectedHistory.medication,
			dose: selectedHistory.dose,
			frecuency: selectedHistory.frecuency,
			ube: selectedHistory.ube,
		};

		// Obtener la categoría actual (ej. medicamento, comida, etc.)
		const currentCategoryData =
			PsichiatricHistory[selectedHistory.selectedIll]?.data || {};

		// Si la categoría ya tiene datos, usamos su versión, de lo contrario, establecemos la versión en 1
		const currentVersion =
			PsichiatricHistory[selectedHistory.selectedIll]?.version || 1;

		// Actualizar la categoría con el nuevo registro
		const updatedCategory = {
			version: currentVersion,
			data: { ...currentCategoryData, ...newHistoryData },
		};

		// Actualizar el historial médico con la nueva categoría
		const updatedMedicalHistory = {
			...PsichiatricHistory,
			[selectedHistory.selectedIll]: updatedCategory,
		};

		try {
			const response = await updatePsichiatricHistory(
				id,
				updatedMedicalHistory,
			);
			if (!response.error) {
				setPsichiatricHistory(updatedMedicalHistory);
				setAddingNew(false);
				setSelectedHistory(null);
				toast.success("Antecedente psiquiátrico guardado con éxito.");
			} else {
				toast.error(`Error al guardar: ${response.error}`);
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`);
		}
	};

	const handleFieldChange = (fieldName, value) => {
		setSelectedHistory((prevHistory) => ({
			...prevHistory,
			[fieldName]: value,
		}));

		// Handling the "Otros" option to show the additional input
		if (fieldName === "selectedIll" && value === "other") {
			setShowOtherInput(true);
		} else if (fieldName === "selectedIll") {
			setShowOtherInput(false);
		}
	};
	const handleCancel = () => {
		setSelectedHistory(null);
		setAddingNew(false);
	};

	const handleOnClickCard = (category, historyData) => {
		if (category === "other") {
			setShowOtherInput(true);
		} else {
			setShowOtherInput(false);
		}
		setSelectedHistory({ selectedIll: category, ...historyData });
	};

	const medicalHistoryOptions = [
		{ label: "Depresión", value: "depression" },
		{ label: "Ansiedad", value: "anxiety" },
		{ label: "TOC (Trastorno Obsesivo Compulsivo)", value: "ocd" },
		{
			label: "TDAH (Trastorno por Déficit de Atención e Hiperactividad)",
			value: "adhd",
		},
		{ label: "Trastorno Bipolar", value: "bipolar" },
		{ label: "Otros", value: "other" },
	];

	const categoryTranslations = {
		depression: "Depresión",
		anxiety: "Ansiedad",
		ocd: "TOC (Trastorno Obsesivo Compulsivo)",
		adhd: "TDAH (Trastorno por Déficit de Atención e Hiperactividad)",
		bipolar: "Trastorno Bipolar",
		other: "Otros",
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
				<div
					style={{
						paddingBottom: "0.5rem",
					}}
				>
					<BaseButton
						text="Agregar antecedente psiquiátrico"
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

				{noPsichiatricData && !errorMessage ? (
					<p style={{ textAlign: "center", paddingTop: "20px" }}>
						¡Parece que no hay antecedentes psiquiátricos! Agrega uno en el
						botón de arriba.
					</p>
				) : (
					Object.keys(PsichiatricHistory || {}).map((category) => {
						const historyData = PsichiatricHistory[category]?.data;

						// Verifica si hay datos válidos en los campos antes de renderizar la tarjeta
						if (
							historyData?.medication ||
							historyData?.dose ||
							historyData?.frecuency
						) {
							return (
								<InformationCard
									key={category}
									type="psichiatric"
									disease={categoryTranslations[category] || category}
									reasonInfo={historyData?.medication || "Sin Medicamento"}
									onClick={() => handleOnClickCard(category, historyData)}
								/>
							);
						}

						return null; // Si no hay datos válidos, no renderiza nada
					})
				)}
			</div>

			{addingNew || selectedHistory ? (
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
						Seleccione la enfermedad:
					</p>
					<DropdownMenu
						options={medicalHistoryOptions}
						value={selectedHistory?.selectedIll || "depression"}
						readOnly={!addingNew}
						onChange={(e) => handleFieldChange("selectedIll", e.target.value)}
						style={{
							container: { width: "80%" },
							select: {},
							option: {},
							indicator: {},
						}}
					/>
					{showOtherInput && (
						<div>
							<p
								style={{
									paddingBottom: "0.5rem",
									paddingTop: "1.5rem",
									fontFamily: fonts.textFont,
									fontSize: fontSize.textSize,
								}}
							>
								Nombre de la enfermedad:
							</p>
							<BaseInput
								value={selectedHistory?.ill || ""}
								onChange={(e) => handleFieldChange("ill", e.target.value)}
								placeholder="Ingrese el nombre de la enfermedad"
								style={{
									width: "80%",
									height: "2.5rem",
									fontFamily: fonts.textFont,
									fontSize: "1rem",
								}}
							/>
						</div>
					)}

					<p
						style={{
							paddingBottom: "0.5rem",
							paddingTop: "2rem",
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
						}}
					>
						Medicamento:
					</p>
					<BaseInput
						value={selectedHistory.medication || ""}
						onChange={(e) => handleFieldChange("medication", e.target.value)}
						placeholder="Ingrese el medicamento administrado (terapia entra en la categoría)"
						style={{
							width: "80%",
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
						Dosis:
					</p>
					<BaseInput
						value={selectedHistory.dose || ""}
						onChange={(e) => handleFieldChange("dose", e.target.value)}
						placeholder="Ingrese cuánto (opcional)"
						style={{
							width: "80%",
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
						Frecuencia:
					</p>
					<BaseInput
						value={selectedHistory.frecuency || ""}
						onChange={(e) => handleFieldChange("frecuency", e.target.value)}
						placeholder="Ingrese cada cuánto administra el medicamento"
						style={{
							width: "80%",
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
						¿Tiene seguimiento en UBE?
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
							label="Si"
							name="ube"
							checked={selectedHistory?.ube === true}
							onChange={() => handleFieldChange("ube", true)}
							style={{ label: { fontFamily: fonts.textFont } }}
						/>
						<RadioInput
							label="No"
							name="ube"
							checked={selectedHistory?.ube === false}
							onChange={() => handleFieldChange("ube", false)}
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
									onClick={handleSaveNewHistory}
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
