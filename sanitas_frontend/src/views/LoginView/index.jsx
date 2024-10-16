import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import logoSanitas from "src/assets/images/logoSanitas.png";
import backgroundImage from "src/assets/images/UVGBackground.jpg";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import BaseButton from "src/components/Button/Base";
import { BaseInput } from "src/components/Input";
import { NAV_PATHS } from "src/router";
import { colors, fonts, fontSize } from "src/theme.mjs";
import useWindowSize from "src/utils/useWindowSize";

/**
 * @typedef {Object} LoginViewProps
 * @property {import("src/cognito.mjs").CognitoLoginUserCallback} loginUser - The callback to login a user.
 * @property {import("src/cognito.mjs").CognitoLoginUserCallback} getRole - The callback to login a user.
 * @property {import("src/dataLayer.mjs").GetLinkedPatientCallback} getLinkedPatient - The callback to get the patient linked to this account.
 * @property {import("src/store.mjs").UseStoreHook} useStore
 */

/**
 * @param {LoginViewProps} props
 */

export default function LoginView({
	loginUser,
	getRole,
	getLinkedPatient,
	useStore,
}) {
	const setSelectedPatientId = useStore((s) => s.setSelectedPatientId);
	const { width } = useWindowSize();

	/** @type React.CSSStyleDeclaration */
	const inputStyles = {
		width: "100%",
		padding: ".8rem",
	};

	const isMobile = width < 768;
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
	const LoginForm = () => {
		const navigate = useNavigate();
		const [username, setUsername] = useState("");
		const [password, setPassword] = useState("");
		const [errorMessage, setErrorMessage] = useState("");
		const [isLoading, setIsLoading] = useState(false);
		// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
		const handleLogin = async () => {
			if (!(username && password)) {
				setErrorMessage("Por favor, complete todos los campos.");
				return;
			}

			setIsLoading(true);
			setErrorMessage("");
			toast.info("Intentando iniciar sesión...", { autoClose: false });

			try {
				const loginResponse = await loginUser(username, password);
				if (loginResponse.error) {
					handleLoginError(loginResponse.error);
					return;
				}

				const roleResponse = await getRole();
				if (roleResponse.error) {
					throw new Error("Error al obtener el rol del usuario");
				}

				if (roleResponse.result === "DOCTOR") {
					navigate(NAV_PATHS.SEARCH_PATIENT, { replace: true });
					return;
				}

				const linkedPatientResponse = await getLinkedPatient();
				if (linkedPatientResponse.error) {
					throw new Error("Error al obtener el paciente vinculado");
				}

				const { linkedPatientId } = linkedPatientResponse.result;
				if (!linkedPatientId) {
					navigate(NAV_PATHS.PATIENT_WELCOME, { replace: true });
				} else {
					setSelectedPatientId(linkedPatientId);
					navigate(NAV_PATHS.PATIENT_FORM, { replace: true });
				}
			} catch (error) {
				console.error("Error durante el inicio de sesión:", error);
				setErrorMessage("Lo sentimos! Ha ocurrido un error interno.");
			} finally {
				setIsLoading(false);
				toast.dismiss();
			}
		};

		const handleLoginError = (error) => {
			switch (error.code) {
				case "NotAuthorizedException":
				case "UserNotFoundException":
					setErrorMessage("Revise el correo o la contraseña por favor.");
					break;
				default:
					setErrorMessage("Lo sentimos! Ha ocurrido un error interno.");
			}
		};

		return (
			<div
				style={{
					backgroundImage: `url(${backgroundImage})`,
					backgroundColor: "black",
					backgroundSize: "cover",
					width: "100vw",
					height: "100vh",
					display: "grid",
					alignItems: "center",
					justifyItems: "center",
					overflowY: "scroll",
				}}
			>
				{/* White container */}
				<div
					style={{
						background: "white",
						padding: isMobile ? "2rem 4vw 2rem 4vw" : "4rem 8vw 0 8vw",
						display: "flex",
						flexDirection: "column",
						gap: isMobile ? "1.5rem" : "3rem",
						width: isMobile ? "90%" : "45%",
						height: isMobile ? "auto" : "90%",
						position: "relative",
						borderRadius: "1rem",
					}}
				>
					{/* Header */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
						}}
					>
						<img
							style={{
								alignSelf: "center",
								height: isMobile ? "10vh" : "15vh",
							}}
							alt="UVG Logo"
							src={uvgLogo}
						/>

						<h1
							style={{
								textAlign: "center",
								fontFamily: fonts.titleFont,
								color: colors.titleText,
								fontSize: isMobile ? fontSize.subtitleSize : "2rem",
							}}
						>
							¡Bienvenid@!
						</h1>
						<p
							style={{
								textAlign: "center",
								fontFamily: fonts.textFont,
								fontSize: isMobile ? "1.06rem" : fontSize.subtitleSize,
							}}
						>
							Ingresa tus datos
						</p>
					</div>

					{/* Inputs */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "1.5rem",
						}}
					>
						<div>
							<label
								style={{
									display: "block",
									fontFamily: fonts.textFont,
									fontSize: fontSize.textSize,
								}}
							>
								Correo electrónico:
							</label>
							<BaseInput
								placeholder="Ingrese su correo"
								style={inputStyles}
								value={username}
								onChange={(ev) => setUsername(ev.target.value)}
							/>
						</div>
						<div>
							<label
								style={{
									display: "block",
									fontFamily: fonts.textFont,
									fontSize: fontSize.textSize,
								}}
							>
								Contraseña:
							</label>
							<BaseInput
								placeholder="Ingrese su contraseña"
								style={inputStyles}
								value={password}
								type="password"
								onChange={(ev) => setPassword(ev.target.value)}
							/>
						</div>
					</div>

					{/* Footer */}
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: ".5rem",
						}}
					>
						<BaseButton
							text={isLoading ? "Iniciando sesión..." : "Ingresar"}
							style={{
								alignSelf: "center",
								width: "75%",
							}}
							onClick={handleLogin}
							disabled={isLoading}
						/>
						<p
							style={{
								alignSelf: "center",
								fontFamily: fonts.titleFont,
								fontSize: isMobile ? "0.85rem" : fontSize.textSize,
							}}
						>
							¿No tienes cuenta?
							<span
								style={{
									cursor: "pointer",
									fontWeight: "bold",
									color: colors.titleText,
									textDecoration: "none",
									paddingLeft: "0.5rem",
								}}
								onClick={() =>
									navigate(NAV_PATHS.REGISTER_USER, { replace: true })
								}
								onKeyUp={(e) => {
									if (e.key === "Enter") {
										navigate(NAV_PATHS.REGISTER_USER, { replace: true });
									}
								}}
								onMouseEnter={(e) => {
									e.target.style.textDecoration = "underline";
								}}
								onMouseLeave={(e) => {
									e.target.style.textDecoration = "none";
								}}
							>
								Crea una aquí.
							</span>
						</p>

						<p
							style={{
								alignSelf: "center",
								color: colors.statusDenied,
								fontWeight: "bold",
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
							}}
						>
							{errorMessage}
						</p>
					</div>

					{!isMobile && (
						<img
							src={logoSanitas}
							alt="Sanitas logo"
							style={{
								width: "4rem",
								position: "absolute",
								bottom: "1rem",
								right: "1rem",
							}}
						/>
					)}
				</div>
			</div>
		);
	};

	return <LoginForm />;
}
