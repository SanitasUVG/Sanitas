import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "src/components/Button/index";
import { NAV_PATHS } from "src/router";

export default function UpdateInfoView() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(NAV_PATHS.SEARCH_PATIENT);
  };

  return (
    <div>
      <h1>Actualizar información del paciente</h1>
      <div>Aquí se actualiza la información</div>
      <Button text="Volver" onClick={handleBack} />
    </div>
  );
}
