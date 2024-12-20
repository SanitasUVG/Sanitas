import { useNavigate } from "react-router-dom";
import SanitasLogo from "src/assets/images/logoSanitas.png";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import clinica from "src/assets/images/clinica.png";
import BaseButton from "src/components/Button/Base/index";
import { fonts, fontSize } from "src/theme.mjs";
import { NAV_PATHS } from "src/router";
import useWindowSize from "src/utils/useWindowSize";

export default function StudentWelcomeView() {
	const navigate = useNavigate();
	const { width } = useWindowSize();
	const isMobile = width < 768;

	return (
		<div
			style={{
				backgroundColor: "#0F6838",
				height: "100vh",
				width: "100vw",
				padding: "2rem",
				overflowX: "hidden",
			}}
		>
			{!isMobile ? (
				<>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							backgroundColor: "#FFFFFF",
							width: "100%",
							height: "122px",
							borderRadius: "8.27px",
							marginBottom: "66px",
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								height: "100%",
							}}
						>
							<img
								style={{
									width: "102.99px",
									height: "100px",
									gap: "0px",
									opacity: "0px",
								}}
								src={uvgLogo}
								alt="uvgLogo"
							/>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								height: "100%",
							}}
						>
							<p
								style={{
									width: "637.56px",
									height: "53px",
									top: "95px",
									left: "354.23px",
									gap: "0px",
									opacity: "0px",
									fontFamily: "Montserrat",
									fontSize: "43.2px",
									fontWeight: "700",
									lineHeight: "52.66px",
									textAlign: "center",
									color: "rgba(62, 139, 67, 1)",
									alignItems: "center",
								}}
							>
								¡Bienvenid@ a Clínica UVG!
							</p>
						</div>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								height: "100%",
							}}
						>
							<img
								style={{
									width: "135.99px",
									height: "67px",
									gap: "0px",
									opacity: "0px",
								}}
								src={SanitasLogo}
								alt="SanitasLogo"
							/>
						</div>
					</div>

					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							minWidth: "805px",
							height: "70%",
							borderRadius: "8.27px",
						}}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								marginRight: "1em",
								backgroundColor: "#FFFFFF",
								padding: "77px",
								borderRadius: "8.27px",
								overflowY: "scroll",
							}}
						>
							<p
								style={{
									fontFamily: "Lora",
									fontSize: "20px",
									fontWeight: "400",
									lineHeight: "30px",
									textAlign: "center",
									marginBottom: "1.5em",
									paddingTop: "1rem",
								}}
							>
								El siguiente formulario tiene como objetivo recolectar datos
								médicos esenciales para nuestra clínica médica. Con esta
								información, buscamos ofrecer una atención más precisa y
								personalizada a cada paciente que nos visite.
							</p>
							<p
								style={{
									fontFamily: "Lora",
									fontSize: "20px",
									fontWeight: "700",
									lineHeight: "30px",
									textAlign: "center",
									marginBottom: "1.5em",
								}}
							>
								Es importante destacar que los datos proporcionados en este
								formulario son confidenciales y solo las doctoras de la clínica
								tendrán acceso a ellos.
							</p>
							<p
								style={{
									fontFamily: "Lora",
									fontSize: "20px",
									fontWeight: "400",
									lineHeight: "30px",
									textAlign: "center",
									paddingBottom: "2rem",
								}}
							>
								Agradecemos su colaboración y confianza.
							</p>
							<BaseButton
								text="Continuar"
								style={{
									alignSelf: "center",
									fontFamily: fonts.titleFont,
									fontSize: fontSize.textSize,
									width: "388px",
									minHeight: "43px",
									padding: "0px 16px 0px 16px",
									gap: "8px",
									borderRadius: "8px",
									opacity: "0px",
								}}
								onClick={() =>
									navigate(NAV_PATHS.PATIENT_LINK, { replace: true })
								}
							/>
						</div>
						<div
							style={{
								minWidth: "464px",
								display: "flex",
								flexDirection: "column",
								justifyContent: "space-between",
								gap: "1.5em",
								borderRadius: "8.27px",
								opacity: "0px",
							}}
						>
							<img
								style={{
									width: "464px",
									height: "200%",
									top: "249px",
									left: "851px",
									gap: "0",
									borderRadius: "8.27px",
									opacity: "0px",
								}}
								src={clinica}
								alt="clinica"
							/>
							<div
								style={{
									width: "464px",
									height: "100%",
									display: "flex",
									flexDirection: "column",
									justifyContent: "center",
									marginRight: "1em",
									backgroundColor: "#FFFFFF",
									padding: "1em",
									borderRadius: "8.27px",
								}}
							>
								<p
									style={{
										fontFamily: "Lora",
										fontSize: "18px",
										fontWeight: "400",
										lineHeight: "22.05px",
										textAlign: "center",
										paddingBottom: "1rem",
									}}
								>
									Número de emergencias de la Clínica UVG:{" "}
									<strong>5978-1736</strong> (Aplica unicamente dentro del
									Campus Central y casas anexas)
								</p>

								<p
									style={{
										fontFamily: "Lora",
										fontSize: "18px",
										fontWeight: "400",
										lineHeight: "22.05px",
										textAlign: "center",
									}}
								>
									Nos encontramos en el Salón <strong>F-119</strong>. Nuestros
									horarios son de Lunes a Viernes de 7:00 a 20:30 y Sábados de
									8:00 a 14:00.
								</p>
							</div>
						</div>
					</div>
				</>
			) : (
				<div
					style={{
						backgroundColor: "#FFFFFF",
						borderRadius: "8.27px",
						padding: "0.5em 1em 1em 1em",
						textAlign: "center",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
						height: "100%",
					}}
				>
					<img
						src={uvgLogo}
						alt="uvgLogo"
						style={{ width: "60%", alignSelf: "center" }}
					/>
					<p
						style={{
							fontFamily: "Montserrat",
							fontSize: "24px",
							fontWeight: "700",
							color: "rgba(62, 139, 67, 1)",
						}}
					>
						¡Bienvenid@ a Clínica UVG!
					</p>
					<p
						style={{
							fontFamily: "Lora",
							fontSize: "16px",
							lineHeight: "24px",
						}}
					>
						El siguiente formulario tiene como objetivo recolectar datos médicos
						esenciales para nuestra clínica médica. Con esta información,
						buscamos ofrecer una atención más precisa y personalizada a cada
						paciente que nos visite.
					</p>
					<p
						style={{
							fontFamily: "Lora",
							fontSize: "16px",
							lineHeight: "24px",
							fontWeight: "bold",
						}}
					>
						Es importante destacar que los datos proporcionados en este
						formulario son confidenciales y solo las doctoras de la clínica
						tendrán acceso a ellos.
					</p>
					<p
						style={{
							fontFamily: "Lora",
							fontSize: "16px",
							lineHeight: "24px",
						}}
					>
						Agradecemos su colaboración y confianza.
					</p>
					<BaseButton
						text="Continuar"
						style={{
							alignSelf: "center",
							fontFamily: fonts.titleFont,
							fontSize: fontSize.textSize,
							width: "80%",
							minHeight: "43px",
							borderRadius: "8px",
							paddingTop: "auto",
						}}
						onClick={() => navigate(NAV_PATHS.PATIENT_LINK, { replace: true })}
					/>
				</div>
			)}
		</div>
	);
}
