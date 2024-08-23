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
 * @property {Function} updateTraumatologicHistory - Function to update or add new traumatologic records for a patient.
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
function TraumatologicView({
	id,
	birthdayResource,
	traumatologicHistoryResource,
	updateTraumatologicalHistory,
}) {
	const [selectedTrauma, setSelectedTrauma] = useState(null);
	const [isEditable, setisEditable] = useState(false);
	const [yearOptions, setYearOptions] = useState([]);

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

	const birthYearData = birthYearResult.result;
	const traumatologicHistoryData = traumatologicHistoryResult.result;

	const sortedData =
		traumatologicHistoryData?.medicalHistory.traumas.data || [];
	sortedData.sort((a, b) => Number.parseInt(b.year) - Number.parseInt(a.year));

	const [traumatologicHistory, setTraumatologicHistory] = useState({
		data: sortedData,
		version: traumatologicHistoryData?.medicalHistory.traumas.version || 1,
	});

	// No traumatological data in API
	const noTraumaData = traumatologicHistory.data.length === 0;
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

	// Event handlers for adding, editing, and saving trauma history records
	const handleOpenNewForm = () => {
		setSelectedTrauma({
			whichBone: "",
			year: currentYear.toString(),
			treatment: null,
		});
		setisEditable(true);
	};

	const handleSaveNewTrauma = async () => {
		if (!(selectedTrauma.whichBone && selectedTrauma.year) || selectedTrauma.treatment === null) {
			toast.error("Complete todos los campos requeridos, incluyendo el tipo de tratamiento.");
			return;
		}
	
		toast.info("Guardando antecedente traumatológico...");
	
		// Copia los datos actuales
		let updatedTraumaData = [...traumatologicHistory.data];
	
		// Busca el índice del trauma existente que coincida con el hueso
		const traumaIndex = updatedTraumaData.findIndex(
			(trauma) => trauma.whichBone === selectedTrauma.whichBone
		);
	
		if (traumaIndex !== -1) {
			// Si el trauma ya existe, actualiza ese objeto
			updatedTraumaData[traumaIndex] = selectedTrauma;
		} else {
			// Si no existe, agrega el nuevo trauma
			updatedTraumaData.push(selectedTrauma);
		}
	
		// Ordena los traumas por año
		updatedTraumaData.sort((a, b) => Number.parseInt(b.year) - Number.parseInt(a.year));
	
		try {
			const response = await updateTraumatologicalHistory(
				id,
				updatedTraumaData,
				traumatologicHistory.version,
			);
	
			if (!response.error) {
				// Actualiza el estado local con los nuevos datos
				setTraumatologicHistory({
					data: updatedTraumaData,
					version: traumatologicHistory.version + 1,
				});
				setisEditable(false);
				setSelectedTrauma(null);
				toast.success("Antecedente traumatológico guardado con éxito.");
			} else {
				toast.error(`Error al guardar: ${response.error}`);
			}
		} catch (_error) {
			toast.error("Hubo un error interno al guardar el registro traumatológico.");
		}
	};
	
	
	

	const handleSelectTrauma = (traumatological) => {
		setSelectedTrauma({
			whichBone: traumatological.whichBone,
			year: traumatological.year,
			treatment: traumatological.treatment,
		});
		setisEditable(false);
	};

	const handleEdit = () => {
		setisEditable(true);
	};
/** 
	const handleSaveEdit = async () => {
		// Validation logic
		if (!selectedTrauma.whichBone || !selectedTrauma.year || selectedTrauma.treatment === null) {
			toast.error("Complete todos los campos requeridos.");
			return;
		}

		// Logic for saving the edited trauma
		const updatedTraumatologicHistory = {
			...traumatologicHistory,
			data: traumatologicHistory.data.map((trauma) =>
				trauma.year === selectedTrauma.year ? selectedTrauma : trauma
			),
		};

		// API call to update the traumatologic history
		try {
			const response = await updateTraumatologicalHistory(id, updatedTraumatologicHistory.data, traumatologicHistory.version);
			if (!response.error) {
				setTraumatologicHistory(updatedTraumatologicHistory);
				setisEditable(false);
				toast.success("Antecedente traumatológico editado con éxito.");
			} else {
				toast.error(`Error al editar: ${response.error}`);
			}
		} catch (_error) {
			toast.error("Hubo un error interno al editar el registro.");
		}
	};
/** */
	const handleCancel = () => {
		setSelectedTrauma(null);
		setisEditable(false);
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
					traumatologicHistory.data.map((trauma, index) => (
						<InformationCard
							key={`${trauma.year}-${trauma.whichBone}-${index}`}
							type="traumatological"
							year={trauma.year}
							reasonInfo={trauma.whichBone}
							onClick={() => handleSelectTrauma(trauma)}
						/>
					))
				)}
			</div>

			{isEditable || selectedTrauma ? (
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
							setSelectedTrauma({
								...selectedTrauma,
								whichBone: e.target.value,
							})
						}
						placeholder="Ingrese el hueso fracturado"
						readOnly={!isEditable}
						style={{
							width: "95%",
							height: "2.5rem",
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
						¿En qué año?
					</p>
					<DropdownMenu
						options={yearOptions}
						value={selectedTrauma.year}
						readOnly={!isEditable}
						onChange={(e) =>
							setSelectedTrauma({
								...selectedTrauma,
								year: e.target.value,
							})
						}
						style={{
							container: { width: "95%" },
							select: {},
							option: {},
							indicator: {},
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
							disabled={!isEditable}
							checked={selectedTrauma?.treatment === "Cirugía"}
							onChange={() =>
								setSelectedTrauma({
									...selectedTrauma,
									treatment: "Cirugía",
								})
							}
							style={{ label: { fontFamily: fonts.textFont } }}
						/>
						<RadioInput
							label="Conservador"
							name="treatment"
							disabled={!isEditable}
							checked={selectedTrauma?.treatment === "Conservador"}
							onChange={() =>
								setSelectedTrauma({
									...selectedTrauma,
									treatment: "Conservador",
								})
							}
							style={{ label: { fontFamily: fonts.textFont } }}
						/>
					</div>

					{isEditable ? (
						<div style={{ display: "flex", justifyContent: "space-between" }}>
							<IconButton
								icon={CheckIcon}
								onClick={handleSaveNewTrauma}
								tooltip="Confirmar"
							/>
							<IconButton
								icon={CancelIcon}
								onClick={handleCancel}
								tooltip="Cancelar"
							/>
						</div>
					) : (
						<IconButton
							icon={EditIcon}
							onClick={() => setisEditable(true)}
							tooltip="Editar"
						/>
					)}
				</div>
			) : null}
		</div>
	);
}
