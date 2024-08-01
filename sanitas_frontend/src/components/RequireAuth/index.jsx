import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "src/cognito.mjs";
import { colors } from "src/theme.mjs";
import Throbber from "../Throbber";

const RequireAuth = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    getSession()
      .then((session) => {
        if (session && session.isValid()) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch((error) => {
        setIsLoggedIn(false);
      });
  }, []);

  useEffect(() => {
    if (isLoggedIn === false) {
      setTimeout(() => {
        setIsRedirecting(true);
      }, 2000);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 4000);
    } else {
      setIsRedirecting(false);
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn === null) {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <Throbber loadingMessage="Cargando..."></Throbber>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
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
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
