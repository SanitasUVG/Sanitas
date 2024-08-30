import { useNavigate } from "react-router-dom";
import SanitasLogo from "src/assets/images/logoSanitas.png";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import clinica from "src/assets/images/clinica.png";
import BaseButton from "src/components/Button/Base/index";
import { fonts, fontSize } from "src/theme.mjs";
import { NAV_PATHS } from "src/router";

export default function StudentWelcomeView() {
	const navigate = useNavigate();

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
							marginBottom: "5em",
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
						onClick={() => navigate(NAV_PATHS.PATIENT_LINK, { replace: true })}
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
								fontSize: "14.7px",
								fontWeight: "400",
								lineHeight: "22.05px",
								textAlign: "center",
								marginBottom: "1.5em",
							}}
						>
							Para conocer más información de la clínica médica presiona aquí:
						</p>
						<p
							style={{
								fontFamily: "Lora",
								fontSize: "14.7px",
								fontWeight: "700",
								lineHeight: "22.05px",
								textAlign: "center",
							}}
						>
							https://noticias.uvg.edu.gt/en-uvg-contamos-con-estaciones-de-emergencia-para-atender-a-la-comunidad/
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
