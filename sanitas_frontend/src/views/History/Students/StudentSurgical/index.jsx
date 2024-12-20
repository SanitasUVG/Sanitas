import { Suspense, useEffect, useState, useMemo } from "react";
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
import { adjustHeight } from "src/utils/measureScaling";
import useWindowSize from "src/utils/useWindowSize";
import { getErrorMessage } from "src/utils/errorhandlerstoasts";

/**
 * @typedef {Object} StudentSurgicalHistoryProps
 * @property {Function} getBirthdayPatientInfo - Function to fetch the patient's birthdate.
 * @property {Function} getStudentSurgicalHistory - Function to fetch the surgical history of a patient.
 * @property {Function} updateStudentSurgicalHistory - Function to update or add new surgical records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's surgical history, allowing users to add and view records.
 *
 * @param {StudentSurgicalHistoryProps} props - The props passed to the StudentSurgicalHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */
export function StudentSurgicalHistory({
	getBirthdayPatientInfo,
	getStudentSurgicalHistory,
	updateStudentSurgicalHistory,
	sidebarConfig,
	useStore,
}) {
	const { height } = useWindowSize();
	const id = useStore((s) => s.selectedPatientId);

	const birthdayResource = useMemo(
		() => WrapPromise(getBirthdayPatientInfo(id)),
		[getBirthdayPatientInfo, id],
	);

	const surgicalHistoryResource = useMemo(
		() => WrapPromise(getStudentSurgicalHistory(id)),
		[getStudentSurgicalHistory, id],
	);

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes quirúrgicos..." />
		);
	};

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
					overflow: "auto",
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
						Antecedentes Quirúrgicos
					</h1>
					<h3
						style={{
							fontFamily: fonts.textFont,
							fontWeight: "normal",
							fontSize: fontSize.subtitleSize,
							paddingTop: adjustHeight(height, "0.7rem"),
							paddingBottom: adjustHeight(height, "0.2rem"),
						}}
					>
						¿Lo han operado alguna vez?
					</h3>
					<h3
						style={{
							fontFamily: fonts.textFont,
							fontWeight: "normal",
							fontSize: fontSize.subtitleSize,
							paddingBottom: "1.5rem",
						}}
					>
						Por favor ingrese un elemento por cirugía.
					</h3>
				</div>
				<Suspense fallback={<LoadingView />}>
					<SurgicalView
						id={id}
						birthdayResource={birthdayResource}
						surgicalHistoryResource={surgicalHistoryResource}
						updateStudentSurgicalHistory={updateStudentSurgicalHistory}
					/>
				</Suspense>
			</div>

			<div
				style={{
					width: "100%",
					height: "100%",
					padding: "1rem 0 0 0",
					flex: "0 0 20%",
				}}
			>
				<StudentDashboardTopbar
					{...sidebarConfig}
					activeSectionProp="quirurgicos"
				/>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} SurgicalViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} birthdayResource - Wrapped resource for fetching birthdate data.
 * @property {Object} surgicalHistoryResource - Wrapped resource for fetching surgical history data.
 * @property {Function} updateStudentSurgicalHistory - Function to update the surgical history.
 *
 * Internal view component for managing the display and modification of a patient's surgical history, with options to add or edit records.
 *
 * @param {SurgicalViewProps} props - Specific props for the SurgicalView component.
 * @returns {JSX.Element} - A detailed view for managing surgical history with interactivity to add or edit records.
 */
