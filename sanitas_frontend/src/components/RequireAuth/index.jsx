import React, { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "src/cognito.mjs";
import { NAV_PATHS } from "src/router";
import { colors } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";
import Throbber from "../Throbber";

const RequireAuth = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const sessionResource = WrapPromise(getSession());

  const Child = () => {
    const response = sessionResource.read();

    if (response.error) {
      setIsLoggedIn(false);
    } else {
      console.log(response.result.isValid());
      setIsLoggedIn(response.result.isValid());
    }

    useEffect(() => {
      if (isLoggedIn === false) {
        setTimeout(() => {
          setIsRedirecting(true);
        }, 2000);

        setTimeout(() => {
          navigate(NAV_PATHS.LOGIN_USER, { replace: true });
        }, 4000);
      } else {
        setIsRedirecting(false);
      }
    }, [isLoggedIn]);

    return !isLoggedIn
      ? (
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isRedirecting
            ? (
              <>
                <Throbber loadingMessage="Redirigiendo al inicio de sesión..."></Throbber>
              </>
            )
            : (
              <h1 style={{ color: colors.primaryBackground }}>
                Acceso denegado. Por favor, inicie sesión.
              </h1>
            )}
        </div>
      )
      : <>{children}</>;
  };

  const Loading = () => {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <Throbber loadingMessage="Cargando..."></Throbber>
      </div>
    );
  };

  return (
    <Suspense fallback={<Loading />}>
      <Child />
    </Suspense>
  );
};

export default RequireAuth;
