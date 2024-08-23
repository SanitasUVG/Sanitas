import { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";
import IconButton from "src/components/Button/Icon";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import InformationCard from "src/components/InformationCard";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * @typedef {Object} TraumatologicHistoryProps
 * @property {Function} getBirthdayPatientInfo - Function to fetch the patient's birthdate.
 * @property {Function} getTraumatologicHistory - Function to fetch the traumatologic history of a patient.
 * @property {Function} updateTraumatologicalHistory - Function to update or add new traumatologic records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's traumatologic history, allowing users to add and view records.
 *
 * @param {TraumatologicHistoryProps} props - The props passed to the TraumatologicHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */
export function TraumatologicHistory({
	getBirthdayPatientInfo,
	getTraumatologicHistory,
	updateTraumatologicalHistory,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
	const birthdayResource = WrapPromise(getBirthdayPatientInfo(id));
	const traumatologicHistoryResource = WrapPromise(getTraumatologicHistory(id));

	const LoadingView = () => (
		<Throbber loadingMessage="Cargando información de los antecedentes traumatológicos..." />
	);

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
			<div style={{ width: "25%" }}>
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
							Antecedentes Traumatológicos
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
							Registro de antecedentes traumatológicos
						</h3>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-between",
							alignItems: "space-between",
							width: "100%",
							gap: "2rem",
						}}
					>
						<Suspense fallback={<LoadingView />}>
							<TraumatologicView
								id={id}
								birthdayResource={birthdayResource}
								traumatologicHistoryResource={traumatologicHistoryResource}
								updateTraumatologicalHistory={updateTraumatologicalHistory}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} TraumatologicViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} birthdayResource - Wrapped resource for fetching birthdate data.
 * @property {Object} traumatologicHistoryResource - Wrapped resource for fetching traumatologic history data.
 * @property {Function} updateTraumatologicalHistory - Function to update the traumatologic history.
 *
 * Internal view component for managing the display and modification of a patient's traumatologic history, with options to add or edit records.
 *
 * @param {TraumatologicViewProps} props - Specific props for the TraumatologicView component.
 * @returns {JSX.Element} - A detailed view for managing traumatologic history with interactivity to add or edit records.
 */
