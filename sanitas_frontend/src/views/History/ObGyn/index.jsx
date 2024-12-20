import { Suspense, useEffect, useState, useMemo } from "react";
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
import { useRef } from "react";
import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";
import IconButton from "src/components/Button/Icon";
import { getErrorMessage } from "src/utils/errorhandlerstoasts";

export function ObGynHistory({
	getBirthdayPatientInfo,
	getObGynHistory,
	updateObGynHistory,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
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
	const obgynHistoryResource = useMemo(
		() => WrapPromise(getObGynHistory(id)),
		[id, reload, getObGynHistory],
	);

	// Triggers a state change to force reloading of data
	const triggerReload = () => {
		setReload((prev) => !prev);
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
								triggerReload={triggerReload}
								reload={reload}
								key={reload}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

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
	const [diagnosed, setDiagnosed] = useState(!!diagnosisDetails.medication);
	const [diagnosisName, setDiagnosisName] = useState(
		diagnosisDetails.illness || "",
	);
	const [medication, setMedication] = useState(
		diagnosisDetails.medication || "",
	);
	const [dose, setDose] = useState(diagnosisDetails.dosage || "");
	const [frequency, setFrequency] = useState(diagnosisDetails.frequency || "");

	const showFields = isNew || diagnosed;

	const handleDiagnosedChangeRef = useRef(handleDiagnosedChange);
	handleDiagnosedChangeRef.current = handleDiagnosedChange;

	useEffect(() => {
		const stableHandleDiagnosedChange = handleDiagnosedChangeRef.current;
		stableHandleDiagnosedChange(diagnosisKey, true, {
			illness: diagnosisName,
			medication: medication,
			dosage: dose,
			frequency: frequency,
		});
	}, [diagnosisName, medication, dose, frequency, diagnosisKey]);

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
								onChange={(e) => setDiagnosisName(e.target.value)}
								readOnly={editable}
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
						readOnly={editable}
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
						readOnly={editable}
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
						readOnly={editable}
						placeholder="Ingrese cada cuándo administra el medicamento (Ej. Cada dos días, cada 12 horas...)"
						style={{
							width: "60%",
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
	const checkPerformed = (resource) => {
		if (Array.isArray(resource)) {
			return resource.length > 0;
		}
		if (typeof resource === "object" && resource !== null) {
			return Object.keys(resource).length > 0 && resource.year !== null;
		}
		return !!resource;
	};

	const [performed, setPerformed] = useState(() =>
		checkPerformed(operationDetailsResource),
	);
	const isArray = Array.isArray(operationDetailsResource);
	const [operationDetails, setOperationDetails] = useState(() =>
		isArray ? operationDetailsResource : [operationDetailsResource],
	);

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
	const handlePerformedChangeInternal = (newPerformedStatus) => {
		setPerformed(newPerformedStatus);
		handlePerformedChange(operationKey, newPerformedStatus);

		if (!newPerformedStatus) {
			const clearedDetails = isArray ? [] : {};
			setOperationDetails(clearedDetails);
			updateGlobalOperations(operationKey, clearedDetails);
		} else {
			if (isArray && (!operationDetails || operationDetails.length === 0)) {
				const defaultDetail = { year: "", complications: false };
				const newDetails = [defaultDetail];
				setOperationDetails(newDetails);
				updateGlobalOperations(operationKey, newDetails);
			} else if (
				!isArray &&
				(!operationDetails || Object.keys(operationDetails).length === 0)
			) {
				const defaultDetail = { year: "", complications: false };
				setOperationDetails([defaultDetail]);
				updateGlobalOperations(operationKey, [defaultDetail]);
			}
		}
	};

	const addOperationDetail = () => {
		if (!canAddMore()) return;
		const newDetail = { year: null, complications: false };
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
		updatedDetails[index].year = year || "";
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
							onChange={(e) => handleYearChange(index, e.target.value)}
							style={{
								container: {
									width: "60%",
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
	reload,
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
		gynecologicalHistoryResult.result?.medicalHistory?.firstMenstrualPeriod
			?.data?.age ||
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

	useEffect(() => {
		setG(P + C + A);
	}, [P, C, A]);

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

	const [diagnoses, setDiagnoses] = useState(() => {
		const initialDiagnoses = [
			{
				key: "ovarianCysts",
				title: "Diagnóstico por Quistes Ováricos:",
				active: true,
				details: diagnosedIllnesses.data.ovarianCysts?.medication || {},
			},
			{
				key: "uterineMyomatosis",
				title: "Diagnóstico por Miomatosis Uterina:",
				active: true,
				details: diagnosedIllnesses.data.uterineMyomatosis?.medication || {},
			},
			{
				key: "endometriosis",
				title: "Diagnóstico por Endometriosis:",
				active: true,
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
							details: updatedDetails,
						};
					}
				}
				return diagnosis;
			}),
		);
	};

	// OPERACIONES SECTION

	const [operations, setOperations] = useState(() => {
		const initialOperations = [
			{
				key: "hysterectomy",
				title: "Operación por Histerectomía:",
				details: hasSurgeries.data.hysterectomy || {},
			},
			{
				key: "sterilization",
				title: "Cirugía para no tener más hijos:",
				details: hasSurgeries.data.sterilizationSurgery || {},
			},
			{
				key: "ovarianCysts",
				title: "Operación por Quistes Ováricos:",
				details: hasSurgeries.data.ovarianCystsSurgery || [],
			},
			{
				key: "breastMassResection",
				title: "Operación por Resección de masas en mamas:",
				details: hasSurgeries.data.breastMassResection || [],
			},
		];

		return initialOperations;
	});

	const mapOperationDetails = (operationKey) => {
		const operation = operations.find((op) => op.key === operationKey);
		if (!operation) return {};
		return operation.details;
	};

	const updateGlobalOperations = (operationKey, newDetails) => {
		setOperations(
			operations.map((op) => {
				if (op.key === operationKey) {
					return { ...op, details: newDetails };
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

	// Canceling update
	const handleCancel = () => {
		setIsEditable(false);
		toast.info("Edición cancelada.");
	};

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

	// biome-ignore  lint/complexity/noExcessiveCognitiveComplexity: It's the function to update the arrays and objects in JSON.
	const handleSaveGynecologicalHistory = async () => {
		if (!validateGynecologicalHistory()) {
			return;
		}

		// Agregar lógica para mostrar el toast según si se está guardando o actualizando
		const isUpdating = isEditable; // Asumiendo que isEditable indica si se está actualizando
		toast.info(
			isUpdating
				? "Actualizando antecedentes ginecoobstétricos..."
				: "Guardando antecedentes ginecoobstétricos...",
		);

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

		const result = await updateObGynHistory(id, medicalHistory);
		if (!result.error) {
			toast.success(
				isUpdating
					? "Antecedentes ginecoobstétricos actualizados con éxito."
					: "Antecedentes ginecoobstétricos guardados con éxito.",
			);
			triggerReload();
			setIsEditable(false);
		} else {
			toast.error(getErrorMessage(result, "ginecoobstetricos"));
		}
	};

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
					padding: "1rem 1rem 1rem 2rem",
					height: "65vh",
					border: `1px solid ${colors.primaryBackground}`,
					borderRadius: "10px",
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

							{!isFirstTime &&
								(isEditable ? (
									<div style={{ display: "flex", gap: "1rem" }}>
										<IconButton
											icon={CheckIcon}
											onClick={handleSaveGynecologicalHistory}
										/>
										<IconButton icon={CancelIcon} onClick={handleCancel} />
									</div>
								) : (
									<IconButton
										icon={EditIcon}
										onClick={() => setIsEditable(true)}
									/>
								))}
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
								onChange={() => {
									setIsPainful(false);
									setMedication("");
								}}
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
										editable={!isEditable}
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
									const key = `${operation.key}-${reload}`;

									return (
										<div key={operation.key}>
											<OperationSection
												key={key}
												title={operation.title}
												operationKey={operation.key}
												editable={!isEditable}
												birthdayResource={birthdayResource}
												operationDetailsResource={mapOperationDetails(
													operation.key,
												)}
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

								{isFirstTime && (
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
