import logoSanitas from "src/assets/images/logoSanitas.png";
import backgroundImage from "src/assets/images/UVGBackground.jpg";
import uvgLogo from "src/assets/images/uvgLogo.jpg";
import BaseButton from "src/components/Button/Base";
import { BaseInput } from "src/components/Input";
import { colors, fonts, fontSize } from "src/theme.mjs";
import { adjustHeight, adjustWidth } from "src/utils/measureScaling";
import useWindowSize from "src/utils/useWindowSize";

export default function LoginView() {
  const { width, height } = useWindowSize();

  /** @type React.CSSStyleDeclaration */
  const inputStyles = {
    width: "100%",
    paddingTop: adjustHeight(height, "0.8rem"),
    paddingBottom: adjustHeight(height, "0.8rem"),
    paddingRight: adjustWidth(width, "0.8rem"),
    paddingLeft: adjustWidth(width, "0.8rem"),

    fontSize: fontSize.textSize,
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
          padding: adjustHeight(height, "4rem") + " 8vw 0 8vw",
          display: "flex",
          flexDirection: "column",
          gap: adjustHeight(height, "3rem"),
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
              paddingBottom: adjustHeight(height, "1rem"),
              paddingTop: adjustHeight(height, "1rem"),
            }}
          >
            ¡Bienvenid@!
          </h1>
          <p
            style={{
              textAlign: "center",
              fontFamily: fonts.textFont,
              fontSize: "1.5rem",
              paddingBottom: adjustHeight(height, "1rem"),
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
            gap: adjustHeight(height, "1.5rem"),
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontFamily: fonts.textFont,
                fontSize: fontSize.subtitleSize,
                paddingBottom: adjustHeight(height, "0.5rem"),
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
                fontSize: fontSize.subtitleSize,
                paddingTop: adjustHeight(height, "0.5rem"),
                paddingBottom: adjustHeight(height, "0.5rem"),
              }}
            >
              Contraseña:
            </label>
            <BaseInput placeholder="Ingrese su contraseña" style={inputStyles} />
            <p
              style={{
                textAlign: "right",
                fontFamily: fonts.titleFont,
                fontSize: "0.90rem",
                color: colors.titleText,
                fontWeight: "bold",
                paddingTop: adjustHeight(height, "0.5rem"),
              }}
            >
              ¿Olvidaste tu contraseña?
            </p>
          </div>
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
              fontFamily: fonts.titleFont,
              fontSize: fontSize.textSize,
            }}
          />
          <p
            style={{
              alignSelf: "center",
              fontFamily: fonts.titleFont,
              fontSize: fontSize.textSize,
              paddingTop: adjustHeight(height, "1rem"),
            }}
          >
            ¿No tienes cuenta?{" "}
            <a
              style={{
                fontWeight: "bold",
                color: colors.titleText,
              }}
            >
              Crea una aquí.
            </a>
          </p>
        </div>

        <img
          src={logoSanitas}
          style={{
            width: adjustWidth(width, "6rem"),
            position: "absolute",
            bottom: adjustHeight(height, "1rem"),
            right: adjustHeight(height, "1rem"),
          }}
        />
      </div>
    </div>
  );
}