import logoutIcon from "@tabler/icons/outline/door-exit.svg";
import exportIcon from "@tabler/icons/outline/database-export.svg";
import { Suspense, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BorderDecoLower from "src/assets/images/BorderDecoLower.png";
import BorderDecoUpper from "src/assets/images/BorderDecoUpper.png";
import SanitasLogo from "src/assets/images/logoSanitas.png";
import BaseButton from "src/components/Button/Base/index";
import IconButton from "src/components/Button/Icon";
import DropdownMenu from "src/components/DropdownMenu";
import { SearchInput } from "src/components/Input";
import PatientCard from "src/components/PatientCard";
import Throbber from "src/components/Throbber";
import { NAV_PATHS } from "src/router";
import { colors, fonts } from "src/theme.mjs";
import { adjustHeight, adjustWidth } from "src/utils/measureScaling";
import WrapPromise from "src/utils/promiseWrapper";
import useWindowSize from "src/utils/useWindowSize";

/**
 * @typedef {Object} PatientPreview
 * @property {string} id
 * @property {string} names
 */

/**
 * @typedef {Object} SearchPatientViewProps
 * @property {import("src/dataLayer.mjs").SearchPatientApiFunction} searchPatientsApiCall
 * @property {import("src/dataLayer.mjs").GetLinkedPatientCallback} getLinkedPatient
 * @property {import("src/dataLayer.mjs").GetRoleCallback} getRole
 * @property {import("src/store.mjs").UseStoreHook} useStore
 * @property {import("src/cognito.mjs").CognitoLogoutUserCallback} logoutUser
 */

/**
 * @param {SearchPatientViewProps} props
 */
export default function SearchPatientView({
	searchPatientsApiCall,
	useStore,
	logoutUser,
	getRole,
	getLinkedPatient,
}) {
	const resourceA = useMemo(() => WrapPromise(getRole()), [getRole]);
	const resourceB = useMemo(
		() => WrapPromise(getLinkedPatient()),
		[getLinkedPatient],
	);

	const Child = () => {
		const navigate = useNavigate();
		const { query, type } = useStore((store) => store.searchQuery);
		const setSearchQuery = useStore((store) => store.setSearchQuery);
		const setSelectedPatientId = useStore((s) => s.setSelectedPatientId);
		const [queryReturnedEmpty, setQueryReturnedEmpty] = useState(false);
		const [error, setError] = useState("");
		const [searchTypeWasCUI, setSearchTypeWasCUI] = useState(false);
		const [defaultView, setDefaultView] = useState(true);
		const [patientsResources, setPatientsResources] = useState(null);
		const { width, height } = useWindowSize();
		const resultA = resourceA.read();

		const showErrorMessage = (message) => setError(`ERROR: ${message}`);
		const hideErrorMessage = () => setError("");
		const emptyQuery = query.trim().length <= 0;

		const handleError = (message, redirectPath) => {
			setError(`ERROR: ${message}`);
			setTimeout(() => {
				navigate(redirectPath, { replace: true });
			}, 2000);
		};

		const handleResultAError = () => {
			if (resultA.error) {
				handleError("Internal error occurred", NAV_PATHS.LOGIN_USER);
				return true;
			}
			return false;
		};

		const handleResultBError = (resultB) => {
			if (resultB.error) {
				handleError("Internal error occurred", NAV_PATHS.PATIENT_WELCOME);
				return true;
			}
			return false;
		};

		const handleDataExport = () => {
			navigate(NAV_PATHS.EXPORT_DATA);
		};

		const handlePatientResult = () => {
			if (resultA.result === "PATIENT") {
				const resultB = resourceB.read();
				if (handleResultBError(resultB)) return;

				const { linkedPatientId } = resultB.result;
				if (!linkedPatientId) {
					navigate(NAV_PATHS.PATIENT_WELCOME, { replace: true });
				} else {
					setSelectedPatientId(linkedPatientId);
					navigate(NAV_PATHS.PATIENT_FORM, { replace: true });
				}
			}
		};

		// Call error handler if needed
		if (handleResultAError()) return;

		// Further processing for result A if no errors
		handlePatientResult();

		const dropdownOptions = [
			{ value: "Carnet", label: "Carnet Estudiante" },
			{ value: "NumeroColaborador", label: "Código Colaborador" },
			{ value: "Nombres", label: "Nombres y Apellidos" },
			{ value: "CUI", label: "CUI" },
		];

		const handleInputChange = (e) => {
			let value = e.target.value;
			if (type === "Nombres") {
				value = value.replace(/\d/g, "");
			} else if (type !== "Nombres") {
				value = value.replace(/\D/g, "");
			}

			if (type === "CUI") {
				value = value.slice(0, 13);
			}
			setSearchQuery(value, type);
		};

		/**
		 * Handles the search button click event by performing a patient search based on the query and type.
		 * It makes an API call, processes the result, and updates the state based on the response.
		 * It also handles error states by displaying appropriate error messages.
		 *
		 * @async
		 * @function searchBtnClick
		 * @returns {Promise<void>} Executes asynchronous operations related to the search functionality.
		 */
		const searchBtnClick = async () => {
			hideErrorMessage();
			if (emptyQuery) {
				showErrorMessage("¡Por favor ingrese algo para buscar!");
				return;
			}

			setPatientsResources(null);
			setQueryReturnedEmpty(false);
			setSearchTypeWasCUI(type === "CUI");

			const wrappedPatientsData = WrapPromise(
				searchPatientsApiCall(query, type),
			);
			setPatientsResources(wrappedPatientsData);
		};

		/**
		 * @param {number} id - The ID of the selected patient.
		 */
		const genViewPatientBtnClick = (id) => {
			return () => {
				setSelectedPatientId(id);
				navigate(NAV_PATHS.UPDATE_PATIENT);
			};
		};

		const onAddNewPatientClick = () => {
			navigate(NAV_PATHS.ADD_PATIENT, { state: { cui: query } });
		};

		return (
			<div
				style={{
					backgroundColor: "#0F6838",
					height: "100vh",
					width: "100vw",
					padding: "2rem",
				}}
			>
				<div
					style={{
						backgroundColor: "#FFFFFF",
						width: "100%",
						height: "100%",
						overflow: "auto",
					}}
				>
					{defaultView ? (
						<div
							style={{
								position: "relative",
								display: "grid",
								height: "100%",
							}}
						>
							<img
								style={{
									width: adjustWidth(width, "25.43rem"),
									height: "auto",
									position: "absolute",
									top: 0,
									left: 0,
								}}
								src={BorderDecoUpper}
								alt="Borde decorativo superior"
							/>
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									alignItems: "center",
									width: "100%",
								}}
							>
								<img
									style={{
										width: adjustWidth(width, "16rem"),
										height: "auto",
									}}
									src={SanitasLogo}
									alt="Logo Sanitas"
								/>
								<h1
									style={{
										fontSize: adjustWidth(width, "3rem"),
										paddingBottom: adjustHeight(height, "0.5rem"),
										color: colors.titleText,
									}}
								>
									Búsqueda de Pacientes
								</h1>
								<h3
									style={{
										fontSize: adjustWidth(width, "1.75rem"),
										fontFamily: "Lora, serif",
										fontWeight: "normal",
										paddingBottom: adjustHeight(height, "2rem"),
										textAlign: "center",
									}}
								>
									Ingresa carnet, código o nombre
								</h3>

								<div
									style={{
										width: adjustWidth(width, "40rem"),
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										justifyContent: "center",
										gap: adjustHeight(height, "0.5rem"),
									}}
								>
									<SearchInput
										type="text"
										value={query}
										onChange={handleInputChange}
										placeholder="Ingrese su búsqueda..."
										style={{
											input: {
												height: adjustHeight(height, "2rem"),
												fontSize: adjustWidth(width, "1.10rem"),
											},
										}}
									/>

									<div
										style={{
											display: "flex",
											flexDirection: "row",
											alignItems: "center",
											justifyContent: "space-evenly",
											paddingTop: adjustHeight(height, "1rem"),
											gap: adjustHeight(height, "2rem"),
										}}
									>
										<DropdownMenu
											value={type}
											onChange={(e) => setSearchQuery(query, e.target.value)}
											options={dropdownOptions}
											style={{
												select: {
													fontSize: adjustWidth(width, "1.10rem"),
												},
												container: {
													width: adjustWidth(width, "15rem"),
												},
											}}
										/>

										<BaseButton
											text="Buscar Paciente"
											onClick={async () => {
												setDefaultView(!defaultView);
												await searchBtnClick();
											}}
											disabled={emptyQuery}
											style={{
												fontSize: adjustWidth(width, "1.10rem"),
												height: "3rem",
												width: adjustWidth(width, "15rem"),
											}}
										/>
									</div>
								</div>
							</div>
							<div
								style={{
									position: "absolute",
									top: "2rem",
									right: "2rem",
									display: "flex",
								}}
							>
								<IconButton icon={exportIcon} onClick={handleDataExport} />
								<IconButton
									icon={logoutIcon}
									onClick={() => {
										logoutUser();
										navigate(NAV_PATHS.LOGIN_USER, { replace: true });
									}}
								/>
							</div>
							<img
								style={{
									width: adjustWidth(width, "25.43rem"),
									height: "auto",
									position: "absolute",
									bottom: 0,
									right: 0,
								}}
								src={BorderDecoLower}
								alt="Borde decorativo inferior"
							/>
						</div>
					) : (
						<div
							style={{
								display: "flex",
							}}
						>
							<div
								style={{
									width: adjustWidth(width, "17rem"),
								}}
							>
								<img
									style={{
										width: adjustWidth(width, "15rem"),
										height: "auto",
										paddingTop: adjustHeight(height, "2rem"),
										paddingLeft: adjustWidth(width, "2rem"),
									}}
									src={SanitasLogo}
									alt="Logo Sanitas"
								/>
							</div>
							<div
								style={{
									width: "100%",
									display: "flex",
									flexDirection: "column",
									paddingTop: adjustHeight(height, "4.25rem"),
									paddingLeft: adjustWidth(width, "2rem"),
									paddingRight: adjustWidth(width, "2rem"),
									paddingBottom: adjustHeight(height, "2rem"),
								}}
							>
								<div
									style={{
										display: "flex",
										flexDirection: "row",
										alignItems: "center",
										gap: adjustHeight(height, "2rem"),
										width: "100%",
									}}
								>
									<div
										style={{
											width: "66%",
										}}
									>
										<SearchInput
											type="text"
											value={query}
											onChange={handleInputChange}
											placeholder="Ingrese su búsqueda..."
											style={{
												input: {
													height: adjustHeight(height, "2rem"),
													fontSize: adjustWidth(width, "1.10rem"),
												},
											}}
										/>
									</div>

									<DropdownMenu
										value={type}
										onChange={(e) => setSearchQuery(query, e.target.value)}
										options={dropdownOptions}
										style={{
											select: {
												fontSize: adjustWidth(width, "1.10rem"),
											},
											container: {
												width: adjustWidth(width, "15rem"),
											},
										}}
									/>
									<BaseButton
										text="Buscar Paciente"
										onClick={async () => {
											await searchBtnClick();
										}}
										disabled={emptyQuery}
										style={{
											fontSize: adjustWidth(width, "1.10rem"),
											height: "3rem",
											width: adjustWidth(width, "14rem"),
										}}
									/>
								</div>
								<div style={{ height: "100%" }}>
									<h1
										style={{
											fontSize: adjustWidth(width, "2rem"),
											paddingBottom: adjustHeight(height, "2rem"),
											paddingTop: adjustHeight(height, "2rem"),
											color: colors.titleText,
										}}
									>
										Resultados de la Búsqueda
									</h1>
									{!searchTypeWasCUI &&
										queryReturnedEmpty &&
										patientsResources && (
											<div
												style={{
													width: "100%",
													height: "100%",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													flexDirection: "column",
													paddingBottom: adjustHeight(height, "7rem"),
												}}
											>
												<div
													style={{
														width: adjustWidth(width, "28rem"),
														height: "auto",
														padding: adjustWidth(width, "1rem"),
														borderRadius: adjustWidth(width, "1rem"),
														gap: adjustHeight(height, "1rem"),
													}}
												>
													<p
														style={{
															color: colors.textPrimary,
															fontSize: adjustWidth(width, "1.75rem"),
															textAlign: "center",
															fontFamily: fonts.textFont,
														}}
													>
														¡Parece que el paciente no existe!
													</p>
													<p
														style={{
															color: colors.textPrimary,
															fontSize: adjustWidth(width, "1.75rem"),
															textAlign: "center",
															fontFamily: fonts.textFont,
															fontWeight: "bold",
														}}
													>
														Prueba buscarlo por CUI.
													</p>
												</div>
											</div>
										)}

									{queryReturnedEmpty &&
										searchTypeWasCUI &&
										patientsResources && (
											<div
												style={{
													width: "100%",
													height: "100%",
													display: "flex",
													alignItems: "center",
													justifyContent: "center",
													flexDirection: "column",
													paddingBottom: adjustHeight(height, "7rem"),
												}}
											>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														flexDirection: "column",
														width: adjustWidth(width, "33rem"),
														height: "90%",
														borderRadius: adjustWidth(width, "1rem"),
														gap: adjustHeight(height, "0.5rem"),
													}}
												>
													<p
														style={{
															color: colors.textPrimary,
															fontSize: adjustWidth(width, "1.75rem"),
															textAlign: "center",
															fontFamily: fonts.textFont,
														}}
													>
														¡Parece que el paciente no existe!
													</p>
													<p
														style={{
															color: colors.textPrimary,
															fontSize: adjustWidth(width, "1.75rem"),
															textAlign: "center",
															fontFamily: fonts.textFont,
															paddingBottom: adjustHeight(height, "2rem"),
														}}
													>
														Ingresa la información del paciente aquí.
													</p>
													<BaseButton
														text="Ingresar la información del paciente."
														onClick={onAddNewPatientClick}
														style={{
															fontSize: adjustWidth(width, "1.10rem"),
															height: "3rem",
															width: adjustWidth(width, "25rem"),
														}}
													/>
												</div>
											</div>
										)}
									{emptyQuery && (
										<div
											style={{
												width: "70%",
												height: "85%",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												flexDirection: "column",
												paddingBottom: adjustHeight(height, "7rem"),
											}}
										>
											<div
												style={{
													width: adjustWidth(width, "25rem"),
													fontSize: adjustWidth(width, "2rem"),
													textAlign: "center",
													fontFamily: fonts.textFont,
													color: colors.statusDenied,
												}}
											>
												{error}
											</div>
										</div>
									)}
									{!emptyQuery && patientsResources && (
										<PatientSection
											patientsResources={patientsResources}
											genViewPatientBtnClick={genViewPatientBtnClick}
											adjustHeight={adjustHeight}
											adjustWidth={adjustWidth}
											setQueryReturnedEmpty={setQueryReturnedEmpty}
										/>
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	};

	const PatientSection = ({
		patientsResources,
		genViewPatientBtnClick,
		setQueryReturnedEmpty,
	}) => {
		const { width, height } = useWindowSize();
		return (
			<Suspense fallback={<Throbber loadingMessage="Cargando pacientes..." />}>
				<PatientCard
					patientsResources={patientsResources}
					genViewPatientBtnClick={genViewPatientBtnClick}
					adjustHeight={adjustHeight}
					adjustWidth={adjustWidth}
					setQueryReturnedEmpty={setQueryReturnedEmpty}
					style={{
						mainContainer: {
							borderRadius: adjustWidth(width, "1rem"),
						},
						secondaryContainer: {
							paddingLeft: adjustWidth(width, "3rem"),
							gap: adjustHeight(height, "0.5rem"),
						},
						cardsContainer: {
							minHeight: adjustHeight(height, "10rem"),
							borderRadius: adjustWidth(width, "1rem"),
						},
						patientName: {
							fontFamily: fonts.textFont,
						},
						patientAge: {
							fontFamily: fonts.textFont,
						},
						patientCUI: {
							fontFamily: fonts.textFont,
						},
					}}
				/>
			</Suspense>
		);
	};
	const LoadingView = () => {
		return (
			<div
				style={{
					height: "100vh",
				}}
			>
				<Throbber loadingMessage="Cargando..." />
			</div>
		);
	};

	return (
		<Suspense fallback={<LoadingView />}>
			<Child />
		</Suspense>
	);
}
