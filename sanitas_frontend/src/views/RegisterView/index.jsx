import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoSanitas from "src/assets/images/logoSanitas.png";
import backgroundImage from "src/assets/images/UVGBackground.jpg";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import BaseButton from "src/components/Button/Base";
import { BaseInput } from "src/components/Input";
import Throbber from "src/components/Throbber";
import { NAV_PATHS } from "src/router";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import { adjustHeight, adjustWidth } from "src/utils/measureScaling";
import useWindowSize from "src/utils/useWindowSize";

/**
 * @typedef {Object} RegisterViewProps
 * @property {import("src/cognito.mjs").CognitoRegisterUserCallback} registerUser - The callback to register a user.
 */

/**
 * @param {RegisterViewProps} props
 */
export default function RegisterView({ registerUser }) {
	/** @type React.CSSStyleDeclaration */
	const inputStyles = {
		width: "100%",
		padding: ".8rem",
	};

	const { width, height } = useWindowSize();

	const isMobile = width < 768;

	const [showPopup, setShowPopup] = useState(false);

	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Ignoring complexity for this function
	const Child = () => {
		const navigate = useNavigate();
		const [username, setUsername] = useState("");
		const [password, setPassword] = useState("");
		const [errorMessage, setErrorMessage] = useState("");
		/** @type {[import("src/utils/promiseWrapper").SuspenseResource<import("src/dataLayer.mjs").Result<any, any>>, Function]} */
		const [registerResource, setRegisterResource] = useState(null);

		const handleRegister = () => {
			if (!(username && password)) {
				setErrorMessage("Por favor, complete todos los campos.");
				return;
			}
			setRegisterResource(WrapPromise(registerUser(username, password)));
		};

		if (registerResource !== null) {
			const response = registerResource.read();
			if (!response.error) {
				setShowPopup(true); // Mostrar el popup
				setTimeout(() => {
					navigate(NAV_PATHS.LOGIN_USER, { replace: true });
				}, 7000);
			} else {
				console.log(response);
				const errorType = response.error.code;
				console.log(errorType);
				switch (errorType) {
					case "UsernameExistsException":
						setErrorMessage(
							"El usuario ya está registrado. Intente con otro correo.",
						);
						break;
					case "InvalidParameterException":
						setErrorMessage("Revise el correo o la contraseña por favor.");
						break;
					case "InvalidPasswordException":
						setErrorMessage(
							"La contraseña es muy débil. Intente con una más segura.",
						);
						break;
					default:
						setErrorMessage("Lo sentimos! Ha ocurrido un error interno.");
				}
				setRegisterResource(null);
			}
		}

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
						padding: isMobile ? "2rem 4vw 0 4vw" : "4rem 8vw 0 8vw", // Ajuste responsivo
						display: "flex",
						flexDirection: "column",
						gap: isMobile ? "1.5rem" : "3rem", // Ajuste responsivo
						width: isMobile ? "90%" : "45%", // Ajuste responsivo
						height: isMobile ? "auto" : "90%", // Ajuste responsivo
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
								height: isMobile ? "10vh" : "15vh", // Ajuste responsivo
							}}
							alt="UVG Logo"
							src={uvgLogo}
						/>

						<h1
							style={{
								textAlign: "center",
								fontFamily: fonts.titleFont,
								color: colors.titleText,
							}}
						>
							¡Hola!
						</h1>
						<p
							style={{
								textAlign: "center",
								fontFamily: fonts.textFont,
								fontSize: isMobile ? "0.85rem" : fontSize.subtitleSize, // Ajuste responsivo
							}}
						>
							Por favor, regístrate
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
								type="password"
								placeholder="Ingrese su contraseña"
								style={inputStyles}
								value={password}
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
							text="Ingresar"
							style={{
								alignSelf: "center",
								width: "75%",
							}}
							onClick={handleRegister}
						/>
						<p
							style={{
								alignSelf: "center",
								fontFamily: fonts.titleFont,
								fontSize: isMobile ? "0.85rem" : fontSize.textSize,
							}}
						>
							¿Ya tienes cuenta?{" "}
							<span
								style={{
									cursor: "pointer",
									fontWeight: "bold",
									color: colors.titleText,
									textDecoration: "none",
									paddingLeft: "0.5rem",
								}}
								onClick={() =>
									navigate(NAV_PATHS.LOGIN_USER, { replace: true })
								}
								onKeyUp={() =>
									navigate(NAV_PATHS.LOGIN_USER, { replace: true })
								}
								onMouseEnter={(e) => {
									e.target.style.textDecoration = "underline";
								}}
								onMouseLeave={(e) => {
									e.target.style.textDecoration = "none";
								}}
							>
								Ingresa aquí.
							</span>
						</p>
						<p
							style={{
								alignSelf: "center",
								color: colors.statusDenied,
								fontWeight: "bold",
								fontFamily: fonts.textFont,
								fontSize: isMobile ? "0.85rem" : fontSize.textSize,
							}}
						>
							{errorMessage}
						</p>
					</div>

					{/* Logo */}
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

	const LoadingView = () => {
		return (
			<div
				style={{
					height: "100vh",
				}}
			>
				<Throbber loadingMessage="Registrando usuario..." />
			</div>
		);
	};

	return (
		<Suspense fallback={<LoadingView />}>
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
				}}
			>
				{showPopup && (
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							width: "100%",
							height: "100%",
							backgroundColor: "rgba(0,0,0,0.5)",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							zIndex: 1000,
						}}
					>
						<div
							style={{
								backgroundColor: "white",
								padding: adjustWidth(width, "1.25rem"),
								borderRadius: adjustHeight(height, "0.625rem"),
								textAlign: "center",
								width: "30%",
								height: adjustHeight(height, "25rem"),
								fontFamily: fonts.textFont,
								fontSize: fontSize.textSize,
								display: "flex",
								flexDirection: "column",
								paddingLeft: adjustWidth(width, "4rem"),
								paddingRight: adjustWidth(width, "4rem"),
								justifyContent: "center",
								alignContent: "center",
								alignItems: "center",
							}}
						>
							<h1
								style={{
									textAlign: "center",
									fontFamily: fonts.titleFont,
									color: colors.titleText,
								}}
							>
								¡Verifica tu cuenta!
							</h1>
							<p
								style={{
									textAlign: "center",
									fontSize: isMobile ? "0.75rem" : fontSize.textSize,
									paddingTop: adjustHeight(height, "1rem"),
									paddingBottom: adjustHeight(height, "2rem"),
								}}
							>
								Hemos enviado un correo para confirmar tu usuario, por favor
								revisa tu bandeja de entrada o spam.
							</p>
							<p>
								En un momento serás redirigido a la página de inicio de sesión.
							</p>
						</div>
					</div>
				)}
				<Child />
			</div>
		</Suspense>
	);
}
