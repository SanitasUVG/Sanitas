import { Suspense, useState } from "react";
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

export function StudentAppointments({
	getAppointment,
	updateAppointment,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
	const appointmentResource = WrapPromise(getAppointment(id));
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

	// Handlers for different actions within the component
	const handleOpenNewForm = () => {
		// Desestructura el objeto retornado por getFormattedDateTime()
		const { date, formattedDate } = getFormattedDateTime();

		setAddingNew(true);
		setIsEditable(true);

		const evaluatorEmail = IS_PRODUCTION ? displayName : "doctor1@example.com";

		// Limpia el estado de los medicamentos y la cita actual
		setCurrentAppointment({
			date: date,
			formattedDate: formattedDate,
			evaluator: evaluatorEmail,
			reason: "", // Limpiar campos para nueva cita
			diagnosis: "", // Limpiar campos para nueva cita
			physicalExam: "", // Limpiar campos para nueva cita
			temperature: "", // Limpiar campos para nueva cita
			systolicPressure: "", // Limpiar campos para nueva cita
			diastolicPressure: "", // Limpiar campos para nueva cita
			oxygenSaturation: "", // Limpiar campos para nueva cita
			respiratoryRate: "", // Limpiar campos para nueva cita
			heartRate: "", // Limpiar campos para nueva cita
			glucometry: "", // Limpiar campos para nueva cita
			notes: "", // Limpiar campos para nueva cita
		});

		// Limpia el estado de los medicamentos para la nueva cita
		setMedications([]);
	};

	const handleCancel = () => {
		setselectedAppointment(null);
		setAddingNew(false);
		setIsEditable(false);
	};

	function getFormattedDateTime(dateString = null) {
		const date = dateString ? new Date(dateString) : new Date(); // Si no hay dateString, usa la fecha actual

		// Validar si la fecha es válida
		if (isNaN(date.getTime())) {
			return { date: null, formattedDate: "No disponible" }; // Si no es una fecha válida
		}

		return {
			date: date.toISOString(), // Retorna la fecha en formato ISO para guardarla
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

	let appointData = appointmentResult.result?.consultations || [];

	const [appointmentHistory, setAppointmentHistory] = useState({
		data: appointData,
		version:
			appointmentResult?.consultations?.[0]?.patientConsultation?.version || 1,
	});

	const handleSelectAppointment = (appointment, index) => {
		const { formattedDate } = getFormattedDateTime(
			appointment.patientConsultation.data.date,
		);

		setselectedAppointment({
			...appointment,
			index: index,
			formattedDate: formattedDate, // Guarda la fecha formateada en el estado
		});

		setCurrentAppointment({
			date: appointment.patientConsultation.data.date,
			formattedDate: formattedDate, // Formato de la fecha existente
			evaluator: appointment.patientConsultation.data.evaluator, // Evaluador existente
			reason: appointment.patientConsultation.data.reason || "", // Motivo de consulta
			diagnosis: appointment.patientConsultation.data.diagnosis || "", // Diagnóstico
			physicalExam: appointment.patientConsultation.data.physicalExam || "", // Examen físico
			temperature: appointment.patientConsultation.data.temperature || "", // Temperatura
			systolicPressure:
				appointment.patientConsultation.data.systolicPressure || "", // Presión sistólica
			diastolicPressure:
				appointment.patientConsultation.data.diastolicPressure || "", // Presión diastólica
			oxygenSaturation:
				appointment.patientConsultation.data.oxygenSaturation || "", // Saturación de oxígeno
			respiratoryRate:
				appointment.patientConsultation.data.respiratoryRate || "", // Frecuencia respiratoria
			heartRate: appointment.patientConsultation.data.heartRate || "", // Frecuencia cardiaca
			glucometry: appointment.patientConsultation.data.glucometry || "", // Glucometría
			medications: appointment.patientConsultation.data.medications || [], // Medicamentos
			notes: appointment.patientConsultation.data.notes || "", // Notas adicionales
		});

		setMedications(appointment.patientConsultation.data.medications || []);
		setAddingNew(false);
		setIsEditable(false);
	};

	const noAppointmentData =
		!Array.isArray(appointmentHistory.data) || // Verifica que sea un array
		appointmentHistory.data.length === 0 ||
		appointmentHistory.data.every(
			(appointment) => !appointment.patientConsultation?.data?.date,
		);

	// Identificador de medicamentos
	const [medications, setMedications] = useState([]);

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
	// Botón de cancelar medicamento
	const removeMedication = (index) => {
		const newMedications = medications.filter((_, i) => i !== index);
		setMedications(newMedications);
	};

	// Handles the saving of new or modified family medical history
	const handleSaveNewAppointment = async () => {
		if (!currentAppointment.diagnosis) {
			toast.error("El diagnóstico es obligatorio.");
		}

		if (!currentAppointment.physicalExam) {
			toast.error("El examen físico es obligatorio.");
		}

		if (!currentAppointment.reason) {
			toast.error("El motivo de la consulta es obligatorio.");
		}

		toast.info("Guardando información de la cita...");

		let formattedDate;

		// Verifica si la fecha es una cadena de texto formateada
		if (typeof currentAppointment.date === "string") {
			// Intenta crear una nueva fecha a partir del string
			const parsedDate = new Date(Date.parse(currentAppointment.date));

			// Verifica si el parsing es válido
			if (!isNaN(parsedDate.getTime())) {
				formattedDate = parsedDate.toISOString();
			} else {
				toast.error("La fecha de la cita es inválida.");
				return;
			}
		} else if (currentAppointment.date instanceof Date) {
			// Si ya es un objeto Date, simplemente formateamos
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
				temperature: parseFloat(currentAppointment.temperature),
				systolicPressure: parseFloat(currentAppointment.systolicPressure),
				diastolicPressure: parseFloat(currentAppointment.diastolicPressure),
				oxygenSaturation: parseFloat(currentAppointment.oxygenSaturation),
				respiratoryRate: parseFloat(currentAppointment.respiratoryRate),
				heartRate: parseFloat(currentAppointment.heartRate),
				glucometry: parseFloat(currentAppointment.glucometry),
				medications: medications.map((med) => ({
					diagnosis: med.diagnosis,
					medication: med.medication,
					quantity: med.quantity,
				})),
				notes: currentAppointment.notes,
			},
		};

		// Enviar los datos al servidor o API
		try {
			const response = await updateAppointment(id, {
				patientConsultation: appointmentDetails,
			});

			if (!response.error) {
				toast.success("¡Cita guardada con éxito!");

				// Agregar la nueva cita a las citas existentes
				const updatedAppointments = [
					...appointmentHistory.data, // Mantén las citas existentes
					{ patientConsultation: appointmentDetails }, // Agrega la nueva cita
				];

				// Actualiza el estado con todas las citas
				setAppointmentHistory({
					...appointmentHistory,
					data: updatedAppointments, // Actualiza solo las citas, manteniendo otros campos
				});

				setselectedAppointment(null);
				setAddingNew(false);
				setIsEditable(false);
			} else {
				toast.error(`Error al guardar: ${response.error}`);
			}
		} catch (error) {
			console.error("Error en la operación:", error);
			toast.error(`Error en la operación: ${error.message}`); // Manejo de errores
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
					appointmentHistory.data.map((appointment, index) => {
						return (
							<InformationCard
								key={`appointment-${index}`}
								type="appointment"
								date={
									getFormattedDateTime(
										appointment.patientConsultation.data.date,
									).formattedDate
								}
								reasonAppointment={
									appointment.patientConsultation.data.reason || "Sin Motivo"
								}
								onClick={() => handleSelectAppointment(appointment, index)}
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

						{medications.map((medication, index) => (
							<div key={index}>
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
						))}

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
