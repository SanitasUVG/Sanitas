import { React, Suspense, useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput } from "src/components/Input/index";
import { RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

export function ObGynHistory({
	getBirthdayPatientInfo,
	getObGynHistory,
	updateObGynHistory,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
	const birthdayResource = WrapPromise(getBirthdayPatientInfo(id));
	const obgynHistoryResource = WrapPromise(getObGynHistory(id));

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes ginecoobstétricos..." />
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
							Antecedentes Ginecoobstétricos
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
							Registro de antecedentes ginecoobstétricos
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
							<ObGynView
								id={id}
								birthdayResource={birthdayResource}
								obgynHistoryResource={obgynHistoryResource}
								updateObGynHistory={updateObGynHistory}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

function DiagnosisSection({ title, diagnosisKey, editable, isNew, onCancel }) {
	const [diagnosed, setDiagnosed] = useState(false);
	const [diagnosisName, setDiagnosisName] = useState("");
	const [medication, setMedication] = useState("");
	const [dose, setDose] = useState("");
	const [frequency, setFrequency] = useState("");

	const showFields = isNew || diagnosed;

	return (
		<div>
			<p
				style={{
					paddingBottom: "0.5rem",
					paddingTop: "2rem",
					fontFamily: fonts.textFont,
					fontSize: fontSize.textSize,
					fontWeight: diagnosed || isNew ? "bold" : "normal",
				}}
			>
				{title}
			</p>
			{!isNew && (
				<div
					style={{
						display: "flex",
						gap: "1rem",
						alignItems: "center",
						paddingLeft: "0.5rem",
						paddingTop: "0.5rem",
					}}
				>
					<RadioInput
						name={diagnosisKey}
						checked={diagnosed}
						onChange={() => setDiagnosed(true)}
						label="Sí"
						disabled={!editable}
					/>
					<RadioInput
						name={diagnosisKey}
						checked={!diagnosed}
						onChange={() => setDiagnosed(false)}
						label="No"
						disabled={!editable}
					/>
				</div>
			)}
			{showFields && (
				<>
					{isNew && (
						<div>
							<p
								style={{
									paddingBottom: "0.5rem",
									paddingTop: "1rem",
									fontFamily: fonts.textFont,
									fontSize: fontSize.textSize,
								}}
							>
								Nombre del diagnóstico:
							</p>

							<BaseInput
								value={diagnosisName}
								onChange={(e) => setDiagnosisName(e.target.value)}
								readOnly={!editable}
								placeholder="Ingrese el nombre del diagnóstico."
								style={{
									width: "60%",
									height: "3rem",
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
						value={medication}
						onChange={(e) => setMedication(e.target.value)}
						readOnly={!editable}
						placeholder="Ingrese el medicamento administrado."
						style={{
							width: "60%",
							height: "3rem",
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
						value={dose}
						onChange={(e) => setDose(e.target.value)}
						readOnly={!editable}
						placeholder="Ingrese cuánto. Ej. 50mg (Este campo es opcional)"
						style={{
							width: "60%",
							height: "3rem",
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
						value={frequency}
						onChange={(e) => setFrequency(e.target.value)}
						readOnly={!editable}
						placeholder="Ingrese cada cuándo administra el medicamento (Ej. Cada dos días, cada 12 horas...)"
						style={{
							width: "60%",
							height: "3rem",
							fontFamily: fonts.textFont,
							fontSize: "1rem",
						}}
					/>

					{isNew && (
						<div>
							<div
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									paddingTop: "2rem",
								}}
							>
								<BaseButton
									text="Cancelar nuevo diagnóstico"
									onClick={onCancel}
									style={{
										width: "25%",
										height: "3rem",
										backgroundColor: "#fff",
										color: colors.primaryBackground,
										border: `1.5px solid ${colors.primaryBackground}`,
									}}
								/>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

function ObGynView({
	id,
	birthdayResource,
	obgynHistoryResource,
	updateObGynHistory,
}) {
	const [age, setAge] = useState("");
	const [isRegular, setIsRegular] = useState(false);
	const [isPainful, setIsPainful] = useState(false);
	const [medication, setMedication] = useState("");
	const [isEditable, setIsEditable] = useState(true);

	// GENERAL INFO SECTION

	// RENDER BASE INPUT IF MENSTRUATION IS PAINFUL
	const renderMedicationInput = () => {
		if (isPainful) {
			return (
				<div>
					<p
						style={{
							paddingBottom: "0.5rem",
							paddingTop: "2rem",
							fontFamily: fonts.textFont,
							fontSize: fontSize.textSize,
						}}
					>
						¿Qué medicamento toma?
					</p>
					<BaseInput
						value={medication}
						onChange={(e) => setMedication(e.target.value)}
						readOnly={!isEditable}
						placeholder="Ingrese el medicamento tomado para regular los dolores de menstruación."
						style={{
							width: "60%",
							height: "3rem",
							fontFamily: fonts.textFont,
							fontSize: "1rem",
						}}
					/>
				</div>
			);
		}
		return null;
	};

	// DIAGNOSIS SECTION

	const [diagnoses, setDiagnoses] = useState([
		{ key: "cysts", title: "Diagnóstico por Quistes Ováricos:" },
		{ key: "uterinemya", title: "Diagnóstico por Miamatosos Uterina:" },
		{ key: "endometriosis", title: "Diagnóstico por Endometriosis:" },
	]);

	// Función para añadir una nueva sección de diagnóstico
	const addDiagnosis = () => {
		const newDiagnosis = {
			key: `diagnosis-${Date.now()}`,
			title: "Nuevo Diagnóstico:",
			isNew: true, // Este diagnóstico es nuevo y debería mostrar el campo adicional
		};
		setDiagnoses([...diagnoses, newDiagnosis]);
	};

	const removeDiagnosis = (key) => {
		setDiagnoses(diagnoses.filter((diagnosis) => diagnosis.key !== key));
	};

	const yearOptions = [
		{ label: "2024", value: "2024" },
		{ label: "2023", value: "2023" },
		{ label: "2022", value: "2022" },
		{ label: "2021", value: "2021" },
		{ label: "2020", value: "2020" },
		{ label: "2019", value: "2019" },
		{ label: "2018", value: "2018" },
		{ label: "2017", value: "2017" },
		{ label: "2016", value: "2016" },
		{ label: "2015", value: "2015" },
		{ label: "2014", value: "2014" },
		{ label: "2013", value: "2013" },
		{ label: "2012", value: "2012" },
		{ label: "2011", value: "2011" },
		{ label: "2010", value: "2010" },
		// Agrega más años según sea necesario
	];

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				width: "100%",
				height: "100%",
			}}
		>
			<div
				style={{
					padding: "1rem",
					height: "65vh",
					flex: 1.5,
					overflowY: "auto",
					width: "100%",
				}}
			>
				<p
					style={{
						paddingTop: "1rem",
						fontFamily: fonts.textFont,
						fontSize: fontSize.subtitleSize,
						fontWeight: "bold",
					}}
				>
					Información General:{" "}
				</p>

				<p
					style={{
						paddingBottom: "0.5rem",
						paddingTop: "1rem",
						fontFamily: fonts.textFont,
						fontSize: fontSize.textSize,
					}}
				>
					Ingrese la edad en la que tuvo la primera mestruación:
				</p>
				<BaseInput
					type="number"
					min="1"
					value={age}
					onChange={(e) => setAge(e.target.value)}
					readOnly={!isEditable}
					placeholder="Ingrese la edad (Ej. 15, 16...)"
					style={{
						width: "60%",
						height: "3rem",
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
					¿Sus ciclos son regulares? (Ciclos de 21-35 días)
				</p>
				<div
					style={{
						display: "flex",
						gap: "1rem",
						alignItems: "center",
						paddingLeft: "0.5rem",
					}}
				>
					<RadioInput
						name="regular"
						checked={isRegular === true}
						onChange={() => setIsRegular(true)}
						label="Sí"
						disabled={!isEditable}
					/>
					<RadioInput
						name="notregular"
						checked={isRegular === false}
						onChange={() => setIsRegular(false)}
						label="No"
						disabled={!isEditable}
					/>
				</div>
				<p
					style={{
						paddingBottom: "0.5rem",
						paddingTop: "2rem",
						fontFamily: fonts.textFont,
						fontSize: fontSize.textSize,
					}}
				>
					¿Normalmente tiene menstruación dolorosa?
				</p>
				<div
					style={{
						display: "flex",
						gap: "1rem",
						alignItems: "center",
						paddingLeft: "0.5rem",
					}}
				>
					<RadioInput
						name="pain"
						checked={isPainful === true}
						onChange={() => setIsPainful(true)}
						label="Sí"
						disabled={!isEditable}
					/>
					<RadioInput
						name="nopain"
						checked={isPainful === false}
						onChange={() => setIsPainful(false)}
						label="No"
						disabled={!isEditable}
					/>
				</div>

				{renderMedicationInput()}

				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						width: "100%",
					}}
				>
					<div
						style={{
							padding: "1rem",
							borderBottom: `0.04rem solid ${colors.darkerGrey}`,
							width: "95%",
							display: "flex",
							justifyContent: "center",
						}}
					/>
				</div>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
						gap: "2rem",
						width: "90%",
						paddingLeft: "3rem",
					}}
				>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							height: "100%",
						}}
					>
						<p
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "2rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							G:
						</p>
						<BaseInput
							// value={selectedSurgery ? selectedSurgery.surgeryType : ""}
							// onChange={}
							// readOnly={!addingNew}
							placeholder="Total de partos"
							style={{
								width: "100%",
								height: "2.5rem",
								fontFamily: fonts.textFont,
								fontSize: "1rem",
							}}
						/>
					</div>
					<p
						style={{
							fontWeight: "bold",
							fontSize: fonts.titleFont,
							paddingTop: "3.5rem",
							paddingRight: "1rem",
						}}
					>
						{" "}
						={" "}
					</p>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							height: "100%",
						}}
					>
						<p
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "2rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							P:
						</p>
						<BaseInput
							// value={selectedSurgery ? selectedSurgery.surgeryType : ""}
							// onChange={}
							// readOnly={!addingNew}
							placeholder="# vía vaginal"
							style={{
								width: "100%",
								height: "2.5rem",
								fontFamily: fonts.textFont,
								fontSize: "1rem",
							}}
						/>
					</div>
					<p
						style={{
							fontWeight: "bold",
							fontSize: fonts.titleFont,
							paddingTop: "3.5rem",
							paddingRight: "1rem",
						}}
					>
						{" "}
						+{" "}
					</p>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							height: "100%",
						}}
					>
						<p
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "2rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							C:
						</p>
						<BaseInput
							// value={selectedSurgery ? selectedSurgery.surgeryType : ""}
							// onChange={}
							// readOnly={!addingNew}
							placeholder="# cesáreas"
							style={{
								width: "100%",
								height: "2.5rem",
								fontFamily: fonts.textFont,
								fontSize: "1rem",
							}}
						/>
					</div>
					<p
						style={{
							fontWeight: "bold",
							fontSize: fonts.titleFont,
							paddingTop: "3.5rem",
							paddingRight: "1rem",
						}}
					>
						{" "}
						+{" "}
					</p>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "100%",
							height: "100%",
						}}
					>
						<p
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "2rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							A:
						</p>
						<BaseInput
							// value={selectedSurgery ? selectedSurgery.surgeryType : ""}
							// onChange={}
							// readOnly={!addingNew}
							placeholder="# abortos"
							style={{
								width: "100%",
								height: "2.5rem",
								fontFamily: fonts.textFont,
								fontSize: "1rem",
							}}
						/>
					</div>
				</div>

				<div
					style={{
						padding: "1rem",
						borderBottom: `0.04rem  solid ${colors.darkerGrey}`,
					}}
				/>

				<div
					style={{
						padding: "1rem",
						height: "65vh",
						flex: 1.5,
						width: "100%",
					}}
				>
					<p
						style={{
							paddingTop: "1rem",
							fontFamily: fonts.textFont,
							fontSize: fontSize.subtitleSize,
							fontWeight: "bold",
						}}
					>
						Diagnóstico de Enfermedades{" "}
					</p>

					{diagnoses.map((diagnosis, index) => (
						<div key={diagnosis.key}>
							<DiagnosisSection
								title={diagnosis.title}
								diagnosisKey={diagnosis.key}
								editable={true}
								isNew={diagnosis.isNew}
								onCancel={() => removeDiagnosis(diagnosis.key)}
							/>
							{index < diagnoses.length - 1 && (
								<div // BORDER
									style={{
										padding: "1rem",
										borderBottom: `0.04rem solid ${colors.darkerGrey}`,
									}}
								/>
							)}
						</div>
					))}
					<div // BORDER
						style={{
							padding: "1rem",
							borderBottom: `0.04rem solid ${colors.darkerGrey}`,
						}}
					/>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							paddingTop: "2rem",
						}}
					>
						<BaseButton
							text="Agregar otro diagnóstico"
							onClick={addDiagnosis}
							style={{ width: "25%", height: "3rem" }}
						/>
					</div>

					<div // BORDER
						style={{
							padding: "1rem",
							borderBottom: `0.04rem solid ${colors.darkerGrey}`,
						}}
					/>

					<div
						style={{
							padding: "1rem",
							height: "65vh",
							flex: 1.5,
							width: "100%",
						}}
					>
						<p
							style={{
								paddingTop: "1rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.subtitleSize,
								fontWeight: "bold",
							}}
						>
							Operaciones del Paciente:{" "}
						</p>

						<p // Operación por Histerectomía
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "2rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Operación por Histerectomía:
						</p>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								alignItems: "center",
								paddingLeft: "0.5rem",
							}}
						>
							<RadioInput
								name="hysterectomy "
								//checked={smokingStatus}
								//onChange={() => handleSmokingChange(true)}
								label="Sí"
								//disabled={!isEditable}
							/>
							<RadioInput
								name="nohysterectomy"
								//checked={!smokingStatus}
								//onChange={() => handleSmokingChange(false)}
								label="No"
								//disabled={!isEditable}
							/>
						</div>

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
							//value={selectedSurgery.surgeryYear}
							//readOnly={!addingNew}
							//onChange={(e) =>
							//setSelectedSurgery({
							//	...selectedSurgery,
							//	surgeryYear: e.target.value,
							//})
							//}
							style={{
								container: {
									width: "60%",
									height: "10%",
									paddingLeft: "0.5rem",
								},
								select: {},
								option: {},
								indicator: {
									top: "45%",
									right: "4%",
								},
							}}
						/>

						<p // Operación por Histerectomía
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "1rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							¿Tuvo alguma complicación?:
						</p>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								alignItems: "center",
								paddingLeft: "0.5rem",
							}}
						>
							<RadioInput
								name="complications "
								//checked={smokingStatus}
								//onChange={() => handleSmokingChange(true)}
								label="Sí"
								//disabled={!isEditable}
							/>
							<RadioInput
								name="nocomplications"
								//checked={!smokingStatus}
								//onChange={() => handleSmokingChange(false)}
								label="No"
								//disabled={!isEditable}
							/>
						</div>

						<div // BORDER
							style={{
								padding: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
							}}
						/>

						<p // Cirugia para no tener más hijos
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "2rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Cirugía para no tener más hijos:
						</p>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								alignItems: "center",
								paddingLeft: "0.5rem",
							}}
						>
							<RadioInput
								name="hysterectomy "
								//checked={smokingStatus}
								//onChange={() => handleSmokingChange(true)}
								label="Sí"
								//disabled={!isEditable}
							/>
							<RadioInput
								name="nohysterectomy"
								//checked={!smokingStatus}
								//onChange={() => handleSmokingChange(false)}
								label="No"
								//disabled={!isEditable}
							/>
						</div>

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
							//value={selectedSurgery.surgeryYear}
							//readOnly={!addingNew}
							//onChange={(e) =>
							//setSelectedSurgery({
							//	...selectedSurgery,
							//	surgeryYear: e.target.value,
							//})
							//}
							style={{
								container: {
									width: "60%",
									height: "10%",
									paddingLeft: "0.5rem",
								},
								select: {},
								option: {},
								indicator: {
									top: "45%",
									right: "4%",
								},
							}}
						/>

						<p // Operación por Histerectomía
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "1rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							¿Tuvo alguma complicación?:
						</p>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								alignItems: "center",
								paddingLeft: "0.5rem",
							}}
						>
							<RadioInput
								name="complications "
								//checked={smokingStatus}
								//onChange={() => handleSmokingChange(true)}
								label="Sí"
								//disabled={!isEditable}
							/>
							<RadioInput
								name="nocomplications"
								//checked={!smokingStatus}
								//onChange={() => handleSmokingChange(false)}
								label="No"
								//disabled={!isEditable}
							/>
						</div>

						<div // BORDER
							style={{
								padding: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
							}}
						/>

						<p // Operación por quistes ováricos
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "2rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Operación por Quistes Ováricos:
						</p>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								alignItems: "center",
								paddingLeft: "0.5rem",
							}}
						>
							<RadioInput
								name="hysterectomy "
								//checked={smokingStatus}
								//onChange={() => handleSmokingChange(true)}
								label="Sí"
								//disabled={!isEditable}
							/>
							<RadioInput
								name="nohysterectomy"
								//checked={!smokingStatus}
								//onChange={() => handleSmokingChange(false)}
								label="No"
								//disabled={!isEditable}
							/>
						</div>

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
							//value={selectedSurgery.surgeryYear}
							//readOnly={!addingNew}
							//onChange={(e) =>
							//setSelectedSurgery({
							//	...selectedSurgery,
							//	surgeryYear: e.target.value,
							//})
							//}
							style={{
								container: {
									width: "60%",
									height: "10%",
									paddingLeft: "0.5rem",
								},
								select: {},
								option: {},
								indicator: {
									top: "45%",
									right: "4%",
								},
							}}
						/>

						<p // Operación por Histerectomía
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "1rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							¿Tuvo alguma complicación?:
						</p>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								alignItems: "center",
								paddingLeft: "0.5rem",
							}}
						>
							<RadioInput
								name="complications "
								//checked={smokingStatus}
								//onChange={() => handleSmokingChange(true)}
								label="Sí"
								//disabled={!isEditable}
							/>
							<RadioInput
								name="nocomplications"
								//checked={!smokingStatus}
								//onChange={() => handleSmokingChange(false)}
								label="No"
								//disabled={!isEditable}
							/>
						</div>

						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								paddingTop: "2rem",
							}}
						>
							<BaseButton
								text="Agregar otra operación"
								// onClick={handleSaveNonPathological}
								style={{ width: "20%", height: "3rem" }}
							/>
						</div>

						<div // BORDER
							style={{
								padding: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
							}}
						/>
						<p // Operación por Resección de masas en mamas
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "2rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							Operación por Resección de masas en mamas:
						</p>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								alignItems: "center",
								paddingLeft: "0.5rem",
							}}
						>
							<RadioInput
								name="mamas "
								//checked={smokingStatus}
								//onChange={() => handleSmokingChange(true)}
								label="Sí"
								//disabled={!isEditable}
							/>
							<RadioInput
								name="nomamams"
								//checked={!smokingStatus}
								//onChange={() => handleSmokingChange(false)}
								label="No"
								//disabled={!isEditable}
							/>
						</div>

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
							//value={selectedSurgery.surgeryYear}
							//readOnly={!addingNew}
							//onChange={(e) =>
							//setSelectedSurgery({
							//	...selectedSurgery,
							//	surgeryYear: e.target.value,
							//})
							//}
							style={{
								container: {
									width: "60%",
									height: "10%",
									paddingLeft: "0.5rem",
								},
								select: {},
								option: {},
								indicator: {
									top: "45%",
									right: "4%",
								},
							}}
						/>

						<p // Operación por Histerectomía
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "1rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							¿Tuvo alguma complicación?:
						</p>
						<div
							style={{
								display: "flex",
								gap: "1rem",
								alignItems: "center",
								paddingLeft: "0.5rem",
							}}
						>
							<RadioInput
								name="complications "
								//checked={smokingStatus}
								//onChange={() => handleSmokingChange(true)}
								label="Sí"
								//disabled={!isEditable}
							/>
							<RadioInput
								name="nocomplications"
								//checked={!smokingStatus}
								//onChange={() => handleSmokingChange(false)}
								label="No"
								//disabled={!isEditable}
							/>
						</div>

						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								paddingTop: "2rem",
							}}
						>
							<BaseButton
								text="Agregar otra operación"
								// onClick={handleSaveNonPathological}
								style={{ width: "20%", height: "3rem" }}
							/>
						</div>

						<div // BORDER
							style={{
								padding: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
							}}
						/>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								paddingTop: "1.5rem",
							}}
						>
							<BaseButton
								text="Guardar"
								//onClick={handleSaveNonPathological}
								style={{ width: "30%", height: "3rem" }}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
