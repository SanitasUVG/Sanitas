import { Suspense, useEffect, useState, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import InformationCard from "src/components/InformationCard";
import WrapPromise from "src/utils/promiseWrapper";
import StudentDashboardTopbar from "src/components/StudentDashboardTopBar";
import { adjustHeight } from "src/utils/measureScaling";
import useWindowSize from "src/utils/useWindowSize";
import { getErrorMessage } from "src/utils/errorhandlerstoasts";

/**
 * @typedef {Object} StudentTraumatologicalHistoryProps
 * @property {Function} getBirthdayPatientInfo - Function to fetch the patient's birthdate.
 * @property {Function} getTraumatologicHistory - Function to fetch the traumatologic history of a patient.
 * @property {Function} updateTraumatologicalHistory - Function to update or add new traumatologic records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's traumatologic history, allowing users to add and view records.
 *
 * @param {StudentTraumatologicalHistoryProps} props - The props passed to the StudentTraumatologicalHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */
export function StudentTraumatologicalHistory({
	getBirthdayPatientInfo,
	getTraumatologicHistory,
	updateTraumatologicalHistory,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);

	const birthdayResource = useMemo(
		() => WrapPromise(getBirthdayPatientInfo(id)),
		[getBirthdayPatientInfo, id],
	);
	const traumatologicHistoryResource = useMemo(
		() => WrapPromise(getTraumatologicHistory(id)),
		[getTraumatologicHistory, id],
	);

	const LoadingView = () => (
		<Throbber loadingMessage="Cargando información de los antecedentes traumatológicos..." />
	);

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
					borderRadius: "10px",
					flex: "1",
					display: "flex",
					flexDirection: "column",
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						textAlign: "center",
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
							paddingBottom: "0.2rem",
						}}
					>
						¿Se ha fracturado algún hueso?
					</h3>
					<h3
						style={{
							fontFamily: fonts.textFont,
							fontWeight: "normal",
							fontSize: fontSize.subtitleSize,
							paddingBottom: "1.5rem",
						}}
					>
						Por favor ingrese un elemento por fractura.
					</h3>
				</div>
				<Suspense fallback={<LoadingView />}>
					<StudentTraumatologicalView
						id={id}
						birthdayResource={birthdayResource}
						traumatologicHistoryResource={traumatologicHistoryResource}
						updateTraumatologicalHistory={updateTraumatologicalHistory}
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
					activeSectionProp="traumatologicos"
				/>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} StudentTraumatologicalViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} birthdayResource - Wrapped resource for fetching birthdate data.
 * @property {Object} traumatologicHistoryResource - Wrapped resource for fetching traumatologic history data.
 * @property {Function} updateTraumatologicalHistory - Function to update the traumatologic history.
 *
 * Internal view component for managing the display and modification of a patient's traumatologic history, with options to add or edit records.
 *
 * @param {StudentTraumatologicalViewProps} props - Specific props for the StudentTraumatologicalView component.
 * @returns {JSX.Element} - A detailed view for managing traumatologic history with interactivity to add or edit records.
 */
