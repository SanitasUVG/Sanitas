import { Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
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
	const [addingNew, setAddingNew] = useState(false);
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
		setAddingNew(true);
	};

	const handleSaveNewTrauma = async () => {
		if (
			!(selectedTrauma.whichBone && selectedTrauma.year) ||
			selectedTrauma.treatment === null
		) {
			toast.error(
				"Complete todos los campos requeridos, incluyendo el tipo de tratamiento.",
			);
			return;
		}

		console.log("Selected Trauma before saving:", selectedTrauma);

		toast.info("Guardando antecedente traumatológico...");

		const updatedTraumatologicHistory = {
			data: [...traumatologicHistory.data, selectedTrauma],
			version: traumatologicHistory.version,
		};

		console.log(
			"Updated Traumatologic History before sending:",
			updatedTraumatologicHistory,
		); // Verifica cómo se ha formado el historial completo

		updatedTraumatologicHistory.data.sort((a, b) => b.year - a.year);

		try {
			const response = await updateTraumatologicalHistory(
				id,
				updatedTraumatologicHistory.data,
				traumatologicHistory.version,
			);

			console.log("Response from server:", response);

			if (!response.error) {
				setTraumatologicHistory(updatedTraumatologicHistory);
				setAddingNew(false);
				setSelectedTrauma(null);
				toast.success("Antecedente traumatológico guardado con éxito.");
			} else {
				toast.error(`Error al guardar: ${response.error}`);
			}
		} catch (_error) {
			toast.error(
				"Hubo un error interno al guardar el registro traumatológico.",
			);
		}
	};

	const handleSelectTrauma = (traumatological) => {
		setSelectedTrauma({
			whichBone: traumatological.whichBone,
			year: traumatological.year,
			treatment: traumatological.treatment,
		});
		setAddingNew(false);
	};

	const handleCancel = () => {
		setAddingNew(false);
		setSelectedTrauma(null);
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
							setSelectedTrauma({
								...selectedTrauma,
								whichBone: e.target.value,
							})
						}
						placeholder="Ingrese el hueso fracturado"
						readOnly={!addingNew}
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
						readOnly={!addingNew}
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
							disabled={!addingNew}
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
							disabled={!addingNew}
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
							paddingTop: "5rem",
							display: "flex",
							justifyContent: "center",
						}}
					>
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