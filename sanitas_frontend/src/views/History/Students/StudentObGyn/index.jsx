import { Suspense, useEffect, useState, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import BaseButton from "src/components/Button/Base/index";
import DropdownMenu from "src/components/DropdownMenu";
import { BaseInput } from "src/components/Input/index";
import { RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import StudentDashboardTopbar from "src/components/StudentDashboardTopBar";
import useWindowSize from "src/utils/useWindowSize";

/**
 * @typedef {Object} StudentObGynHistoryProps
 * @property {import("src/dataLayer.mjs").GetGeneralPatientInformationAPICall} getBirthdayPatientInfo
 * @property {import("src/dataLayer.mjs").GetGynecologicalHistoryCallback} getObGynHistory
 * @property {import("src/dataLayer.mjs").UpdateStudentGynecologialHistoryCallback} updateObGynHistory
 * @property {import("src/store.mjs").UseStoreHook} useStore
 * @property {import("src/components/StudentDashboardTopBar").StudentDashboardTopbarProps} sidebarConfig
 */

/**
 * @type {StudentObGynHistoryProps}
 */
export function StudentObGynHistory({
	getBirthdayPatientInfo,
	getObGynHistory,
	updateObGynHistory,
	sidebarConfig,
	useStore,
}) {
	//   const id = useStore((s) => s.selectedPatientId);
	const id = 1;
	const [reload, setReload] = useState(false); // Controls reload toggling for refetching data

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes ginecoobstétricos..." />
		);
	};

	// biome-ignore  lint/correctness/useExhaustiveDependencies: Reload the page
	const birthdayResource = useMemo(
		() => WrapPromise(getBirthdayPatientInfo(id)),
		[id, reload, getBirthdayPatientInfo],
	);
	// biome-ignore  lint/correctness/useExhaustiveDependencies: Reload the page
	const obgynHistoryResource = useMemo(() => {
		// console.log("Recalculating getObGynHistory resource...");
		return WrapPromise(getObGynHistory(id));
	}, [id, reload, getObGynHistory]);

	// Triggers a state change to force reloading of data
	const triggerReload = () => {
		setReload((prev) => !prev);
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				backgroundColor: colors.primaryBackground,
				minHeight: "100vh",
				padding: "2rem",
				gap: "1rem",
			}}
		>
			<div>
				<div
					style={{
						width: "100%",
						padding: "0 0 1rem 0",
						flex: "0 0 20%",
					}}
				>
					<StudentDashboardTopbar
						{...sidebarConfig}
						activeSectionProp="ginecoobstetricos"
					/>
				</div>
			</div>

			<div
				style={{
					width: "100%",
					height: "100%",
					backgroundColor: colors.secondaryBackground,
					padding: "3.125rem",
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
							textAlign: "center",
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
							textAlign: "center",
						}}
					>
						Por favor, completa la información solicitada; será tratada con
						estricta confidencialidad.
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
							triggerReload={triggerReload}
						/>
					</Suspense>
				</div>
			</div>
		</div>
	);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: This is a view function, complexity is expected
