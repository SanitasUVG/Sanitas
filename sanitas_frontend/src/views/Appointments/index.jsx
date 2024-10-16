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
import IconButton from "src/components/Button/Icon";
import { DateInput } from "src/components/Input/index";
import ExpandingBaseInput from "src/components/Input/ExpandingBaseInput";
import { use } from "chai";
import { useSourceProps } from "@storybook/blocks";

export function StudentAppointments({
	getAppointment,
	updateAppointment,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
	const appointmentResource = WrapPromise(getAppointment(id));

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
								useStore={useStore}
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
	useStore,
}) {
	const [selectedAppointment, setselectedAppointment] = useState({});
	const [addingNew, setAddingNew] = useState(false);
	const [isEditable, setIsEditable] = useState(false);
	const displayName = useStore((s) => s.displayName);

	// Read the data from the resource and handle any potential errors
	// const appointmentResult = appointmentResource.read();
	// let errorMessage = "";
	// if (appointmentResult.error) {
	// 	const error = appointmentResult.error;
	// 	if (error?.response) {
	// 		const { status } = error.response;
	// 		if (status < 500) {
	// 			errorMessage =
	// 				"Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!";
	// 		} else {
	// 			errorMessage = "Ha ocurrido un error interno, lo sentimos.";
	// 		}
	// 	} else {
	// 		errorMessage =
	// 			"Ha ocurrido un error procesando tu solicitud, por favor vuelve a intentarlo.";
	// 	}
	// }

	// // No appointment data in API
	// const noAppointmentData = Object.keys(familiarHistory).every(
	// 	(key) =>
	// 		familiarHistory[key]?.data && familiarHistory[key].data.length === 0,
	// );

	// Handlers for different actions within the component
	const handleOpenNewForm = () => {
		setAddingNew(true);
		setIsEditable(true);
	};

	const handleCancel = () => {
		setselectedAppointment({});
		setAddingNew(false);
		setIsEditable(false);
	};

	const today = new Date();
	const formattedDate = today.toLocaleDateString("es", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	const updateAppointmentState = async (newEntry) => {};

	// Handles the saving of new or modified family medical history
	const handleSaveNewAppointment = async () => {
		const newEntry = prepareNewEntry();
		await updateAppointmentState(newEntry);
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

				{/* {errorMessage && (
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
				*/}

				{/* {noAppointmentData && !errorMessage ? (
                    <p style={{ textAlign: "center", paddingTop: "20px" }}>
                        ¡Parece que no hay citas registradas! Agrega una en el botón de
                        arriba.
                    </p>
                ) : (
                    Object.keys(AllergicHistory || {}).map((category) => {
                        return AllergicHistory[category]?.data?.map((allergy) => {
                            return (
                                <InformationCard
                                    key={`${category}-${allergy.name || allergy.id}`}
                                    type="appointment"
                                    date={allergy.name || "Sin Nombre"}
                                    reasonAppointment={allergy.severity || "Sin Severidad"}
                                    onClick={() =>
                                        handleSelectAllergie({ ...allergy, selectedMed: category })
                                    }
                                />
                            );
                        });
                    })
                )} */}
			</div>

			{addingNew || selectedAppointment.disease ? (
				<div
					style={{
						border: `0.063rem solid ${colors.primaryBackground}`,
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
							{formattedDate}
						</span>
					</div>

					<div
						style={{
							padding: "0.3rem 0 0 0",
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
							{displayName}
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
							style={{
								fontSize: "1rem",
								fontFamily: fonts.textFont,
								width: "95%",
								height: "3rem",
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
							style={{
								width: "100%",

								fontSize: "1rem",
								fontFamily: fonts.textFont,
								overflowY: "auto",
							}}
							placeholder="Escribe aquí el examen físico realizado..."
						/>
					</div>

					<div
						style={{
							paddingTop: "1rem",
							borderBottom: `0.04rem solid ${colors.darkerGrey}`,
						}}
					/>

					<div
						style={{
							display: "flex",
							flexDirection: "row",
							padding: "0.5rem 0 0.5rem 0",
						}}
					>
						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Temperatura:
						</p>
						<BaseInput style={{ width: "95%", height: "2rem" }} />
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							padding: "0.5rem 0 0.5rem 0",
						}}
					>
						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Presión Sistólica:
						</p>
						<BaseInput style={{ width: "100%" }} />
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "row",
							padding: "0.5rem 0 0.5rem 0",
						}}
					>
						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Presión Diastólica:
						</p>
						<BaseInput style={{ width: "100%" }} />
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "row",
							padding: "0.5rem 0 0.5rem 0",
						}}
					>
						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Saturación:
						</p>
						<BaseInput style={{ width: "100%" }} />
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							padding: "0.5rem 0 0.5rem 0",
						}}
					>
						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Frecuencia Respiratoria:
						</p>
						<BaseInput style={{ width: "100%" }} />
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							padding: "0.5rem 0 0.5rem 0",
						}}
					>
						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Frecuencia Cardiaca:
						</p>
						<BaseInput style={{ width: "100%" }} />
					</div>
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							padding: "0.5rem 0 0.5rem 0",
						}}
					>
						<p
							style={{
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Glucometría:
						</p>
						<BaseInput style={{ width: "100%" }} />
					</div>

					<div
						style={{
							padding: "1.5rem 0 1rem 0",
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
						style={{
							width: "95%",
							height: "3rem",
							fontSize: "1rem",
							fontFamily: fonts.textFont,
						}}
						placeholder="Escribe aquí notas extras de la cita..."
					/>

					<div
						style={{
							paddingTop: "1.5rem",
							borderBottom: `0.04rem solid ${colors.darkerGrey}`,
						}}
					/>

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
							//onClick={handleSaveNewFamiliar}
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
				</div>
			) : null}
		</div>
	);
}
