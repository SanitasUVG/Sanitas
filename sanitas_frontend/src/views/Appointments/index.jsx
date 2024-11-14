import { Suspense, useState, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import InformationCard from "src/components/InformationCard";
import { BaseInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import ExpandingBaseInput from "src/components/Input/ExpandingBaseInput";
import { IS_PRODUCTION } from "src/constants.mjs";

/**
 * Provides a view for managing student appointments. This component is responsible for displaying
 * the student appointments management interface, allowing for actions such as viewing, adding, and
 * editing appointments. It integrates components like DashboardSidebar, InformationCard, and inputs
 * for a cohesive user experience.
 *
 * @param {Object} props - The properties passed to the StudentAppointments component.
 * @param {function} props.getAppointment - Function to fetch appointments data.
 * @param {function} props.updateAppointment - Function to update appointment data.
 * @param {Object} props.sidebarConfig - Configuration for the DashboardSidebar component.
 * @param {function} props.useStore - A custom hook for state management, typically provided by Zustand.
 * @returns {JSX.Element} The rendered component.
 */
export function StudentAppointments({
	getAppointment,
	updateAppointment,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);

	const appointmentResource = useMemo(
		() => WrapPromise(getAppointment(id)),
		[getAppointment, id],
	);
	const displayName = useStore((s) => s.displayName);

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de las visitas del estudiante..." />
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
							Citas del Paciente
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
							Registro y visualización de citas del paciente
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
							<StudentAppointmentsView
								id={id}
								appointmentResource={appointmentResource}
								updateAppointment={updateAppointment}
								displayName={displayName}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * Handles the display and interaction logic for individual appointments within the student
 * appointments management view. It provides functionality for selecting, adding, and modifying
 * appointments, as well as handling errors and state updates.
 *
 * @param {Object} props - The properties passed to the StudentAppointmentsView component.
 * @param {string} props.id - The identifier of the student whose appointments are being managed.
 * @param {Object} props.appointmentResource - Wrapped promise representing the student's appointments data.
 * @param {function} props.updateAppointment - Function to update appointment data.
 * @param {string} props.displayName - The display name of the current user, used for default values.
 * @returns {JSX.Element} The rendered component with the ability to interact with appointments.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity:  Is the main function of the view
function StudentAppointmentsView({
	id,
	appointmentResource,
	updateAppointment,
	displayName,
}) {
	const appointmentResult = appointmentResource.read();

	const [selectedAppointment, setselectedAppointment] = useState(null);
	const [currentAppointment, setCurrentAppointment] = useState(null);
	const [addingNew, setAddingNew] = useState(false);
	const [isEditable, setIsEditable] = useState(false);
	const [medications, setMedications] = useState([]);

	//Read the data from the resource and handle any potential errors
	let errorMessage = "";
	if (appointmentResult.error) {
		const error = appointmentResult.error;
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

	/**
	 * Initializes the process to add a new appointment. Sets up default values and state for a new appointment entry.
	 */
	const handleOpenNewForm = () => {
		const { date, formattedDate } = getFormattedDateTime();
		setAddingNew(true);
		setIsEditable(true);

		const evaluatorEmail = IS_PRODUCTION ? displayName : "doctor1@example.com";
		setCurrentAppointment({
			date: date,
			formattedDate: formattedDate,
			evaluator: evaluatorEmail,
			reason: "",
			diagnosis: "",
			physicalExam: "",
			temperature: "",
			systolicPressure: "",
			diastolicPressure: "",
			oxygenSaturation: "",
			respiratoryRate: "",
			heartRate: "",
			glucometry: "",
			notes: "",
		});
		setMedications([]);
	};

	/**
	 * Cancels the current appointment editing or creation process and resets relevant states.
	 */

	const handleCancel = () => {
		setselectedAppointment(null);
		setAddingNew(false);
		setIsEditable(false);
	};

	/**
	 * Gets the current date and time, formatted for display and structured to interface with backend APIs.
	 * If a specific date string is provided, it formats that date; otherwise, it uses the current date and time.
	 *
	 * @param {string|null} dateString - Optional specific date string to format.
	 * @returns {Object} An object containing the date in ISO format and a human-readable formatted date string.
	 */

	function getFormattedDateTime(dateString = null) {
		const date = dateString ? new Date(dateString) : new Date();

		if (Number.isNaN(date.getTime())) {
			return { date: null, formattedDate: "No disponible" };
		}

		return {
			date: date.toISOString(),
			formattedDate: date.toLocaleString("es-ES", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false,
			}),
		};
	}

	const appointData = appointmentResult.result?.consultations || [];

	const [appointmentHistory, setAppointmentHistory] = useState({
		data: appointData,
		version:
			appointmentResult?.consultations?.[0]?.patientConsultation?.version || 1,
	});

	/**
	 * Selects an appointment from the list to view or edit, setting it as the current appointment and adjusting the state accordingly.
	 *
	 * @param {Object} appointment - The appointment object selected by the user.
	 * @param {number} index - The index of the appointment in the list, used for tracking and operations.
	 */
	const handleSelectAppointment = (appointment, index) => {
		const { formattedDate } = getFormattedDateTime(
			appointment.patientConsultation.data.date,
		);

		setselectedAppointment({
			...appointment,
			index: index,
			formattedDate: formattedDate,
		});

		setCurrentAppointment({
			date: appointment.patientConsultation.data.date,
			formattedDate: formattedDate,
			evaluator: appointment.patientConsultation.data.evaluator,
			reason: appointment.patientConsultation.data.reason || "",
			diagnosis: appointment.patientConsultation.data.diagnosis || "",
			physicalExam: appointment.patientConsultation.data.physicalExam || "",
			temperature: appointment.patientConsultation.data.temperature || "",
			systolicPressure:
				appointment.patientConsultation.data.systolicPressure || "",
			diastolicPressure:
				appointment.patientConsultation.data.diastolicPressure || "",
			oxygenSaturation:
				appointment.patientConsultation.data.oxygenSaturation || "",
			respiratoryRate:
				appointment.patientConsultation.data.respiratoryRate || "",
			heartRate: appointment.patientConsultation.data.heartRate || "",
			glucometry: appointment.patientConsultation.data.glucometry || "",
			medications: appointment.patientConsultation.data.medications || [],
			notes: appointment.patientConsultation.data.notes || "",
		});

		setMedications(appointment.patientConsultation.data.medications || []);
		setAddingNew(false);
		setIsEditable(false);
	};

	const noAppointmentData =
		!Array.isArray(appointmentHistory.data) ||
		appointmentHistory.data.length === 0 ||
		appointmentHistory.data.every(
			(appointment) => !appointment.patientConsultation?.data?.date,
		);

	/**
	 * Adds a new medication record to the current appointment, setting up default editable fields.
	 */
	const addMedication = () => {
		setMedications([
			...medications,
			{
				id: medications.length + 1,
				diagnosis: "",
				medication: "",
				quantity: "",
			},
		]);
	};

	/**
	 * Removes a medication record from the current appointment based on its index.
	 *
	 * @param {number} index - The index of the medication record to remove.
	 */
	const removeMedication = (index) => {
		const newMedications = medications.filter((_, i) => i !== index);
		setMedications(newMedications);
	};

	/**
	 * Attempts to save the current appointment to the database, validating necessary fields and handling the API response.
	 * Provides user feedback through toast notifications based on the outcome of the save operation.
	 */
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity:  Function to save the appointments
	const handleSaveNewAppointment = async () => {
		let hasErrors = false;

		// Validación de los campos necesarios
		if (
			!currentAppointment.diagnosis ||
			currentAppointment.diagnosis.trim() === ""
		) {
			toast.error("El diagnóstico es obligatorio.");
			hasErrors = true;
		}

		if (
			!currentAppointment.physicalExam ||
			currentAppointment.physicalExam.trim() === ""
		) {
			toast.error("El examen físico es obligatorio.");
			hasErrors = true;
		}

		if (!currentAppointment.reason || currentAppointment.reason.trim() === "") {
			toast.error("El motivo de la consulta es obligatorio.");
			hasErrors = true;
		}

		if (hasErrors) return;

		toast.info("Guardando información de la cita...");

		let formattedDate;

		if (typeof currentAppointment.date === "string") {
			const parsedDate = new Date(Date.parse(currentAppointment.date));

			if (!Number.isNaN(parsedDate.getTime())) {
				formattedDate = parsedDate.toISOString();
			} else {
				toast.error("La fecha de la cita es inválida.");
				return;
			}
		} else if (currentAppointment.date instanceof Date) {
			formattedDate = currentAppointment.date.toISOString();
		} else {
			toast.error("La fecha de la cita es inválida.");
			return;
		}

		const appointmentDetails = {
			version: appointmentHistory.version,
			data: {
				date: formattedDate,
				evaluator: currentAppointment.evaluator,
				reason: currentAppointment.reason,
				diagnosis: currentAppointment.diagnosis,
				physicalExam: currentAppointment.physicalExam,
				temperature: Number.parseFloat(currentAppointment.temperature),
				systolicPressure: Number.parseFloat(
					currentAppointment.systolicPressure,
				),
				diastolicPressure: Number.parseFloat(
					currentAppointment.diastolicPressure,
				),
				oxygenSaturation: Number.parseFloat(
					currentAppointment.oxygenSaturation,
				),
				respiratoryRate: Number.parseFloat(currentAppointment.respiratoryRate),
				heartRate: Number.parseFloat(currentAppointment.heartRate),
				glucometry: Number.parseFloat(currentAppointment.glucometry),
				medications: medications.map((med) => ({
					diagnosis: med.diagnosis,
					medication: med.medication,
					quantity: med.quantity,
				})),
				notes: currentAppointment.notes,
			},
		};

		try {
			const response = await updateAppointment(id, {
				patientConsultation: appointmentDetails,
			});

			if (!response.error) {
				toast.success("¡Cita guardada con éxito!");

				const updatedAppointments = [
					...appointmentHistory.data,
					{ patientConsultation: appointmentDetails },
				].sort((a, b) => {
					if (
						!(
							a.patientConsultation?.data?.date &&
							b.patientConsultation &&
							b.patientConsultation.data &&
							b.patientConsultation.data.date
						)
					) {
						return 0;
					}
					const dateA = new Date(a.patientConsultation.data.date);
					const dateB = new Date(b.patientConsultation.data.date);
					return dateB - dateA;
				});

				setAppointmentHistory({
					...appointmentHistory,
					data: updatedAppointments,
				});

				setselectedAppointment(null);
				setAddingNew(false);
				setIsEditable(false);
			} else {
				toast.error(`Error al guardar: ${response.error}`);
			}
		} catch (error) {
			console.error("Error en la operación:", error);
			toast.error(`Error en la operación: ${error.message}`);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				width: "100%",
				height: "100%",
				gap: "2rem",
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
						text="Agregar cita"
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

				{noAppointmentData && !errorMessage ? (
					<p style={{ textAlign: "center", paddingTop: "20px" }}>
						¡Parece que no hay citas registradas! Agrega una en el botón de
						arriba.
					</p>
				) : (
					appointmentHistory.data
						.filter(
							(appointment) =>
								appointment.patientConsultation.data.reason?.trim() &&
								appointment.patientConsultation.data.diagnosis?.trim() &&
								appointment.patientConsultation.data.physicalExam?.trim(),
						)
						.map((appointment) => {
							return (
								<InformationCard
									key={`appointment-${appointment.patientConsultation.id}`}
									type="appointment"
									date={
										getFormattedDateTime(
											appointment.patientConsultation.data.date,
										).formattedDate
									}
									reasonAppointment={
										appointment.patientConsultation.data.reason
									}
									onClick={() => handleSelectAppointment(appointment)}
								/>
							);
						})
				)}
			</div>

			{addingNew || selectedAppointment ? (
				<div
					style={{
						border: `1px solid ${colors.primaryBackground}`,
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
							padding: "1rem 0 0 0",
						}}
					>
						<span
							style={{
								fontWeight: "bold",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Fecha de cita:{" "}
						</span>
						<span
							style={{
								fontWeight: "normal",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							{currentAppointment?.formattedDate || "No disponible"}
						</span>
					</div>

					<div
						style={{
							padding: "1rem 0 0 0",
						}}
					>
						<span
							style={{
								fontWeight: "bold",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Evaluador:{" "}
						</span>
						<span
							style={{
								fontWeight: "normal",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							{currentAppointment?.evaluator || displayName}
						</span>
					</div>

					<div
						style={{
							paddingTop: "1rem",
							borderBottom: `0.04rem solid ${colors.darkerGrey}`,
						}}
					/>

					<div
						style={{
							padding: "1rem 0rem 0rem 0rem",
						}}
					>
						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
								paddingBottom: "0.5rem",
							}}
						>
							Motivo de consulta:
						</p>
						<ExpandingBaseInput
							id={`appointment-reason-${currentAppointment?.index}`}
							value={currentAppointment?.reason || ""}
							onChange={(e) =>
								setCurrentAppointment({
									...currentAppointment,
									reason: e.target.value,
								})
							}
							disabled={!isEditable}
							style={{
								width: "95%",
								height: "3rem",
								fontSize: "1rem",
								fontFamily: fonts.textFont,
							}}
							placeholder="Escribe aquí el motivo de consulta del paciente..."
						/>

						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
								paddingBottom: "0.5rem",
								paddingTop: "1rem",
							}}
						>
							Diagnóstico:
						</p>
						<ExpandingBaseInput
							id={`appointment-diagnosis-${currentAppointment?.index}`}
							value={currentAppointment?.diagnosis || ""}
							onChange={(e) =>
								setCurrentAppointment({
									...currentAppointment,
									diagnosis: e.target.value,
								})
							}
							disabled={!isEditable}
							style={{
								width: "95%",
								height: "3rem",
								fontSize: "1rem",
								fontFamily: fonts.textFont,
							}}
							placeholder="Escribe aquí el diagnósitco del paciente..."
						/>

						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
								paddingBottom: "0.5rem",
								paddingTop: "1rem",
							}}
						>
							Examen físico:
						</p>

						<ExpandingBaseInput
							id={`appointment-physicalExam-${currentAppointment?.index}`}
							value={currentAppointment?.physicalExam || ""}
							onChange={(e) =>
								setCurrentAppointment({
									...currentAppointment,
									physicalExam: e.target.value,
								})
							}
							disabled={!isEditable}
							style={{
								width: "95%",
								height: "3rem",
								fontSize: "1rem",
								fontFamily: fonts.textFont,
							}}
							placeholder="Escribe aquí el examen físico realizado..."
						/>

						<div
							style={{
								paddingTop: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
							}}
						/>

						<div
							style={{
								padding: "1rem 0rem 0rem 0rem",
							}}
						>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 2fr", // 1 fracción para etiquetas, 2 fracciones para inputs
									gap: "10px", // Espacio entre filas y columnas
									fontFamily: fonts.textFont,
									fontSize: fontSize.textSize,
								}}
							>
								<p
									style={{
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
										paddingTop: "0.4rem",
									}}
								>
									Temperatura:
								</p>
								<BaseInput
									value={currentAppointment?.temperature || ""}
									onChange={(e) =>
										setCurrentAppointment({
											...currentAppointment,
											temperature: e.target.value,
										})
									}
									disabled={!isEditable}
									type="number"
									step="0.01"
									min="0.01"
									style={{
										width: "90%",
										height: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
									placeholder="°C"
								/>

								<p
									style={{
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
										paddingTop: "0.4rem",
									}}
								>
									Presión sistólica:
								</p>
								<BaseInput
									value={currentAppointment?.systolicPressure || ""}
									onChange={(e) =>
										setCurrentAppointment({
											...currentAppointment,
											systolicPressure: e.target.value,
										})
									}
									disabled={!isEditable}
									type="number"
									step="0.01"
									min="0.01"
									style={{
										width: "90%",
										height: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
									placeholder="N"
								/>

								<p
									style={{
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
										paddingTop: "0.4rem",
									}}
								>
									Presión diastólica:
								</p>
								<BaseInput
									value={currentAppointment?.diastolicPressure || ""}
									onChange={(e) =>
										setCurrentAppointment({
											...currentAppointment,
											diastolicPressure: e.target.value,
										})
									}
									disabled={!isEditable}
									type="number"
									step="0.01"
									min="0.01"
									style={{
										width: "90%",
										height: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
									placeholder="N"
								/>

								<p
									style={{
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
										paddingTop: "0.4rem",
									}}
								>
									Saturación:
								</p>
								<BaseInput
									value={currentAppointment?.oxygenSaturation || ""}
									onChange={(e) =>
										setCurrentAppointment({
											...currentAppointment,
											oxygenSaturation: e.target.value,
										})
									}
									disabled={!isEditable}
									type="number"
									step="0.01"
									min="0.01"
									style={{
										width: "90%",
										height: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
									placeholder="%"
								/>

								<p
									style={{
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
										paddingTop: "0.4rem",
									}}
								>
									Frecuencia Respiratoria:
								</p>
								<BaseInput
									value={currentAppointment?.respiratoryRate || ""}
									onChange={(e) =>
										setCurrentAppointment({
											...currentAppointment,
											respiratoryRate: e.target.value,
										})
									}
									disabled={!isEditable}
									type="number"
									step="0.01"
									min="0.01"
									style={{
										width: "90%",
										height: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
									placeholder="rpm"
								/>

								<p
									style={{
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
										paddingTop: "0.4rem",
									}}
								>
									Frecuencia Cardiaca:
								</p>
								<BaseInput
									value={currentAppointment?.heartRate || ""}
									onChange={(e) =>
										setCurrentAppointment({
											...currentAppointment,
											heartRate: e.target.value,
										})
									}
									disabled={!isEditable}
									type="number"
									step="0.01"
									min="0.01"
									style={{
										width: "90%",
										height: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
									placeholder="lpm"
								/>

								<p
									style={{
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
										paddingTop: "0.4rem",
									}}
								>
									Glucometría:
								</p>
								<BaseInput
									value={currentAppointment?.glucometry || ""}
									onChange={(e) =>
										setCurrentAppointment({
											...currentAppointment,
											glucometry: e.target.value,
										})
									}
									disabled={!isEditable}
									type="number"
									step="0.01"
									min="0.01"
									style={{
										width: "90%",
										height: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
									placeholder="mg/dL"
								/>
							</div>
						</div>

						<div
							style={{
								paddingTop: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
							}}
						/>

						<div>
							{medications.length > 0
								? medications.map((medication, index) => (
										<div key={medication.index}>
											<div
												style={{
													padding: "1rem 0 1rem 0",
												}}
											>
												<p
													style={{
														padding: "0 0 0.5rem 0",
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
														fontWeight: "bold",
													}}
												>
													Medicamento Administrado {index + 1}
												</p>

												<p
													style={{
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
														padding: "0 0 0.5rem 0",
													}}
												>
													Diagnóstico:
												</p>
												<ExpandingBaseInput
													value={medication.diagnosis || ""}
													onChange={(e) => {
														const newMedications = [...medications];
														newMedications[index].diagnosis = e.target.value;
														setMedications(newMedications);
														setCurrentAppointment({
															...currentAppointment,
															medications: newMedications,
														});
													}}
													disabled={!isEditable}
													style={{
														width: "95%",
														height: "3rem",
														fontSize: "1rem",
														fontFamily: fonts.textFont,
													}}
													placeholder="Ingrese el diagnóstico por el cuál receta el medicamento..."
												/>

												<p
													style={{
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
														padding: "1rem 0 0.5rem 0",
													}}
												>
													Medicamento:
												</p>
												<ExpandingBaseInput
													value={medication.medication || ""}
													onChange={(e) => {
														const newMedications = [...medications];
														newMedications[index].medication = e.target.value;
														setMedications(newMedications);
														setCurrentAppointment({
															...currentAppointment,
															medications: newMedications,
														});
													}}
													disabled={!isEditable}
													style={{
														width: "95%",
														height: "3rem",
														fontSize: "1rem",
														fontFamily: fonts.textFont,
													}}
													placeholder="Ingrese el medicamento administrado..."
												/>

												<p
													style={{
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
														padding: "1rem 0 0.5rem 0",
													}}
												>
													Cantidad:
												</p>
												<ExpandingBaseInput
													value={medication.quantity || ""}
													onChange={(e) => {
														const newMedications = [...medications];
														newMedications[index].quantity = e.target.value;
														setMedications(newMedications);
														setCurrentAppointment({
															...currentAppointment,
															medications: newMedications,
														});
													}}
													disabled={!isEditable}
													style={{
														width: "95%",
														height: "3rem",
														fontSize: "1rem",
														fontFamily: fonts.textFont,
													}}
													placeholder="Ingrese la cantidad administrada..."
												/>
											</div>

											{isEditable && (
												<div>
													<div
														style={{
															display: "flex",
															justifyContent: "center",
															alignItems: "center",
															width: "100%",
															paddingTop: "1rem",
														}}
													>
														<BaseButton
															text="Cancelar nuevo medicamento"
															onClick={() => removeMedication(index)}
															style={{
																width: "40%",
																height: "3rem",
																backgroundColor: "#fff",
																color: colors.primaryBackground,
																border: `1.5px solid ${colors.primaryBackground}`,
															}}
														/>
													</div>

													<div
														style={{
															paddingTop: "1rem",
															borderBottom: `0.04rem solid ${colors.darkerGrey}`,
														}}
													/>
												</div>
											)}
										</div>
									))
								: !addingNew && (
										<div
											style={{
												textAlign: "center",
												paddingTop: "1rem",
												fontFamily: fonts.textFont,
												fontSize: fontSize.textSize,
												fontWeight: "bold",
											}}
										>
											No hay medicamentos registrados en esta cita.
										</div>
									)}
						</div>

						{isEditable && (
							<div
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									width: "100%",
									paddingTop: "1rem",
								}}
							>
								<BaseButton
									text="Agregar medicamento administrado"
									onClick={addMedication}
									style={{
										width: "50%",
										height: "3rem",
										border: `1.5px solid ${colors.primaryBackground}`,
									}}
								/>
							</div>
						)}

						<div
							style={{
								paddingTop: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
							}}
						/>

						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
								paddingBottom: "0.5rem",
								paddingTop: "1rem",
							}}
						>
							Notas:
						</p>
						<ExpandingBaseInput
							value={currentAppointment?.notes || ""}
							onChange={(e) =>
								setCurrentAppointment({
									...currentAppointment,
									notes: e.target.value,
								})
							}
							disabled={!isEditable}
							style={{
								width: "95%",
								height: "10rem",
								fontSize: "1rem",
								fontFamily: fonts.textFont,
							}}
							placeholder="Escribe aquí notas extras de la cita..."
						/>
					</div>

					<div
						style={{
							paddingTop: "1rem",
							borderBottom: `0.04rem solid ${colors.darkerGrey}`,
						}}
					/>

					{isEditable && (
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								paddingTop: "2rem",
								gap: "1rem",
							}}
						>
							<BaseButton
								text="Guardar"
								onClick={handleSaveNewAppointment}
								style={{ width: "30%", height: "3rem" }}
							/>
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
						</div>
					)}
				</div>
			) : null}
		</div>
	);
}
