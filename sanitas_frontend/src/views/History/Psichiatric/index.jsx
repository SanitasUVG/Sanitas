import { Suspense, useEffect, useState, useMemo } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import CheckIcon from "@tabler/icons/outline/check.svg";
import EditIcon from "@tabler/icons/outline/edit.svg";
import CancelIcon from "@tabler/icons/outline/x.svg";
import BaseButton from "src/components/Button/Base/index";
import DashboardSidebar from "src/components/DashboardSidebar";
import IconButton from "src/components/Button/Icon";
import { BaseInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * @typedef {Object} PsichiatricHistoryProps
 * @property {Function} getPsichiatricHistory - Function to fetch the allergic history of a patient.
 * @property {Function} updatePsichiatricHistory - Function to update or add new allergic records for a patient.
 * @property {Object} sidebarConfig - Configuration for the sidebar component, detailing any necessary props.
 * @property {Function} useStore - Custom React hook to access state management, specifically to retrieve the patient's ID.
 *
 * Component to manage and display a patient's allergic history, allowing users to add and view records.
 *
 * @param {PsichiatricHistoryProps} props - The props passed to the PsichiatricHistory component.
 * @returns {JSX.Element} - The rendered component with dynamic content based on the fetched data and user interactions.
 */

export function PsichiatricHistory({
	getPsichiatricHistory,
	updatePsichiatricHistory,
	sidebarConfig,
	useStore,
}) {
	const id = useStore((s) => s.selectedPatientId);
	const [reload, setReload] = useState(false); // Controls reload toggling for refetching data

	// Memoizing resources for blood type and history to avoid refetching unless ID changes or a reload is triggered
	// biome-ignore  lint/correctness/useExhaustiveDependencies: Reload the page
	const psichiatricHistoryResource = useMemo(
		() => WrapPromise(getPsichiatricHistory(id)),
		[id, reload, getPsichiatricHistory],
	);

	const triggerReload = () => {
		setReload((prev) => !prev);
	};

	const LoadingView = () => {
		return (
			<Throbber loadingMessage="Cargando información de los antecedentes psiquiátricos..." />
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
							Antecedentes Psiquiátricos
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
							Registro de antecedentes psiquiátricos
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
							<PsichiatricView
								id={id}
								psichiatricHistoryResource={psichiatricHistoryResource}
								updatePsichiatricHistory={updatePsichiatricHistory}
								triggerReload={triggerReload}
							/>
						</Suspense>
					</div>
				</div>
			</div>
		</div>
	);
}

/**
 * @typedef {Object} PsichiatricViewProps
 * @property {number} id - The patient's ID.
 * @property {Object} psichiatricHistoryResource - Wrapped resource for fetching psichiatric history data.
 * @property {Function} updatePsichiatricHistory - Function to update the Allergic history.
 * @property {Function} triggerReload - Function to trigger reloading of data.
 * Internal view component for managing the display and modification of a patient's psichiatric history, with options to add or edit records.
 *
 *
 * @param {PsichiatricViewProps} props - Specific props for the PsichiatricViewiew component.
 * @returns {JSX.Element} - A detailed view for managing Psichiatric history with interactivity to add or edit records.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
function PsichiatricView({
	id,
	psichiatricHistoryResource,
	updatePsichiatricHistory,
	triggerReload,
}) {
	const psichiatricHistoryResult = psichiatricHistoryResource.read();
	const psichiatricHistoryData = psichiatricHistoryResult.result || {};

	const medicalHistory = psichiatricHistoryData?.medicalHistory || {
		depression: { data: [] },
		anxiety: { data: [] },
		ocd: { data: [] },
		adhd: { data: [] },
		bipolar: { data: [] },
		other: { data: [] },
	};

	const [depressionMedications, setDepressionMedications] = useState([
		{ medication: "", dose: "", frequency: "" },
	]);

	const addDepressionMedication = () => {
		setDepressionMedications([
			...depressionMedications,
			{ medication: "", dose: "", frequency: "", isNew: true },
		]);
	};

	const removeLastDepressionMedication = () => {
		setDepressionMedications((prevMedications) => prevMedications.slice(0, -1));
	};

	const removeLastAnxietyMedication = () => {
		setAnxietyMedications((prevMedications) => prevMedications.slice(0, -1));
	};

	const removeLastTOCMedication = () => {
		setTOCMedications((prevMedications) => prevMedications.slice(0, -1));
	};

	const removeLastTDAHMedication = () => {
		setTDAHMedications((prevMedications) => prevMedications.slice(0, -1));
	};

	const removeLastBipolarMedication = () => {
		setBipolarMedications((prevMedications) => prevMedications.slice(0, -1));
	};

	const removeLastOtherMedication = () => {
		setOtherMedications((prevMedications) => prevMedications.slice(0, -1));
	};

	const handleDepressionMedicationChange = (index, field, value) => {
		const newMedications = [...depressionMedications];
		newMedications[index][field] = value;
		setDepressionMedications(newMedications);
	};

	const [anxietyMedications, setAnxietyMedications] = useState([
		{ medication: "", dose: "", frequency: "" },
	]);

	const addAnxietyMedication = () => {
		setAnxietyMedications([
			...anxietyMedications,
			{ medication: "", dose: "", frequency: "", isNew: true },
		]);
	};

	const [TOCMedications, setTOCMedications] = useState([
		{ medication: "", dose: "", frequency: "" },
	]);

	const addTOCMedication = () => {
		setTOCMedications([
			...TOCMedications,
			{ medication: "", dose: "", frequency: "", isNew: true },
		]);
	};

	const handleTOCMedicationChange = (index, field, value) => {
		const newMedications = [...TOCMedications];
		newMedications[index][field] = value;
		setTOCMedications(newMedications);
	};

	const handleAnxietyMedicationChange = (index, field, value) => {
		const newMedications = [...anxietyMedications];
		newMedications[index][field] = value;
		setAnxietyMedications(newMedications);
	};

	const [TDAHMedications, setTDAHMedications] = useState([
		{ medication: "", dose: "", frequency: "" },
	]);

	const addTDAHMedication = () => {
		setTDAHMedications([
			...TDAHMedications,
			{ medication: "", dose: "", frequency: "", isNew: true },
		]);
	};

	const handleTDAHMedicationChange = (index, field, value) => {
		const newMedications = [...TDAHMedications];
		newMedications[index][field] = value;
		setTDAHMedications(newMedications);
	};

	const [bipolarMedications, setBipolarMedications] = useState([
		{ medication: "", dose: "", frequency: "" },
	]);

	const addBipolarMedication = () => {
		setBipolarMedications([
			...bipolarMedications,
			{ medication: "", dose: "", frequency: "", isNew: true },
		]);
	};

	const handleBipolarMedicationChange = (index, field, value) => {
		const newMedications = [...bipolarMedications];
		newMedications[index][field] = value;
		setBipolarMedications(newMedications);
	};

	const [otherMedications, setOtherMedications] = useState(
		Array.isArray(medicalHistory.other.data)
			? medicalHistory.other.data.map((med, index) => ({
					...med,
					id: index,
					illness: med.illness || "",
					isNew: false,
				}))
			: [],
	);
	const addOtherMedication = () => {
		setOtherMedications([
			...otherMedications,
			{ medication: "", dose: "", frequency: "", isNew: true },
		]);
	};

	const handleOtherMedicationChange = (index, field, value) => {
		const newMedications = [...otherMedications];
		newMedications[index][field] = value;
		setOtherMedications(newMedications);
	};

	const {
		depression = {
			data: [{ medication: "", dose: "", frequency: "", ube: false }],
		},
		anxiety = {
			data: [{ medication: "", dose: "", frequency: "", ube: false }],
		},
		ocd = { data: [{ medication: "", dose: "", frequency: "", ube: false }] },
		adhd = { data: [{ medication: "", dose: "", frequency: "", ube: false }] },
		bipolar = {
			data: [{ medication: "", dose: "", frequency: "", ube: false }],
		},
		other = {
			data: [
				{ illness: "", medication: "", dose: "", frequency: "", ube: false },
			],
		},
	} = medicalHistory;

	const [depressionStatus, setDepressionStatus] = useState(
		depression.data.length > 0,
	);
	const [anxietyStatus, setAnxietyStatus] = useState(anxiety.data.length > 0);
	const [TOCStatus, setTOCStatus] = useState(ocd.data.length > 0);
	const [TDAHStatus, setTDAHStatus] = useState(adhd.data.length > 0);
	const [BipolarStatus, setBipolarStatus] = useState(bipolar.data.length > 0);
	const [OtherStatus, setOtherStatus] = useState(bipolar.data.length > 0);

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
	useEffect(() => {
		setDepressionMedications(
			depression.data.length > 0 &&
				depression.data.some((item) => item.medication)
				? depression.data.map((item) => ({
						medication: item.medication || "",
						dose: item.dose || "",
						frequency: item.frequency || "",
						isNew: false,
					}))
				: [{ medication: "", dose: "", frequency: "" }],
		);
		setDepressionStatus(
			depression.data.length > 0 &&
				depression.data.some((item) => item.medication),
		);

		setAnxietyMedications(
			anxiety.data.length > 0 && anxiety.data.some((item) => item.medication)
				? anxiety.data.map((item) => ({
						medication: item.medication || "",
						dose: item.dose || "",
						frequency: item.frequency || "",
						isNew: false,
					}))
				: [{ medication: "", dose: "", frequency: "" }],
		);
		setAnxietyStatus(
			anxiety.data.length > 0 && anxiety.data.some((item) => item.medication),
		);

		setTOCMedications(
			ocd.data.length > 0 && ocd.data.some((item) => item.medication)
				? ocd.data.map((item) => ({
						medication: item.medication || "",
						dose: item.dose || "",
						frequency: item.frequency || "",
						isNEw: false,
					}))
				: [{ medication: "", dose: "", frequency: "" }],
		);
		setTOCStatus(
			ocd.data.length > 0 && ocd.data.some((item) => item.medication),
		);

		setTDAHMedications(
			adhd.data.length > 0 && adhd.data.some((item) => item.medication)
				? adhd.data.map((item) => ({
						medication: item.medication || "",
						dose: item.dose || "",
						frequency: item.frequency || "",
						isNew: false,
					}))
				: [{ medication: "", dose: "", frequency: "" }],
		);
		setTDAHStatus(
			adhd.data.length > 0 && adhd.data.some((item) => item.medication),
		);

		setBipolarMedications(
			bipolar.data.length > 0 && bipolar.data.some((item) => item.medication)
				? bipolar.data.map((item) => ({
						medication: item.medication || "",
						dose: item.dose || "",
						frequency: item.frequency || "",
						isNew: false,
					}))
				: [{ medication: "", dose: "", frequency: "" }],
		);
		setBipolarStatus(
			bipolar.data.length > 0 && bipolar.data.some((item) => item.medication),
		);

		setOtherMedications(
			other.data.length > 0 && other.data.some((item) => item.medication)
				? other.data.map((item) => ({
						illness: item.illness || "",
						medication: item.medication || "",
						dose: item.dose || "",
						frequency: item.frequency || "",
						isNew: false,
					}))
				: [{ illness: "", medication: "", dose: "", frequency: "" }],
		);
		setOtherStatus(
			other.data.length > 0 && other.data.some((item) => item.medication),
		);
	}, [depression, anxiety, ocd, adhd, bipolar, other]);

	const isFirstTime = !(
		depression.data.length ||
		anxiety.data.length ||
		ocd.data.length
	);
	const [isEditable, setIsEditable] = useState(isFirstTime);
	let errorMessage = "";

	if (psichiatricHistoryResult.error) {
		const error = psichiatricHistoryResult.error;
		if (error) {
			console.error("Error details:", error);
			if (error.response) {
				const { status, data } = error.response;
				console.error(`Status: ${status}, Response: ${JSON.stringify(data)}`);
				if (status < 500) {
					errorMessage =
						"Ha ocurrido un error en la búsqueda, ¡Por favor vuelve a intentarlo!";
				} else {
					errorMessage = "Ha ocurrido un error interno, lo sentimos.";
				}
			} else {
				errorMessage = error;
			}
		}
	}

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
	const validateInputs = () => {
		// Validar Depresión
		if (depressionStatus) {
			for (let i = 0; i < depressionMedications.length; i++) {
				if (!depressionMedications[i].medication) {
					toast.error(
						`Por favor, ingresa el medicamento para la depresión (${i + 1}).`,
					);
					return false;
				}
				if (!depressionMedications[i].frequency) {
					toast.error(
						`Por favor, ingresa la frecuencia para la depresión (${i + 1}).`,
					);
					return false;
				}
			}
		}

		// Validar Ansiedad
		if (anxietyStatus) {
			for (let i = 0; i < anxietyMedications.length; i++) {
				if (!anxietyMedications[i].medication) {
					toast.error(
						`Por favor, ingresa el medicamento para la ansiedad (${i + 1}).`,
					);
					return false;
				}
				if (!anxietyMedications[i].frequency) {
					toast.error(
						`Por favor, ingresa la frecuencia para la ansiedad (${i + 1}).`,
					);
					return false;
				}
			}
		}

		// Validar TOC (Trastorno Obsesivo Compulsivo)
		if (TOCStatus) {
			for (let i = 0; i < TOCMedications.length; i++) {
				if (!TOCMedications[i].medication) {
					toast.error(
						`Por favor, ingresa el medicamento para el TOC (${i + 1}).`,
					);
					return false;
				}
				if (!TOCMedications[i].frequency) {
					toast.error(
						`Por favor, ingresa la frecuencia para el TOC (${i + 1}).`,
					);
					return false;
				}
			}
		}

		// Validar TDAH (Trastorno por Déficit de Atención e Hiperactividad)
		if (TDAHStatus) {
			for (let i = 0; i < TDAHMedications.length; i++) {
				if (!TDAHMedications[i].medication) {
					toast.error(
						`Por favor, ingresa el medicamento para el TDAH (${i + 1}).`,
					);
					return false;
				}
				if (!TDAHMedications[i].frequency) {
					toast.error(
						`Por favor, ingresa la frecuencia para el TDAH (${i + 1}).`,
					);
					return false;
				}
			}
		}

		// Validar Trastorno Bipolar
		if (BipolarStatus) {
			for (let i = 0; i < bipolarMedications.length; i++) {
				if (!bipolarMedications[i].medication) {
					toast.error(
						`Por favor, ingresa el medicamento para el trastorno bipolar (${i + 1}).`,
					);
					return false;
				}
				if (!bipolarMedications[i].frequency) {
					toast.error(
						`Por favor, ingresa la frecuencia para el trastorno bipolar (${i + 1}).`,
					);
					return false;
				}
			}
		}

		// Validar Otros
		if (OtherStatus) {
			const anyEmptyIllness = otherMedications.some(
				(med) => !med.illness.trim(),
			); // Verifica si alguna entrada está vacía
			if (anyEmptyIllness) {
				toast.error("Por favor, ingresa la condición en Otros.");
				return false;
			}
			for (let i = 0; i < otherMedications.length; i++) {
				if (!otherMedications[i].medication) {
					toast.error(
						`Por favor, ingresa el medicamento para la condición en Otros (${i + 1}).`,
					);
					return false;
				}
				if (!otherMedications[i].frequency) {
					toast.error(
						`Por favor, ingresa la frecuencia para la condición en Otros (${i + 1}).`,
					);
					return false;
				}
			}
		}

		// Si todas las validaciones pasan, retornar true
		return true;
	};

	// Save the new Allergic record to the database
	// biome-ignore  lint/complexity/noExcessiveCognitiveComplexity: It's the function to update the arrays and objects in JSON.
	const handleSaveNewHistory = async () => {
		// Validación de entradas antes de intentar guardar
		if (!validateInputs()) return;

		// Mostrar mensaje de carga
		const isUpdating = isEditable; // Determina si se está actualizando
		toast.info(
			isUpdating
				? "Actualizando antecedentes psiquiátricos..."
				: "Guardando antecedentes psiquiátricos...",
		);

		// Construir el objeto newHistoryData usando los estados actuales
		const newHistoryData = {
			depression: {
				version: medicalHistory.depression.version || 1,
				data: depressionMedications.map((medication) => ({
					medication: medication.medication,
					dose: medication.dose,
					frequency: medication.frequency,
					ube: depressionUBE,
				})),
			},
			anxiety: {
				version: medicalHistory.anxiety.version || 1,
				data: anxietyMedications.map((medication) => ({
					medication: medication.medication,
					dose: medication.dose,
					frequency: medication.frequency,
					ube: anxietyUBE,
				})),
			},
			ocd: {
				version: medicalHistory.ocd.version || 1,
				data: TOCMedications.map((medication) => ({
					medication: medication.medication,
					dose: medication.dose,
					frequency: medication.frequency,
					ube: TOCUBE,
				})),
			},
			adhd: {
				version: medicalHistory.adhd.version || 1,
				data: TDAHMedications.map((medication) => ({
					medication: medication.medication,
					dose: medication.dose,
					frequency: medication.frequency,
					ube: TDAHUBE,
				})),
			},
			bipolar: {
				version: medicalHistory.bipolar.version || 1,
				data: bipolarMedications.map((medication) => ({
					medication: medication.medication,
					dose: medication.dose,
					frequency: medication.frequency,
					ube: bipolarUBE,
				})),
			},
			other: {
				version: medicalHistory.other.version || 1,
				data: otherMedications.map((medication) => ({
					illness: medication.illness,
					medication: medication.medication,
					dose: medication.dose,
					frequency: medication.frequency,
					ube: otherUBE,
				})),
			},
		};

		try {
			const result = await updatePsichiatricHistory(id, newHistoryData);
			if (!result.error) {
				toast.success(
					isUpdating
						? "Antecedente psiquiátrico actualizado con éxito."
						: "Antecedente psiquiátrico guardado con éxito.",
				); // Mensaje de éxito
				setIsEditable(false);
				triggerReload();
			} else {
				toast.error(`Error al guardar los antecedentes: ${result.error}`); // Mensaje de error
			}
		} catch (error) {
			toast.error(`Error en la operación: ${error.message}`); // Mensaje de error
		}
	};

	const [depressionUBE, setDepressionUBE] = useState(
		depression.data.length > 0 && depression.data[0].ube != null
			? depression.data[0].ube
			: false,
	);

	const [anxietyUBE, setAnxietyUBE] = useState(
		anxiety.data.length > 0 && anxiety.data[0].ube != null
			? anxiety.data[0].ube
			: false,
	);

	const [TOCUBE, setTOCUBE] = useState(
		ocd.data.length > 0 && ocd.data[0].ube != null ? ocd.data[0].ube : false,
	);

	const [TDAHUBE, setTDAHUBE] = useState(
		adhd.data.length > 0 && adhd.data[0].ube != null ? adhd.data[0].ube : false,
	);

	const [bipolarUBE, setBipolarUBE] = useState(
		bipolar.data.length > 0 && bipolar.data[0].ube != null
			? bipolar.data[0].ube
			: false,
	);

	const [_otherIllness, setOtherIllness] = useState(
		other.data.length > 0 && other.data[0].illness != null
			? other.data[0].illness
			: "",
	);

	const [otherUBE, setOtherUBE] = useState(
		other.data.length > 0 && other.data[0].ube != null
			? other.data[0].ube
			: false,
	);

	const [originalDepressionMedications, setOriginalDepressionMedications] =
		useState([]);
	const [originalAnxietyMedications, setOriginalAnxietyMedications] = useState(
		[],
	);
	const [originalTOCMedications, setOriginalTOCMedications] = useState([]);
	const [originalTDAHMedications, setOriginalTDAHMedications] = useState([]);
	const [originalBipolarMedications, setOriginalBipolarMedications] = useState(
		[],
	);
	const [originalOtherMedications, setOriginalOtherMedications] = useState([]);
	const [originalDepressionUBE, setOriginalDepressionUBE] = useState(false);
	const [originalAnxietyUBE, setOriginalAnxietyUBE] = useState(false);
	const [originalTOCUBE, setOriginalTOCUBE] = useState(false);
	const [originalTDAHUBE, setOriginalTDAHUBE] = useState(false);
	const [originalBipolarUBE, setOriginalBipolarUBE] = useState(false);
	const [originalOtherUBE, setOriginalOtherUBE] = useState(false);
	const [originalOtherIllness, setOriginalOtherIllness] = useState("");

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
	useEffect(() => {
		if (!isFirstTime) {
			// Guardar los medicamentos para Depresión
			const initialDepressionMedications = depression.data.map((item) => ({
				medication: item.medication || "",
				dose: item.dose || "",
				frequency: item.frequency || "",
			}));
			if (
				JSON.stringify(initialDepressionMedications) !==
				JSON.stringify(originalDepressionMedications)
			) {
				setDepressionMedications(initialDepressionMedications);
				setOriginalDepressionMedications(
					JSON.parse(JSON.stringify(initialDepressionMedications)),
				);
			}

			// Guardar los medicamentos para Ansiedad
			const initialAnxietyMedications = anxiety.data.map((item) => ({
				medication: item.medication || "",
				dose: item.dose || "",
				frequency: item.frequency || "",
			}));
			if (
				JSON.stringify(initialAnxietyMedications) !==
				JSON.stringify(originalAnxietyMedications)
			) {
				setAnxietyMedications(initialAnxietyMedications);
				setOriginalAnxietyMedications(
					JSON.parse(JSON.stringify(initialAnxietyMedications)),
				);
			}

			// Guardar los medicamentos para TOC
			const initialTOCMedications = ocd.data.map((item) => ({
				medication: item.medication || "",
				dose: item.dose || "",
				frequency: item.frequency || "",
			}));
			if (
				JSON.stringify(initialTOCMedications) !==
				JSON.stringify(originalTOCMedications)
			) {
				setTOCMedications(initialTOCMedications);
				setOriginalTOCMedications(
					JSON.parse(JSON.stringify(initialTOCMedications)),
				);
			}

			// Guardar los medicamentos para TDAH
			const initialTDAHMedications = adhd.data.map((item) => ({
				medication: item.medication || "",
				dose: item.dose || "",
				frequency: item.frequency || "",
			}));
			if (
				JSON.stringify(initialTDAHMedications) !==
				JSON.stringify(originalTDAHMedications)
			) {
				setTDAHMedications(initialTDAHMedications);
				setOriginalTDAHMedications(
					JSON.parse(JSON.stringify(initialTDAHMedications)),
				);
			}

			// Guardar los medicamentos para Trastorno Bipolar
			const initialBipolarMedications = bipolar.data.map((item) => ({
				medication: item.medication || "",
				dose: item.dose || "",
				frequency: item.frequency || "",
			}));
			if (
				JSON.stringify(initialBipolarMedications) !==
				JSON.stringify(originalBipolarMedications)
			) {
				setBipolarMedications(initialBipolarMedications);
				setOriginalBipolarMedications(
					JSON.parse(JSON.stringify(initialBipolarMedications)),
				);
			}

			// Guardar los medicamentos para Otros
			const initialOtherMedications = other.data.map((item) => ({
				illness: item.illness || "",
				medication: item.medication || "",
				dose: item.dose || "",
				frequency: item.frequency || "",
			}));
			if (
				JSON.stringify(initialOtherMedications) !==
				JSON.stringify(originalOtherMedications)
			) {
				setOtherMedications(initialOtherMedications);
				setOriginalOtherMedications(
					JSON.parse(JSON.stringify(initialOtherMedications)),
				);
			}

			// Guardar las opciones UBE para Depresión
			if (depression.data[0].ube !== originalDepressionUBE) {
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setDepressionUBE(depression.data[0].ube || false);
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setOriginalDepressionUBE(depression.data[0].ube || false);
			}

			// Guardar las opciones UBE para Ansiedad
			if (anxiety.data[0].ube !== originalAnxietyUBE) {
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setAnxietyUBE(anxiety.data[0].ube || false);
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setOriginalAnxietyUBE(anxiety.data[0].ube || false);
			}

			// Guardar las opciones UBE para TOC
			if (ocd.data[0].ube !== originalTOCUBE) {
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setTOCUBE(ocd.data[0].ube || false);
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setOriginalTOCUBE(ocd.data[0].ube || false);
			}

			// Guardar las opciones UBE para TDAH
			if (adhd.data[0].ube !== originalTDAHUBE) {
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setTDAHUBE(adhd.data[0].ube || false);
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setOriginalTDAHUBE(adhd.data[0].ube || false);
			}

			// Guardar las opciones UBE para Trastorno Bipolar
			if (bipolar.data[0].ube !== originalBipolarUBE) {
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setBipolarUBE(bipolar.data[0].ube || false);
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setOriginalBipolarUBE(bipolar.data[0].ube || false);
			}

			// Guardar las opciones UBE para Otros
			if (other.data[0].ube !== originalOtherUBE) {
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setOtherUBE(other.data[0].ube || false);
				// biome-ignore lint/complexity/useSimplifiedLogicExpression: Ignoring simplified logic suggestion for this line
				setOriginalOtherUBE(other.data[0].ube || false);
			}

			// Guardar la condición en Otros
			if (other.data[0].illness !== originalOtherIllness) {
				setOtherIllness(other.data[0].illness || "");

				setOriginalOtherIllness(other.data[0].illness || "");
			}
		}
	}, [
		depression.data,
		anxiety.data,
		ocd.data,
		adhd.data,
		bipolar.data,
		other.data,
		originalAnxietyMedications,
		originalBipolarMedications,
		originalOtherIllness,
		originalTOCUBE,
		originalTOCMedications,
		originalTDAHUBE,
		originalTDAHMedications,
		originalOtherUBE,
		originalDepressionUBE,
		originalAnxietyUBE,
		originalBipolarUBE,
		originalDepressionMedications,
		originalOtherMedications,
		isFirstTime,
	]);

	const handleCancel = () => {
		// Restaurar los valores originales desde los estados guardados
		setDepressionMedications(
			JSON.parse(JSON.stringify(originalDepressionMedications)),
		);
		setAnxietyMedications(
			JSON.parse(JSON.stringify(originalAnxietyMedications)),
		);
		setTOCMedications(JSON.parse(JSON.stringify(originalTOCMedications)));
		setTDAHMedications(JSON.parse(JSON.stringify(originalTDAHMedications)));
		setBipolarMedications(
			JSON.parse(JSON.stringify(originalBipolarMedications)),
		);
		setOtherMedications(JSON.parse(JSON.stringify(originalOtherMedications)));

		setDepressionUBE(originalDepressionUBE);
		setAnxietyUBE(originalAnxietyUBE);
		setTOCUBE(originalTOCUBE);
		setTDAHUBE(originalTDAHUBE);
		setBipolarUBE(originalBipolarUBE);
		setOtherUBE(originalOtherUBE);

		setOtherIllness(originalOtherIllness);

		// Salir del modo de edición
		setIsEditable(false);
		toast.info("Edición cancelada.");
	};

	const handleDepressionChange = (newStatus) => {
		setDepressionStatus(newStatus);
		if (!newStatus) {
			setDepressionMedications([{ medication: "", dose: "", frequency: "" }]); // Limpiar todos los medicamentos
			setDepressionUBE(false); // Limpiar UBE
		}
	};

	const handleAnxietyChange = (newStatus) => {
		setAnxietyStatus(newStatus);
		if (!newStatus) {
			setAnxietyMedications([{ medication: "", dose: "", frequency: "" }]); // Limpiar todos los medicamentos
			setAnxietyUBE(false); // Limpiar UBE
		}
	};

	const handleTOCChange = (newStatus) => {
		setTOCStatus(newStatus);
		if (!newStatus) {
			setTOCMedications([{ medication: "", dose: "", frequency: "" }]); // Limpiar todos los medicamentos
			setTOCUBE(false); // Limpiar UBE
		}
	};

	const handleTDAHChange = (newStatus) => {
		setTDAHStatus(newStatus);
		if (!newStatus) {
			setTDAHMedications([{ medication: "", dose: "", frequency: "" }]); // Limpiar todos los medicamentos
			setTDAHUBE(false); // Limpiar UBE
		}
	};

	const handleBipolarChange = (newStatus) => {
		setBipolarStatus(newStatus);
		if (!newStatus) {
			setBipolarMedications([{ medication: "", dose: "", frequency: "" }]); // Limpiar todos los medicamentos
			setBipolarUBE(false); // Limpiar UBE
		}
	};

	const handleOtherChange = (newStatus) => {
		setOtherStatus(newStatus);
		if (!newStatus) {
			setOtherMedications([
				{ illness: "", medication: "", dose: "", frequency: "" },
			]); // Limpiar todos los medicamentos y la condición
			setOtherUBE(false); // Limpiar UBE
			setOtherIllness(""); // Limpiar la condición
		}
	};

	const sections = {
		depression: {
			label: "¿Tiene depresión?",
			medications: depressionMedications,
			setMedications: setDepressionMedications,
			status: depressionStatus,
			setStatus: setDepressionStatus,
			UBE: depressionUBE,
			setUBE: setDepressionUBE,
			handleMedicationChange: handleDepressionMedicationChange,
			addMedication: addDepressionMedication,
			removeLastMedication: removeLastDepressionMedication,
			handleStatusChange: handleDepressionChange,
		},
		anxiety: {
			label: "¿Tiene ansiedad?",
			medications: anxietyMedications,
			setMedications: setAnxietyMedications,
			status: anxietyStatus,
			setStatus: setAnxietyStatus,
			UBE: anxietyUBE,
			setUBE: setAnxietyUBE,
			handleMedicationChange: handleAnxietyMedicationChange,
			addMedication: addAnxietyMedication,
			removeLastMedication: removeLastAnxietyMedication,
			handleStatusChange: handleAnxietyChange,
		},
		toc: {
			label: "¿Tiene TOC (Trastorno Obsesivo Compulsivo)?",
			medications: TOCMedications,
			setMedications: setTOCMedications,
			status: TOCStatus,
			setStatus: setTOCStatus,
			UBE: TOCUBE,
			setUBE: setTOCUBE,
			handleMedicationChange: handleTOCMedicationChange,
			addMedication: addTOCMedication,
			removeLastMedication: removeLastTOCMedication,
			handleStatusChange: handleTOCChange,
		},
		tdah: {
			label: "¿Tiene TDAH (Trastorno por Déficit de Atención e Hiperactivida)?",
			medications: TDAHMedications,
			setMedications: setTDAHMedications,
			status: TDAHStatus,
			setStatus: setTDAHStatus,
			UBE: TDAHUBE,
			setUBE: setTDAHUBE,
			handleMedicationChange: handleTDAHMedicationChange,
			addMedication: addTDAHMedication,
			removeLastMedication: removeLastTDAHMedication,
			handleStatusChange: handleTDAHChange,
		},
		bipolar: {
			label: "¿Tiene Trastorno Bipolar?",
			medications: bipolarMedications,
			setMedications: setBipolarMedications,
			status: BipolarStatus,
			setStatus: setBipolarStatus,
			UBE: bipolarUBE,
			setUBE: setBipolarUBE,
			handleMedicationChange: handleBipolarMedicationChange,
			addMedication: addBipolarMedication,
			removeLastMedication: removeLastBipolarMedication,
			handleStatusChange: handleBipolarChange,
		},
		other: {
			label: "¿Tiene otra condición?",
			medications: otherMedications,
			setMedications: setOtherMedications,
			status: OtherStatus,
			setStatus: setOtherStatus,
			UBE: otherUBE,
			setUBE: setOtherUBE,
			handleMedicationChange: handleOtherMedicationChange,
			addMedication: addOtherMedication,
			removeLastMedication: removeLastOtherMedication,
			handleStatusChange: handleOtherChange,
		},
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
									paddingTop: "1rem",
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

						{Object.entries(sections).map(([key, section]) => (
							<div
								key={key}
								style={{
									borderBottom: `0.1rem solid ${colors.darkerGrey}`,
									padding: "0 0 2rem 1rem",
									display: "flex",
									flexDirection: "column",
									justifyContent: "space-between",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "start",
										flexDirection: "column",
									}}
								>
									<div
										style={{
											display: "flex",
											flexDirection: "row",
											justifyContent: "space-between",
											width: "100%",
										}}
									>
										<div
											style={{
												display: "flex",
												alignItems: "start",
												flexDirection: "column",
											}}
										>
											<p
												style={{
													paddingBottom: "0.7rem",
													paddingTop: "2rem",
													fontFamily: fonts.textFont,
													fontSize: fontSize.textSize,
												}}
											>
												{section.label}
											</p>
											<div
												style={{
													display: "flex",
													gap: "1rem",
													alignItems: "center",
													paddingLeft: "0.5rem",
													paddingBottom: "0.5rem",
												}}
											>
												<RadioInput
													name={key}
													checked={section.status}
													onChange={() => section.handleStatusChange(true)}
													label="Sí"
													style={{
														label: {
															fontFamily: fonts.textFont,
															fontSize: fontSize.textSize,
														},
													}}
													disabled={!isEditable}
												/>
												<RadioInput
													name={key}
													checked={!section.status}
													onChange={() => section.handleStatusChange(false)}
													label="No"
													style={{
														label: {
															fontFamily: fonts.textFont,
															fontSize: fontSize.textSize,
														},
													}}
													disabled={!isEditable}
												/>
											</div>
										</div>

										{key === "depression" && (
											<div
												style={{
													display: "flex",
													justifyContent: "flex-end",
												}}
											>
												{!isFirstTime &&
													(isEditable ? (
														<div style={{ display: "flex", gap: "1rem" }}>
															<IconButton
																icon={CheckIcon}
																onClick={handleSaveNewHistory}
															/>
															<IconButton
																icon={CancelIcon}
																onClick={handleCancel}
															/>
														</div>
													) : (
														<IconButton
															icon={EditIcon}
															onClick={() => setIsEditable(true)}
														/>
													))}
											</div>
										)}
									</div>
								</div>

								{section.status && (
									<div
										style={{
											paddingLeft: "0.5rem",
										}}
									>
										{section.medications.map((medication, index) => (
											<div
												key={`${medication.name}-${index}`}
												style={{ marginBottom: "1rem" }}
											>
												{key === "other" && (
													<div>
														<div
															style={{
																padding: "1rem",
																borderBottom: `0.04rem  solid ${colors.darkerGrey}`,
															}}
														/>
														<p
															style={{
																paddingTop: "1.5rem",
																paddingBottom: "0.5rem",
																fontFamily: fonts.textFont,
																fontSize: fontSize.textSize,
															}}
														>
															¿Cuál es la condición?
														</p>
														<BaseInput
															value={medication.illness}
															onChange={(e) => {
																const newIllness = e.target.value;
																setOtherMedications((current) =>
																	current.map((item, idx) =>
																		idx === index
																			? { ...item, illness: newIllness }
																			: item,
																	),
																);
															}}
															placeholder="Ingrese información adicional"
															style={{
																width: "90%",
																height: "3rem",
																fontFamily: fonts.textFont,
																fontSize: "1rem",
															}}
															disabled={!isEditable}
														/>
													</div>
												)}
												<div
													style={{
														padding: "1rem",
														borderBottom: `0.04rem  solid ${colors.darkerGrey}`,
													}}
												/>
												<p
													style={{
														paddingBottom: "0.5rem",
														paddingTop: "2rem",
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
														fontWeight: "bold",
													}}
												>
													Medicamento {index + 1}:
												</p>
												<BaseInput
													value={medication.medication}
													onChange={(e) =>
														section.handleMedicationChange(
															index,
															"medication",
															e.target.value,
														)
													}
													placeholder="Ingrese el medicamento administrado (terapia entra en la categoría)"
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
													Dosis {index + 1}:
												</p>
												<BaseInput
													value={medication.dose}
													onChange={(e) =>
														section.handleMedicationChange(
															index,
															"dose",
															e.target.value,
														)
													}
													placeholder="Ingrese cuánto (opcional)"
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
													Frecuencia {index + 1}:
												</p>
												<BaseInput
													value={medication.frequency}
													onChange={(e) =>
														section.handleMedicationChange(
															index,
															"frequency",
															e.target.value,
														)
													}
													placeholder="Ingrese cada cuánto administra el medicamento"
													style={{
														width: "90%",
														height: "3rem",
														fontFamily: fonts.textFont,
														fontSize: "1rem",
													}}
													disabled={!isEditable}
												/>
											</div>
										))}
										<p
											style={{
												paddingBottom: "0.5rem",
												paddingTop: "1rem",
												fontFamily: fonts.textFont,
												fontSize: fontSize.textSize,
											}}
										>
											¿Tiene seguimiento en UBE?
										</p>
										<div
											style={{
												display: "flex",
												gap: "1rem",
												alignItems: "center",
												paddingLeft: "0.5rem",
												paddingBottom: "2rem",
											}}
										>
											<RadioInput
												label="Si"
												name="ube"
												checked={section.UBE === true}
												onChange={() => section.setUBE(true)}
												style={{
													label: {
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
													},
												}}
												disabled={!isEditable}
											/>
											<RadioInput
												label="No"
												name="ube"
												checked={section.UBE === false}
												onChange={() => section.setUBE(false)}
												style={{
													label: {
														fontFamily: fonts.textFont,
														fontSize: fontSize.textSize,
													},
												}}
												disabled={!isEditable}
											/>
										</div>

										{isEditable && (
											<div
												style={{
													borderTop: `0.1rem solid ${colors.darkerGrey}`,
													paddingTop: "2rem",
													display: "flex",
													justifyContent: "center",
												}}
											>
												<BaseButton
													text="Agregar otro medicamento"
													onClick={section.addMedication}
													style={{
														width: "20%",
														height: "3rem",
														border: `1.5px solid ${colors.primaryBackground}`,
													}}
												/>

												<div style={{ width: "1rem" }} />
												{section.medications.length > 1 &&
													section.medications.some((med) => med.isNew) && (
														<BaseButton
															text="Cancelar Medicamento"
															onClick={section.removeLastMedication}
															style={{
																width: "20%",
																height: "3rem",
																backgroundColor: colors.secondaryBackground,
																color: colors.primaryBackground,
																border: `1.5px solid ${colors.primaryBackground}`,
															}}
														/>
													)}
											</div>
										)}
									</div>
								)}
							</div>
						))}

						{isFirstTime && (
							<div
								style={{
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									paddingTop: "2rem",
								}}
							>
								<BaseButton
									text="Guardar"
									onClick={handleSaveNewHistory}
									style={{ width: "30%", height: "3rem" }}
								/>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