// TODO: Simplify so the linter doesn't trigger
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: In the future we should think to simplify this...
function SurgicalView({
	id,
	birthdayResource,
	surgicalHistoryResource,
	updateStudentSurgicalHistory,
}) {
	const { height, width } = useWindowSize();

	const [selectedSurgery, setSelectedSurgery] = useState(null);
	const [addingNew, setAddingNew] = useState(false);
	const [yearOptions, setYearOptions] = useState([]);
	const [isEditable, setIsEditable] = useState(false);

	const birthYearResult = birthdayResource.read();
	const surgicalHistoryResult = surgicalHistoryResource.read();

	let errorMessage = "";
	if (birthYearResult.error || surgicalHistoryResult.error) {
		const error = birthYearResult.error || surgicalHistoryResult.error;
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

	const birthYearData = birthYearResult.result;
	const surgicalHistoryData = surgicalHistoryResult.result;

	const sortedData = surgicalHistoryData?.medicalHistory.surgeries.data || [];
	sortedData.sort(
		(a, b) => Number.parseInt(b.surgeryYear) - Number.parseInt(a.surgeryYear),
	);

	const [surgicalHistory, setStudentSurgicalHistory] = useState({
		data: sortedData,
		version: surgicalHistoryData?.medicalHistory.surgeries.version || 1,
	});

	// No surgical data in API
	const noSurgeryData = surgicalHistory.data.length === 0;
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

	// Event handlers for adding, editing, and saving surgical history records
	const handleOpenNewForm = () => {
		setSelectedSurgery({
			surgeryType: "",
			surgeryYear: currentYear.toString(),
			complications: "",
		});
		setAddingNew(true);
		setIsEditable(true);
	};

	// Save the new surgery record to the database
	const handleSaveNewSurgery = async () => {
		if (
			!(selectedSurgery.surgeryType && selectedSurgery.surgeryYear) ||
			selectedSurgery.complications === undefined
		) {
			toast.error("Complete todos los campos requeridos.");
			return;
		}

		const isNewSurgery = selectedSurgery.index === undefined; // Determinar si es un nuevo registro
		toast.info(
			isNewSurgery
				? "Guardando nuevo antecedente quirúrgico..."
				: "Actualizando antecedente quirúrgico...",
		);

		const updatedData = [...surgicalHistory.data];

		if (!isNewSurgery) {
			// Actualizar el registro existente
			updatedData[selectedSurgery.index] = selectedSurgery;
		} else {
			// Añadir como nuevo
			updatedData.push(selectedSurgery);
		}

		updatedData.sort(
			(a, b) => Number.parseInt(b.surgeryYear) - Number.parseInt(a.surgeryYear),
		);

		try {
			const response = await updateStudentSurgicalHistory(
				id,
				updatedData,
				surgicalHistory.version,
			);
			if (!response.error) {
				setStudentSurgicalHistory({ ...surgicalHistory, data: updatedData });
				setAddingNew(false);
				setIsEditable(false);
				setSelectedSurgery(null);
				toast.success(
					isNewSurgery
						? "Antecedente quirúrgico guardado con éxito."
						: "Antecedente quirúrgico actualizado con éxito.",
				);
			} else {
				toast.error(getErrorMessage(response, "quirurgicos"));
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`);
		}
	};

	// Select a surgery record to view
	const handleSelectSurgery = (surgery, index) => {
		setSelectedSurgery({
			...surgery,
			index: index,
		});
		setAddingNew(false);
		setIsEditable(false);
	};

	const handleCancel = () => {
		if (addingNew) {
			setAddingNew(false);
			setSelectedSurgery(null);
			setIsEditable(false);
		} else if (selectedSurgery !== null) {
			setIsEditable(false);
			setSelectedSurgery(null);
			setAddingNew(false);
			toast.info("Edición cancelada.");
		}
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: width < 768 ? "column-reverse" : "row", //Menor a 768px se muestra en columna
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
						text="Agregar antecedente quirúrgico"
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

				{noSurgeryData && !errorMessage ? (
					<p
						style={{
							textAlign: "center",
							paddingTop: "20px",
						}}
					>
						¡Parece que no hay antecedentes quirúrgicos! Agrega uno en el botón
						de arriba.
					</p>
				) : (
					surgicalHistory.data.map((surgery, index) => (
						<InformationCard
							key={`${surgery.surgeryYear}-${surgery.surgeryType}-${index}`}
							type="surgical"
							year={surgery.surgeryYear}
							reasonInfo={surgery.surgeryType}
							onClick={() => handleSelectSurgery(surgery, index)}
						/>
					))
				)}
			</div>

			{addingNew || selectedSurgery ? (
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
						¿De qué?
					</p>
					<BaseInput
						value={selectedSurgery ? selectedSurgery.surgeryType : ""}
						onChange={(e) =>
							setSelectedSurgery({
								...selectedSurgery,
								surgeryType: e.target.value,
							})
						}
						readOnly={!isEditable}
						placeholder="Ingrese acá el motivo o tipo de cirugía."
						style={{
							width: "90%",
							height: "3rem",
							fontFamily: fonts.textFont,
							fontSize: "1rem",
						}}
					/>

					<p
						style={{
							paddingBottom: adjustHeight(height, "0.5rem"),
							paddingTop: adjustHeight(height, "2rem"),
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
						}}
					>
						¿En qué año?
					</p>
					<DropdownMenu
						options={yearOptions}
						value={selectedSurgery.surgeryYear}
						disabled={!isEditable}
						onChange={(e) =>
							setSelectedSurgery({
								...selectedSurgery,
								surgeryYear: e.target.value,
							})
						}
						style={{
							container: { width: "90%", height: "3rem" },
							select: {},
							option: {},
							indicator: {
								top: "50%",
								right: "4%",
							},
						}}
					/>

					<p
						style={{
							paddingBottom: adjustHeight(height, "0.5rem"),
							paddingTop: adjustHeight(height, "2rem"),
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
						}}
					>
						¿Tuvo alguna complicación?
					</p>
					<BaseInput
						value={selectedSurgery.complications || ""}
						onChange={(e) =>
							setSelectedSurgery({
								...selectedSurgery,
								complications: e.target.value,
							})
						}
						readOnly={!isEditable}
						placeholder="Ingrese complicaciones que pudo haber tenido durante o después de la cirugía."
						style={{
							width: "90%",
							height: "3rem",
							fontFamily: fonts.textFont,
							fontSize: "1rem",
						}}
					/>

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
									onClick={handleSaveNewSurgery}
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
