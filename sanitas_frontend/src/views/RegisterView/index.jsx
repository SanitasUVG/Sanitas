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

  const Child = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    /** @type {[import("src/utils/promiseWrapper").SuspenseResource<import("src/dataLayer.mjs").Result<any, any>>, Function]} */
    const [registerResource, setRegisterResource] = useState(null);

    const handleRegister = () => {
      setRegisterResource(WrapPromise(registerUser(username, password)));
    };

    if (registerResource !== null) {
      const response = registerResource.read();
      if (response.error) {
        setErrorMessage("Lo sentimos! Ha ocurrido un error interno.");
      } else {
        navigate(NAV_PATHS.LOGIN_USER, { replace: true });
      }

      setRegisterResource(null);
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
              ¡Hola!
            </h1>
            <p
              style={{
                textAlign: "center",
                fontFamily: fonts.textFont,
                fontSize: fontSize.subtitleSize,
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
                fontSize: fontSize.textSize,
              }}
            >
              ¿Ya tienes cuenta?{" "}
              <a
                style={{
                  cursor: "pointer",
                  fontWeight: "bold",
                  color: colors.titleText,
                  textDecoration: "none",
                  paddingLeft: "0.5rem",
                }}
                onClick={() => navigate(NAV_PATHS.LOGIN_USER, { replace: true })}
                onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
              >
                Ingresa aquí.
              </a>
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
      <Child />
    </Suspense>
  );
}