// TODO: Simplify so the linter doesn't trigger
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: In the future we should think to simplify this...
function StudentTraumatologicalView({
	id,
	birthdayResource,
	traumatologicHistoryResource,
	updateTraumatologicalHistory,
}) {
	const { height, width } = useWindowSize();

	const [selectedTrauma, setSelectedTrauma] = useState(null);
	const [addingNew, setAddingNew] = useState(false);
	const [yearOptions, setYearOptions] = useState([]);
	const [isEditable, setIsEditable] = useState(false);

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

	const [traumatologicHistory, setStudentTraumatologicalHistory] = useState({
		data: sortedData,
		version: traumatologicHistoryData?.medicalHistory.traumas.version || 1,
	});

	// No traumatological data in API
	const noTraumaData = traumatologicHistory.data.length === 0;
	const currentYear = new Date().getFullYear();

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

	// Event handlers for adding, editing, and saving trauma history records
	const handleOpenNewForm = () => {
		setSelectedTrauma({
			whichBone: "",
			year: currentYear.toString(),
			treatment: null,
		});
		setAddingNew(true);
		setIsEditable(true);
	};

	const handleSaveNewTrauma = async () => {
		if (
			!(selectedTrauma.whichBone && selectedTrauma.year) ||
			selectedTrauma.treatment === undefined
		) {
			toast.error(
				"Complete todos los campos requeridos, incluyendo el tipo de tratamiento.",
			);
			return;
		}

		const isNewTrauma = selectedTrauma.index === undefined; // Determinar si es un nuevo registro
		toast.info(
			isNewTrauma
				? "Guardando nuevo antecedente traumatológico..."
				: "Actualizando antecedente traumatológico...",
		);

		const updatedData = [...traumatologicHistory.data];

		if (selectedTrauma.index !== undefined) {
			// Si se encuentra el índice, actualizar el registro existente
			updatedData[selectedTrauma.index] = selectedTrauma;
		} else {
			// Si no se encuentra el registro, añadir como nuevo
			updatedData.push(selectedTrauma);
		}

		updatedData.sort(
			(a, b) => Number.parseInt(b.year) - Number.parseInt(a.year),
		);

		try {
			const response = await updateTraumatologicalHistory(
				id,
				updatedData,
				traumatologicHistory.version,
			);

			if (!response.error) {
				setStudentTraumatologicalHistory({
					...traumatologicHistory,
					data: updatedData,
				});
				setAddingNew(false);
				setIsEditable(false);
				setSelectedTrauma(null);
				toast.success(
					isNewTrauma
						? "Antecedente traumatológico guardado con éxito."
						: "Antecedente traumatológico actualizado con éxito.",
				);
			} else {
				toast.error(getErrorMessage(response, "traumatologicos"));
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`);
		}
	};

	const handleSelectTrauma = (trauma, index) => {
		setSelectedTrauma({
			...trauma,
			index: index,
		});
		setAddingNew(false);
		setIsEditable(false);
	};

	const handleCancel = () => {
		if (addingNew) {
			setAddingNew(false);
			setSelectedTrauma(null);
		} else if (selectedTrauma !== null) {
			setIsEditable(false);
			setSelectedTrauma(null);
			toast.info("Edición cancelada.");
		}
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: width < 768 ? "column-reverse" : "row",
				width: "100%",
				flexGrow: 1,
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
					<p
						style={{
							textAlign: "center",
							paddingTop: "20px",
						}}
					>
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
							onClick={() => handleSelectTrauma(trauma, index)}
						/>
					))
				)}
			</div>

			{addingNew || selectedTrauma ? (
				<div
					style={{
						border: `1px solid ${colors.primaryBackground}`,
						borderRadius: "10px",
						padding: width < 768 ? "1rem" : "2rem",
						height: width < 768 ? "auto" : "65vh",
						flex: 1.5,
						overflowY: "auto",
						width: "100%",
					}}
				>
					<p
						style={{
							paddingBottom: "0.5rem",
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
						¿En qué año?
					</p>
					<DropdownMenu
						options={yearOptions}
						value={selectedTrauma.year}
						readOnly={!addingNew}
						onChange={(e) =>
							setSelectedTrauma({
								...selectedTrauma,
								year: e.target.value,
							})
						}
						style={{
							container: { width: "90%" },
							select: {},
							option: {},
							indicator: {},
						}}
						disabled={!isEditable}
					/>

					<p
						style={{
							paddingBottom: adjustHeight(height, "0.5rem"),
							paddingTop: adjustHeight(height, "1.5rem"),
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
							label="Conservador (yeso, canal, inmovilizador)"
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

					<div
						style={{
							display: "flex",
							flexDirection: width < 768 ? "column" : "row",
							alignItems: "center",
							justifyContent: "center",
							paddingTop: "2rem",
							gap: "0.5rem",
						}}
					>
						{addingNew && (
							<>
								<BaseButton
									text="Guardar"
									onClick={handleSaveNewTrauma}
									style={{ width: "12rem", height: "3rem" }}
								/>
								<BaseButton
									text="Cancelar"
									onClick={handleCancel}
									style={{
										width: "12rem",
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