function DiagnosisSection({
	title,
	diagnosisKey,
	editable,
	isNew,
	isFirstTime,
	onCancel,
	diagnosisDetails,
	handleDiagnosedChange,
}) {
	const originalDiagnosed = !!diagnosisDetails.medication;
	const [diagnosed, setDiagnosed] = useState(originalDiagnosed);
	const [diagnosisName, setDiagnosisName] = useState(
		diagnosisDetails.illness || "",
	);
	const [medication, setMedication] = useState(
		diagnosisDetails.medication || "",
	);
	const [dose, setDose] = useState(diagnosisDetails.dosage || "");
	const [frequency, setFrequency] = useState(diagnosisDetails.frequency || "");
	const { width } = useWindowSize();
	const isMobile = width < 768;

	const showFields = isNew || diagnosed;

	const updateField = (field, value) => {
		handleDiagnosedChange(diagnosisKey, true, {
			illness: diagnosisName,
			medication: medication,
			dosage: dose,
			frequency: frequency,
			[field]: value,
		});
	};

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
						onChange={() => {
							const newState = !diagnosed;
							setDiagnosed(newState);
							handleDiagnosedChange(diagnosisKey, newState, {
								medication: medication,
								dosage: dose,
								frequency: frequency,
							});
						}}
						label="Sí"
						disabled={editable}
					/>
					<RadioInput
						name={diagnosisKey}
						checked={!diagnosed}
						onChange={() => {
							setDiagnosed(false);
							handleDiagnosedChange(diagnosisKey, false);
							setDiagnosisName("");
							setMedication("");
							setDose("");
							setFrequency("");
						}}
						label="No"
						disabled={editable}
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
								onChange={(e) => {
									const value = e.target.value;
									setDiagnosisName(value);
									updateField("illness", value);
								}}
								readOnly={editable}
								placeholder="Ingrese el nombre del diagnóstico."
								style={{
									width: isMobile ? "100%" : "60%",
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
						onChange={(e) => {
							const value = e.target.value;
							setMedication(value);
							updateField("medication", value);
						}}
						readOnly={editable}
						placeholder="Ingrese el medicamento administrado."
						style={{
							width: isMobile ? "100%" : "60%",
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
						onChange={(e) => {
							const value = e.target.value;
							setDose(value);
							updateField("dosage", value);
						}}
						readOnly={editable}
						placeholder="Ingrese cuánto. Ej. 50mg (Este campo es opcional)"
						style={{
							width: isMobile ? "100%" : "60%",
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
						onChange={(e) => {
							const value = e.target.value;
							setFrequency(value);
							updateField("frequency", value);
						}}
						readOnly={editable}
						placeholder="Ingrese cada cuándo administra el medicamento (Ej. Cada dos días, cada 12 horas...)"
						style={{
							width: isMobile ? "100%" : "60%",
							height: "3rem",
							fontFamily: fonts.textFont,
							fontSize: "1rem",
						}}
					/>

					{(isFirstTime || editable) && isNew && (
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
const checkPerformed = (resource) => {
	if (Array.isArray(resource)) {
		return resource.length > 0;
	}
	if (typeof resource === "object" && resource !== null) {
		return Object.keys(resource).length > 0 && resource.year !== null;
	}
	return !!resource;
};

function OperationSection({
	title,
	operationKey,
	editable,
	isFirstTime,
	operationDetailsResource,
	updateGlobalOperations,
	handlePerformedChange,
	birthdayResource,
}) {
	const [performed, setPerformed] = useState(() =>
		checkPerformed(operationDetailsResource),
	);
	const isArray = Array.isArray(operationDetailsResource);
	// Se agrego como defaultDetails un objeto con year como "" y complications como false para evitar el error de: A value changed from a controlled input to a uncontrolled input
	const [operationDetails, setOperationDetails] = useState(() => {
		const initialDetails = isArray
			? operationDetailsResource
			: [operationDetailsResource];

		if (performed && initialDetails.length === 0) {
			const defaultDetail = { year: "", complications: false };
			return [defaultDetail];
		}

		const normalizedDetails = initialDetails.map((detail) => ({
			...detail,
			complications: detail.complications ?? false,
			year: detail.year ?? "",
		}));
		return normalizedDetails;
	});

	const { width } = useWindowSize();
	const isMobile = width < 768;

	const handlePerformedChangeInternal = (newPerformedStatus) => {
		setPerformed(newPerformedStatus);
		handlePerformedChange(operationKey, newPerformedStatus);

		if (newPerformedStatus) {
			if (operationDetails.length === 0) {
				const defaultDetail = { year: null, complications: false };
				const newDetails = [defaultDetail];
				setOperationDetails(newDetails);
				updateGlobalOperations(operationKey, newDetails);
			}
		}

		//Este código lo quité porque no se necesita limpiar los detalles de la operación, cuando
		// le dabas a Sí y elegías algo en el dropdown de año, se insta reseteaba y no se podía elegir

		// if (!newPerformedStatus) {
		//   const clearedDetails = isArray ? [] : {};
		//   setOperationDetails(clearedDetails);
		//   updateGlobalOperations(operationKey, clearedDetails);
		// } else {
		//   if (isArray && (!operationDetails || operationDetails.length === 0)) {
		//     const defaultDetail = { year: "", complications: false };
		//     const newDetails = [defaultDetail];
		//     setOperationDetails(newDetails);
		//     updateGlobalOperations(operationKey, newDetails);
		//   } else if (!isArray && (!operationDetails || Object.keys(operationDetails).length === 0)) {
		//     const defaultDetail = { year: "", complications: false };
		//     setOperationDetails([defaultDetail]);
		//     updateGlobalOperations(operationKey, [defaultDetail]);
		//   }
		// }
	};

	const addOperationDetail = () => {
		if (!canAddMore()) return;
		//Aquí lo mismo para que no salga lo de: A value changed from a controlled input to a uncontrolled input
		const newDetail = { year: "", complications: false };
		const newDetails = [...operationDetails, newDetail];
		setOperationDetails(newDetails);
		updateGlobalOperations(operationKey, newDetails);
	};

	const canAddMore = () => {
		if (
			operationKey === "breastMassResection" ||
			operationKey === "ovarianCysts"
		) {
			if (operationKey === "breastMassResection") {
				return operationDetails.length < 2;
			}
			return true;
		}
		return false;
	};

	const handleComplicationChange = (index, value) => {
		const updatedDetails = [...operationDetails];
		updatedDetails[index].complications = value;
		setOperationDetails(updatedDetails);
		updateGlobalOperations(operationKey, updatedDetails);
	};

	const removeOperationDetail = (index) => {
		if (operationDetails.length > 1) {
			const newDetails = operationDetails.filter((_, idx) => idx !== index);
			setOperationDetails(newDetails);
			updateGlobalOperations(operationKey, newDetails);
		}
	};

	const [yearOptions, setYearOptions] = useState([]);

	const birthYearResult = birthdayResource.read();

	const birthYearData = birthYearResult.result;
	const currentYear = new Date().getFullYear();
	const birthYear = birthYearData?.birthdate
		? new Date(birthYearData.birthdate).getUTCFullYear()
		: null;

	useEffect(() => {
		if (birthYear) {
			const options = [];
			for (let year = birthYear; year <= currentYear; year++) {
				options.push({ value: year, label: year.toString() });
			}
			setYearOptions(options);
		}
	}, [birthYear, currentYear]);

	const handleYearChange = (index, year) => {
		const updatedDetails = [...operationDetails];
		updatedDetails[index] = { ...updatedDetails[index], year };
		setOperationDetails(updatedDetails);
		updateGlobalOperations(operationKey, updatedDetails);
	};

	return (
		<div>
			<p
				style={{
					paddingBottom: "0.5rem",
					paddingTop: "2rem",
					fontFamily: fonts.textFont,
					fontSize: fontSize.textSize,
					fontWeight: performed ? "bold" : "normal",
				}}
			>
				{title}
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
					name={operationKey}
					checked={performed}
					onChange={() => handlePerformedChangeInternal(true)}
					label="Sí"
					disabled={editable}
				/>
				<RadioInput
					name={operationKey}
					checked={!performed}
					onChange={() => handlePerformedChangeInternal(false)}
					label="No"
					disabled={editable}
				/>
			</div>
			{performed &&
				Array.isArray(operationDetails) &&
				operationDetails.map((detail, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: The index is used to identify the operation details
					<div key={index}>
						{index !== 0 && (
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
						)}

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
							value={detail.year}
							disabled={editable}
							onChange={(e) => {
								handleYearChange(index, e.target.value);
							}}
							style={{
								container: {
									width: isMobile ? "100%" : "60%",
									height: "10%",
									paddingLeft: "0.5rem",
								},
								select: {},
								option: {},
								indicator: {
									top: "48%",
									right: "4%",
								},
							}}
						/>

						<p
							style={{
								paddingBottom: "0.5rem",
								paddingTop: "1rem",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							¿Tuvo alguna complicación?:
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
								name={`complications-${index}`}
								checked={detail.complications}
								onChange={() => handleComplicationChange(index, true)}
								label="Sí"
								disabled={editable}
							/>
							<RadioInput
								name={`complications-${index}`}
								checked={!detail.complications}
								onChange={() => handleComplicationChange(index, false)}
								label="No"
								disabled={editable}
							/>
						</div>
						{index !== 0 && (isFirstTime || !editable) ? (
							<div
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									paddingTop: "1rem",
								}}
							>
								<BaseButton
									text="Cancelar nueva operación"
									onClick={() => removeOperationDetail(index)}
									style={{
										width: "25%",
										height: "3rem",
										backgroundColor: "#fff",
										color: colors.primaryBackground,
										border: `1.5px solid ${colors.primaryBackground}`,
									}}
								/>
							</div>
						) : null}
					</div>
				))}

			{performed && canAddMore() && (
				<div>
					{(isFirstTime || !editable) && (
						<div>
							<div
								style={{
									padding: "1rem",
									borderBottom: `0.04rem  solid ${colors.darkerGrey}`,
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
									text="Agregar otra operación"
									onClick={addOperationDetail}
									style={{ width: "20%", height: "3rem" }}
								/>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
function ObGynView({
	id,
	birthdayResource,
	obgynHistoryResource,
	updateObGynHistory,
	triggerReload,
}) {
	const gynecologicalHistoryResult = obgynHistoryResource.read();

	let errorMessage = "";
	if (gynecologicalHistoryResult.error) {
		const error = gynecologicalHistoryResult.error;
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

	const {
		firstMenstrualPeriod = { data: { age: null } },
		regularCycles = { data: { isRegular: null } },
		painfulMenstruation = { data: { isPainful: null, medication: "" } },
		pregnancies = {
			data: {
				totalPregnancies: null,
				abortions: null,
				cesareanSections: null,
				vaginalDeliveries: null,
			},
		},
		diagnosedIllnesses = {
			data: {
				ovarianCysts: {
					medication: { dosage: "", frequency: "", medication: "" },
				},
				uterineMyomatosis: {
					medication: { dosage: "", frequency: "", medication: "" },
				},
				endometriosis: {
					medication: { dosage: "", frequency: "", medication: "" },
				},
				otherCondition: {
					medication: {
						dosage: "",
						frequency: "",
						medication: "",
						illness: "",
					},
				},
			},
		},
		hasSurgeries = {
			data: {
				ovarianCystsSurgery: [{ year: null, complications: false }],
				hysterectomy: { year: null, complications: false },
				sterilizationSurgery: { year: null, complications: false },
				breastResection: [{ year: null, complications: false }],
			},
		},
	} = gynecologicalHistoryResult.result?.medicalHistory || {};

	const [age, setAge] = useState(
		firstMenstrualPeriod.data.age != null
			? firstMenstrualPeriod.data.age.toString()
			: "",
	);

	const [isRegular, setIsRegular] = useState(
		regularCycles.data.isRegular != null ? regularCycles.data.isRegular : false,
	);

	const [isPainful, setIsPainful] = useState(
		painfulMenstruation.data.isPainful != null
			? painfulMenstruation.data.isPainful
			: false,
	);

	const [medication, setMedication] = useState(
		painfulMenstruation.data.medication != null
			? painfulMenstruation.data.medication
			: "",
	);

	const isFirstTime = !(
		gynecologicalHistoryResult.result?.medicalHistory?.diagnosedIllnesses?.data
			.length ||
		gynecologicalHistoryResult.result?.medicalHistory?.hasSurgeries?.data.length
	);

	const [isEditable, setIsEditable] = useState(isFirstTime);

	// TOTAL P SECTION

	const [P, setP] = useState(
		pregnancies.data.vaginalDeliveries != null
			? pregnancies.data.vaginalDeliveries
			: 0,
	);
	const [C, setC] = useState(
		pregnancies.data.cesareanSections != null
			? pregnancies.data.cesareanSections
			: 0,
	);
	const [A, setA] = useState(
		pregnancies.data.abortions != null ? pregnancies.data.abortions : 0,
	); // Abortos
	const [G, setG] = useState(0);

	//Aqui talvez iría algo como initialA, initialC, initialP que traiga los datos del JSON

	useEffect(() => {
		setG(P + C + A);
	}, [P, C, A]);

	const { width } = useWindowSize();
	const isMobile = width < 768;

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
							width: isMobile ? "100%" : "60%",
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

	const [diagnoses, setDiagnoses] = useState(() => {
		const initialDiagnoses = [
			{
				key: "ovarianCysts",
				title: "Diagnóstico por Quistes Ováricos:",
				active: true,
				hasBeenEdited: false,
				details: diagnosedIllnesses.data.ovarianCysts?.medication || {},
			},
			{
				key: "uterineMyomatosis",
				title: "Diagnóstico por Miomatosis Uterina:",
				active: true,
				hasBeenEdited: false,
				details: diagnosedIllnesses.data.uterineMyomatosis?.medication || {},
			},
			{
				key: "endometriosis",
				title: "Diagnóstico por Endometriosis:",
				active: true,
				hasBeenEdited: false,
				details: diagnosedIllnesses.data.endometriosis?.medication || {},
			},
		];

		const otherConditions = diagnosedIllnesses.data?.otherCondition ?? [];
		for (const condition of otherConditions) {
			initialDiagnoses.push({
				key: condition.medication.illness,
				title: `Nuevo Diagnóstico: ${condition.medication.illness}`,
				isNew: false,
				active: true,
				hasBeenEdited: false,
				details: condition.medication,
			});
		}

		return initialDiagnoses;
	});

	const addDiagnosis = () => {
		const diagnosisCount = diagnoses.length + 1;

		const newDiagnosis = {
			key: `Nuevo Diagnóstico ${diagnosisCount}`,
			title: `Nuevo Diagnóstico ${diagnosisCount}`,
			isNew: true,
			active: true,
			hasBeenEdited: false,
			details: {
				illness: "",
				medication: "",
				dosage: "",
				frequency: "",
			},
		};

		setDiagnoses((prevDiagnoses) => [...prevDiagnoses, newDiagnosis]);
	};

	const removeDiagnosis = (key) => {
		setDiagnoses(diagnoses.filter((diagnosis) => diagnosis.key !== key));
	};

	const getDiagnosisDetails = (key) => {
		const diagnosis = diagnoses.find((d) => d.key === key);
		if (!diagnosis?.active) {
			return { dosage: "", frequency: "", medication: "", illness: "" };
		}

		if (["ovarianCysts", "uterineMyomatosis", "endometriosis"].includes(key)) {
			return (
				diagnosedIllnesses.data[key]?.medication || {
					dosage: "",
					frequency: "",
					medication: "",
					illness: "",
				}
			);
		}

		const condition = diagnosedIllnesses.data.otherCondition?.find(
			(cond) => cond.medication.illness === key,
		);

		return condition?.medication
			? {
					dosage: condition.medication.dosage || "",
					frequency: condition.medication.frequency || "",
					medication: condition.medication.medication || "",
					illness: condition.medication.illness || "",
				}
			: {
					dosage: "",
					frequency: "",
					medication: "",
					illness: "",
				};
	};

	const handleDiagnosedChange = (diagnosisKey, isActive, newDetails = {}) => {
		setDiagnoses((prevDiagnoses) =>
			// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
			prevDiagnoses.map((diagnosis) => {
				if (diagnosis.key === diagnosisKey) {
					if (!isActive) {
						return {
							...diagnosis,
							active: false,
							hasBeenEdited: true,
							details: { medication: "", dosage: "", frequency: "" },
						};
						// biome-ignore lint/style/noUselessElse: Handles the data structure of the diagnoses for static ones and the new diagnostics
					} else {
						const updatedDetails = {
							medication:
								newDetails.medication || diagnosis.details.medication || "",
							dosage: newDetails.dosage || diagnosis.details.dosage || "",
							frequency:
								newDetails.frequency || diagnosis.details.frequency || "",
						};

						if (
							diagnosis.isNew &&
							diagnosis.key.startsWith("Nuevo Diagnóstico")
						) {
							updatedDetails.illness =
								newDetails.illness || diagnosis.details.illness || "";
						}

						return {
							...diagnosis,
							active: true,
							hasBeenEdited: true,
							details: updatedDetails,
						};
					}
				}
				return diagnosis;
			}),
		);
	};

	// OPERACIONES SECTION
	const genResultOperations = () => {
		const initialOperations = [
			{
				key: "hysterectomy",
				title: "Operación por Histerectomía:",
				hasBeenEdited: false,
				details: hasSurgeries.data.hysterectomy || {},
			},
			{
				key: "sterilization",
				title: "Cirugía para no tener más hijos:",
				hasBeenEdited: false,
				details: hasSurgeries.data.sterilizationSurgery || {},
			},
			{
				key: "ovarianCysts",
				title: "Operación por Quistes Ováricos:",
				hasBeenEdited: false,
				details: hasSurgeries.data.ovarianCystsSurgery || [],
			},
			{
				key: "breastMassResection",
				title: "Operación por Resección de masas en mamas:",
				hasBeenEdited: false,
				details: hasSurgeries.data.breastMassResection || [],
			},
		];
		return initialOperations;
	};

	const [operations, setOperations] = useState(() => genResultOperations());

	const hasBeenEdited =
		operations.some((op) => op.hasBeenEdited) ||
		diagnoses.some((d) => d.hasBeenEdited);

	const mapOperationDetails = (operationKey) => {
		const operation = operations.find((op) => op.key === operationKey);
		if (!operation) return {};
		return operation.details;
	};

	const updateGlobalOperations = (operationKey, newDetails) => {
		setOperations(
			operations.map((op) => {
				if (op.key === operationKey) {
					return { ...op, hasBeenEdited: true, details: newDetails };
				}
				return op;
			}),
		);
	};

	const handlePerformedChange = (operationKey, isPerformed) => {
		setOperations((prevOperations) =>
			// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
			prevOperations.map((operation) => {
				if (operation.key === operationKey) {
					const clearedDetails = isPerformed
						? operation.details
						: operation.key === "ovarianCysts" ||
								operation.key === "breastMassResection"
							? []
							: {};

					return {
						...operation,
						hasBeenEdited: true,
						details: clearedDetails,
					};
				}
				return operation;
			}),
		);
	};

	const validateGynecologicalHistory = () => {
		if (!age || Number.isNaN(age) || Number(age) < 1) {
			toast.error("Por favor, ingrese una edad válida.");
			return false;
		}

		if (
			!Number.isInteger(G) ||
			G < 0 ||
			!Number.isInteger(C) ||
			C < 0 ||
			!Number.isInteger(A) ||
			A < 0 ||
			G < C + A
		) {
			toast.error("Por favor, ingrese datos válidos en la sección de partos.");
			return false;
		}

		if (isPainful && medication.trim() === "") {
			toast.error(
				"Por favor, complete los detalles del medicamento para la menstruación dolorosa.",
			);
			return false;
		}

		const invalidDiagnosis = diagnoses.some((diagnosis) => {
			const { medication, dosage, frequency } = diagnosis.details;

			if (diagnosis.active) {
				const initialDetails = getDiagnosisDetails(diagnosis.key);
				const isInitiallyFilled = (field) =>
					initialDetails[field] && initialDetails[field].trim() !== "";

				return (
					(isInitiallyFilled("medication") && medication.trim() === "") ||
					(isInitiallyFilled("dosage") && dosage.trim() === "") ||
					(isInitiallyFilled("frequency") && frequency.trim() === "")
				);
			}
			return false;
		});

		if (invalidDiagnosis) {
			toast.error(
				"Por favor, complete los detalles de todos los diagnósticos activos.",
			);
			return false;
		}

		const invalidOperation = operations.some((operation) => {
			const details = Array.isArray(operation.details)
				? operation.details
				: [operation.details];
			return details.some((detail) => detail.year === null);
		});

		if (invalidOperation) {
			toast.error("Por favor, complete los detalles de todas las operaciones.");
			return false;
		}

		return true;
	};

	const structuredOperations = operations.reduce((acc, operation) => {
		const details = mapOperationDetails(operation.key);

		acc[operation.key] = Array.isArray(details)
			? details.map(({ year = null, complications = false }) => ({
					year,
					complications,
				}))
			: { ...details };

		return acc;
	}, {});

	const fixedDiagnosesKeys = [
		"ovarianCysts",
		"uterineMyomatosis",
		"endometriosis",
	];

	const formattedDiagnosedIllnesses = {
		version: diagnosedIllnesses?.version || 1,
		data: diagnoses.reduce((acc, diagnosis) => {
			if (fixedDiagnosesKeys.includes(diagnosis.key)) {
				acc[diagnosis.key] = {
					medication: { ...diagnosis.details },
				};
			} else {
				acc.otherCondition = acc.otherCondition || [];
				acc.otherCondition.push({
					medication: {
						illness: diagnosis.key,
						...diagnosis.details,
					},
				});
			}
			return acc;
		}, {}),
	};

	const handleSaveGynecologicalHistory = async () => {
		if (!validateGynecologicalHistory()) {
			return;
		}

		const medicalHistory = {
			firstMenstrualPeriod: {
				version: firstMenstrualPeriod?.version || 1,
				data: {
					age: age,
				},
			},
			regularCycles: {
				version: regularCycles?.version || 1,
				data: {
					isRegular: isRegular,
				},
			},
			painfulMenstruation: {
				version: painfulMenstruation?.version || 1,
				data: {
					isPainful: isPainful,
					medication: medication,
				},
			},
			pregnancies: {
				version: pregnancies?.version || 1,
				data: {
					totalPregnancies: G,
					vaginalDeliveries: P,
					cesareanSections: C,
					abortions: A,
				},
			},
			diagnosedIllnesses: formattedDiagnosedIllnesses,
			hasSurgeries: {
				version: hasSurgeries?.version || 1,
				data: {
					hysterectomy: structuredOperations.hysterectomy || {},
					sterilizationSurgery: structuredOperations.sterilization || {},
					ovarianCystsSurgery: structuredOperations.ovarianCysts || null,
					breastMassResection: structuredOperations.breastMassResection || [],
				},
			},
		};

		toast.info("Guardando antecedente ginecoobstétrico...");

		const result = await updateObGynHistory(id, medicalHistory);
		if (!result.error) {
			toast.success("Antecedentes ginecoobstétricos actualizados con éxito.");
			triggerReload();
			setIsEditable(false);
		} else {
			toast.error(
				`Error al actualizar los antecedentes ginecoobstétricos: ${result.error}`,
			);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "row",
				width: "100%",
				height: "100%",
				border: `1px solid ${colors.primaryBackground}`,
				borderRadius: "10px",
				paddingBottom: "1rem",
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
				{errorMessage ? (
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
				) : (
					<>
						{isFirstTime && (
							<div
								style={{
									padding: "1rem 0 1rem 0",
									textAlign: "center",
									color: colors.titleText,
									fontWeight: "bold",
									fontFamily: fonts.textFont,
									fontSize: fontSize.textSize,
								}}
							>
								Por favor, ingrese los datos del paciente. Parece que es su
								primera visita aquí.
							</div>
						)}

						<div
							style={{
								display: "flex",
								flexDirection: "row",
								justifyContent: "space-between",
								alignItems: "center", // Opcional para alinear los ítems verticalmente
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
						</div>

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
								width: isMobile ? "100%" : "60%",
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
								disabled={isEditable}
							/>
							<RadioInput
								name="notregular"
								checked={isRegular === false}
								onChange={() => setIsRegular(false)}
								label="No"
								disabled={isEditable}
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
								disabled={isEditable}
							/>
							<RadioInput
								name="nopain"
								checked={isPainful === false}
								onChange={() => {
									setIsPainful(false);
									setMedication("");
								}}
								label="No"
								disabled={isEditable}
							/>
						</div>

						{renderMedicationInput()}

						<div
							style={{
								padding: "1rem",
								borderBottom: `0.04rem solid ${colors.darkerGrey}`,
								display: "flex",
								justifyContent: "center",
							}}
						/>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "center",
								flexWrap: isMobile ? "wrap" : "initial",
								gap: isMobile ? "1rem" : "2rem",
								padding: "1rem 2rem",
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
										// paddingTop: "2rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									# Embarazos:
								</p>
								<BaseInput
									value={G}
									readOnly={true}
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
									// paddingTop: isMobile ? 0 : "3.5rem",
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
										// paddingTop: isMobile ? 0 : "3.5rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									# Partos vaginales
								</p>
								<BaseInput
									value={P}
									onChange={(e) => setP(Number(e.target.value) || 0)}
									readOnly={!isEditable}
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
									// paddingTop: isMobile ? 0 : "3.5rem",
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
										// paddingTop: isMobile ? 0 : "3.5rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									# Cesáreas
								</p>
								<BaseInput
									value={C}
									onChange={(e) => setC(Number(e.target.value) || 0)}
									readOnly={!isEditable}
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
									// paddingTop: isMobile ? 0 : "3.5rem",
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
										// paddingTop: isMobile ? 0 : "3.5rem",
										fontFamily: fonts.textFont,
										fontSize: fontSize.textSize,
									}}
								>
									# Abortos:
								</p>
								<BaseInput
									value={A}
									onChange={(e) => setA(Number(e.target.value) || 0)}
									readOnly={!isEditable}
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
										editable={!!getDiagnosisDetails(diagnosis.key).medication}
										isNew={diagnosis.isNew}
										onCancel={() => removeDiagnosis(diagnosis.key)}
										diagnosisDetails={getDiagnosisDetails(diagnosis.key)}
										handleDiagnosedChange={handleDiagnosedChange}
										isFirstTime={isFirstTime}
									/>
									{index < diagnoses.length - 1 && (
										<div
											style={{
												padding: "1rem",
												borderBottom: `0.04rem solid ${colors.darkerGrey}`,
											}}
										/>
									)}
								</div>
							))}
							<div
								style={{
									padding: "1rem",
									borderBottom: `0.04rem solid ${colors.darkerGrey}`,
								}}
							/>

							{(isFirstTime || isEditable) && (
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
											text="Agregar otro diagnóstico"
											onClick={addDiagnosis}
											style={{ width: "25%", height: "3rem" }}
										/>
									</div>

									<div
										style={{
											padding: "1rem",
											borderBottom: `0.04rem solid ${colors.darkerGrey}`,
										}}
									/>
								</div>
							)}

							<div
								style={{
									padding: "1rem 0 1rem 0",
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

								{operations.map((operation, index) => {
									const getRequestOperations = genResultOperations();
									const requestDetails =
										getRequestOperations.find((op) => op.key === operation.key)
											?.details || {};

									// biome-ignore  lint/correctness/useHookAtTopLevel: Reload the page
									const operationDetailsResourceMemo = useMemo(
										() => mapOperationDetails(operation.key),
										[operation.key],
									);
									// Se usa useMemo para evitar que se resetee el valor de operationDetailsResources
									// así no se re-renderizaba el componente y ya dejaba volver a utilizar el
									//DropdownMenu para seleccionar el año de la operación

									return (
										<div key={operation.key}>
											<OperationSection
												title={operation.title}
												operationKey={operation.key}
												editable={!!checkPerformed(requestDetails)}
												birthdayResource={birthdayResource}
												operationDetailsResource={operationDetailsResourceMemo}
												updateGlobalOperations={updateGlobalOperations}
												handlePerformedChange={handlePerformedChange}
												isFirstTime={isFirstTime}
											/>
											{index < operations.length - 1 && (
												<div // BORDER
													style={{
														padding: "1rem",
														borderBottom: `0.04rem solid ${colors.darkerGrey}`,
													}}
												/>
											)}
										</div>
									);
								})}
								<div
									style={{
										padding: "1rem",
										borderBottom: `0.04rem solid ${colors.darkerGrey}`,
									}}
								/>

								{(isFirstTime || hasBeenEdited) && (
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
											onClick={handleSaveGynecologicalHistory}
											style={{ width: "30%", height: "3rem" }}
										/>
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