// TODO: Simplify so the linter doesn't trigger
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: In the future we should think to simplify this...
function TraumatologicView({ id, birthdayResource, traumatologicHistoryResource, updateTraumatologicalHistory }) {
	const [selectedTrauma, setSelectedTrauma] = useState(null);
	const [isEditable, setIsEditable] = useState(false);
	const [addingNew, setAddingNew] = useState(false);
	const [yearOptions, setYearOptions] = useState([]);

	const isFirstTime = addingNew;

	const birthYearResult = birthdayResource.read();
	const traumatologicHistoryResult = traumatologicHistoryResource.read();

	let errorMessage = "";
	if (birthYearResult.error || traumatologicHistoryResult.error) {
		const error = birthYearResult.error || traumatologicHistoryResult.error;
		if (error?.response) {
			const { status } = error.response;
			errorMessage =
				status < 500
					? "Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!"
					: "Ha ocurrido un error interno, lo sentimos.";
		} else {
			errorMessage =
				"Ha ocurrido un error procesando tu solicitud, por favor vuelve a intentarlo.";
		}
	}

	if (traumatologicHistoryResult.error) {
		const error = traumatologicHistoryResult.error;
		if (error.response) {
			const { status } = error.response;
			if (status < 500) {
				errorMessage =
					"Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!";
			} else {
				errorMessage = "Ha ocurrido un error interno, lo sentimos.";
			}
		} else {
			errorMessage = error.message || "Error desconocido";
		}
	}

	const birthYearData = birthYearResult.result;
	const traumatologicHistoryData = traumatologicHistoryResult.result;

	const [TraumatologicHistory, setTraumatologicHistory] = useState(
		traumatologicHistoryData?.medicalHistory || {},
	);

	// No Traumatologicak data in API
	console.log("TraumatologicHistory before update:", TraumatologicHistory);

	const noTraumaData = !(
		TraumatologicHistory?.medicalHistory?.traumas?.data &&
		Array.isArray(TraumatologicHistory.medicalHistory.traumas.data) &&
		TraumatologicHistory.medicalHistory.traumas.data.length > 0
	);
	


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
	}, [birthYear, currentYear]);


	const handleOpenNewForm = () => {
		setSelectedTrauma({
			whichBone: "",
			year: "",
			treatment: "",
		});
		setAddingNew(true);
		setIsEditable(true);
	};

	const handleSaveNewTrauma = async () => {
		if (!(selectedTrauma.whichBone && selectedTrauma.year && selectedTrauma.treatment)) {
		  toast.error("Complete todos los campos requeridos.");
		  return;
		}
	  
		toast.info("Guardando antecedente traumatológico...");
	  
		// Log para verificar que selectedTrauma está correcto
		console.log("Trauma seleccionado antes de guardar:", selectedTrauma);
	  
		const updatedTrauma = {
		  whichBone: selectedTrauma.whichBone,
		  year: selectedTrauma.year,
		  treatment: selectedTrauma.treatment,
		};
	  

	let updatedMedicalHistory;

	if (isFirstTime) {
		// Si es la primera vez, agrega un nuevo registro
		const currentCategoryData = TraumatologicHistory.data || [];
	
		const currentVersion = TraumatologicHistory.version || 1;
	
		const updatedCategory = {
		  version: currentVersion + 1, // Incrementa la versión para reflejar el cambio
		  data: [...currentCategoryData, updatedTrauma],
		};
	
		updatedMedicalHistory = {
		  ...TraumatologicHistory,
		  data: updatedCategory.data, // Actualiza la data con el nuevo trauma agregado
		  version: updatedCategory.version,
		};
	  } else {
		console.log(TraumatologicHistory); // Agrega esto antes de la línea que da error

		// Si estamos editando, reemplaza directamente los datos de la categoría seleccionada
		const updatedCategory = {
		  version: TraumatologicHistory.version, // Mantiene la versión actual
		  data: [...TraumatologicHistory.data, updatedTrauma], // Agrega el nuevo trauma al historial existente
		};
	
		updatedMedicalHistory = {
		  ...TraumatologicHistory,
		  data: updatedCategory.data, // Actualiza la data
		  version: updatedCategory.version,
		};
	  }
	
	  // Log para verificar updatedMedicalHistory antes de enviarlo
	  console.log("Historial médico actualizado:", updatedMedicalHistory);

	  console.log(updateTraumatologicalHistory); 
	
	  try {
		const response = await updateTraumatologicalHistory(id, updatedMedicalHistory);
		if (!response.error) {
		  setTraumatologicHistory(updatedMedicalHistory); // Actualiza el estado local
		  setAddingNew(false);
		  setSelectedTrauma(null);
		  setIsEditable(false);
		  toast.success("Antecedente traumatológico guardado con éxito.");
		} else {
		  toast.error(`Error al guardar: ${response.error}`);
		}
	  } catch (error) {
		toast.error(`Error en la operación: ${error.message}`);
	  }
	};

	const handleSelectTrauma = (trauma) => {
		setSelectedTrauma({
			whichBone: trauma.whichBone || "",
			year: trauma.year || "",
			treatment: trauma.treatment || "",
		});
		setIsEditable(false);
		setAddingNew(false);
	};

	const handleFieldChange = (fieldName, value) => {
		setSelectedTrauma((prevTrauma) => ({
			...prevTrauma,
			[fieldName]: value,
		}));
	};

	const handleCancel = () => {
		setIsEditable(false);
		setAddingNew(false);
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
				<div
					style={{
						paddingBottom: "0.5rem",
					}}
				>
					<BaseButton
						text="Agregar antecedente traumatológico"
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

				{noTraumaData && !errorMessage ? (
					<p style={{ textAlign: "center", paddingTop: "20px" }}>
						¡Parece que no hay antecedentes traumatológicos! Agrega uno en el
						botón de arriba.
					</p>
				) : (
					TraumatologicHistory.data.map((trauma) => (
						<InformationCard
							key={`${trauma.year}-${trauma.whichBone}-${trauma.id}`}
							type="traumatological"
							year={trauma.year}
							reasonInfo={trauma.whichBone}
							onClick={() => handleSelectTrauma(trauma)}
						/>
					))
				)}
			</div>

			{addingNew || selectedTrauma ? (
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
							paddingTop: "1rem",
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
						}}
					>
						¿Qué hueso se ha fracturado?
					</p>
					<BaseInput
						value={selectedTrauma ? selectedTrauma.whichBone : ""}
						onChange={(e) =>
							handleFieldChange("whichBone", e.target.value,
							)
						}
						placeholder="Ingrese el hueso fracturado"
						style={{
							width: "95%",
							height: "2.5rem",
							fontFamily: fonts.textFont,
							fontSize: "1rem",
						}}
						disabled={!isEditable}
					/>

					<p
						style={{
							paddingBottom: "0.5rem",
							paddingTop: "1.5rem",
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
						}}
					>
						¿En qué año?
					</p>
					<DropdownMenu
						options={yearOptions}
						value={selectedTrauma.year}
						readOnly={!addingNew}
						onChange={(e) => handleFieldChange("year", e.target.value,
							)
						}
						style={{
							container: { width: "95%" },
							select: {},
							option: {},
							indicator: {},
						}}
						disabled={!isEditable}
					/>

					<p
						style={{
							paddingBottom: "0.5rem",
							paddingTop: "1.5rem",
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
						}}
					>
						¿Qué tipo de tratamiento tuvo?
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
							label="Cirugía"
							name="treatment"
							checked={selectedTrauma?.treatment === "Cirugía"}
							onChange={() => handleFieldChange("treatment","Cirugía")
							}
							style={{ label: { fontFamily: fonts.textFont } }}
							disabled={!isEditable}
						/>
						<RadioInput
							label="Conservador (yeso, canal, inmovilizador)"
							name="treatment"
							checked={selectedTrauma?.treatment === "Conservador"}
							onChange={() => handleFieldChange("treatment", "Conservador",
								)
							}
							style={{ label: { fontFamily: fonts.textFont } }}
							disabled={!isEditable}
						/>
					</div>

					<div
						style={{
							paddingTop: "5rem",
							display: "flex",
							justifyContent: "center",
						}}
					>
						<div style={{ display: "flex", justifyContent: "flex-end" }}>
						{!isFirstTime &&
								(isEditable ? (
									<div style={{ display: "flex", gap: "1rem" }}>
									<IconButton icon={CheckIcon} onClick={handleSaveNewTrauma} />
									<IconButton icon={CancelIcon} onClick={handleCancel} />
								</div>
							) : (
								<IconButton icon={EditIcon} onClick={() => setIsEditable(true)} />
							))}
					
						</div>

						{addingNew && (
							<>
								<BaseButton
									text="Guardar"
									onClick={handleSaveNewTrauma}
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