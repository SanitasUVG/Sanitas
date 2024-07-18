import logoSanitas from "src/assets/images/logoSanitas.png";
import backgroundImage from "src/assets/images/UVGBackground.jpg";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import BaseButton from "src/components/Button/Base";
import { BaseInput } from "src/components/Input";
import { colors, fonts, fontSize } from "src/theme.mjs";

export default function LoginView() {
  /** @type React.CSSStyleDeclaration */
  const inputStyles = {
    width: "100%",
    padding: ".8rem",
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
          padding: "4rem 8vw 0 8vw",
          display: "flex",
          flexDirection: "column",
          gap: "3rem",
          width: "45%",
          height: "90%",
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
              // maxWidth: "33%",
              height: "15vh",
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
            ¡Bienvenid@!
          </h1>
          <p
            style={{
              textAlign: "center",
              fontFamily: fonts.textFont,
              fontSize: fontSize.subtitleSize,
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
            <BaseInput placeholder="Ingrese su correo" style={inputStyles} />
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
            <BaseInput placeholder="Ingrese su contraseña" style={inputStyles} />
          </div>
          <p
            style={{
              textAlign: "right",
              fontFamily: fonts.titleFont,
              fontSize: fontSize.textSize,
              color: colors.titleText,
            }}
          >
            ¿Olvidaste tu contraseña?
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <BaseButton
            text="Ingresar"
            style={{
              alignSelf: "center",
              width: "75%",
            }}
          />
          <p
            style={{
              alignSelf: "center",
              fontFamily: fonts.titleFont,
              fontSize: fontSize.textSize,
            }}
          >
            ¿No tienes cuenta?{" "}
            <a
              style={{
                fontWeight: "bold",
                color: colors.titleText,
              }}
            >
              Crea una aquí
            </a>
          </p>
        </div>

        <img
          src={logoSanitas}
          style={{
            width: "4rem",
            position: "absolute",
            bottom: "1rem",
            right: "1rem",
          }}
        />
      </div>
    </div>
  );
}
