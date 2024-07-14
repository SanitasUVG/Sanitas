import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SanitasLogo from "src/assets/images/logoSanitas.png";
import BaseButton from "src/components/Button/Base/index";
import { BaseInput, DateInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { NAV_PATHS } from "src/router";
import { colors, fonts, fontSize } from "src/theme.mjs";

export function AddPatientView({ submitPatientData, useStore }) {
  const setSelectedPatientId = useStore((s) => s.setSelectedPatientId);
  const location = useLocation();

  const [patientData, setPatientData] = useState({
    cui: location.state?.cui ?? "",
    names: "",
    surnames: "",
    sex: null,
    birthDate: "",
  });

  return (
    <div
      style={{
        backgroundColor: colors.primaryBackground,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: colors.secondaryBackground,
          padding: "3.125rem",
          width: "95%",
          height: "95%",
          textAlign: "left",
        }}
      >
        <img
          style={{
            width: "9.06rem",
            height: "4.375rem",
          }}
          src={SanitasLogo}
          alt="Logo Sanitas"
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "right",
            paddingLeft: "7.5rem",
          }}
        >
          <h1
            style={{
              color: colors.titleText,
              fontSize: fontSize.titleSize,
              paddingBottom: "0.625rem",
              paddingTop: "1.25rem",
            }}
          >
            Información del paciente
          </h1>
          <h3
            style={{
              fontFamily: fonts.textFont,
              fontWeight: "normal",
              fontSize: fontSize.subtitleSize,
              paddingBottom: "2.307rem",
            }}
          >
            Por favor, registre al paciente
          </h3>
          <PatientForm
            patientData={patientData}
            setPatientData={setPatientData}
            submitPatientData={submitPatientData}
            setSelectedPatientId={setSelectedPatientId}
          />
        </div>
      </div>
    </div>
  );
}

export function PatientForm({
  patientData,
  setPatientData,
  submitPatientData,
  setSelectedPatientId,
}) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  if (!patientData) return null;

  const handleChange = (field, value) => {
    if (field === "names" || field === "surnames") {
      const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
      setPatientData({ ...patientData, [field]: filteredValue });
    } else {
      setPatientData({ ...patientData, [field]: value });
    }
  };

  const validateFormData = () => {
    const fields = ["names", "surnames", "birthDate"];
    if (patientData.cui.length !== 13) {
      alert("El CUI debe contener exactamente 13 caracteres.");
      return false;
    }
    for (let field of fields) {
      if (!patientData[field]) {
        alert(`El campo ${field} es obligatorio y no puede estar vacío.`);
        return false;
      }
    }
    if (patientData.sex === null) {
      alert(`El campo de género es obligatorio.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validateFormData()) {
      setIsLoading(true);
      try {
        const id = await submitPatientData(patientData);
        setSelectedPatientId(id);
        navigate(NAV_PATHS.UPDATE_PATIENT, { replace: true });
      } catch (error) {
        alert(`Error al enviar datos: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGenderChange = (isFemale) => {
    setPatientData({ ...patientData, sex: isFemale });
  };

  const LoadingView = () => {
    return (
      <div>
        <Throbber loadingMessage="Guardando datos del paciente..." />
      </div>
    );
  };

  return (
    <div>
      {isLoading ? <LoadingView /> : (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "right",
              alignItems: "right",
              width: "45%",
            }}
          >
            <p>CUI del paciente:</p>
            <BaseInput
              type="text"
              value={patientData.cui}
              onChange={(e) => handleChange("cui", e.target.value.replace(/\D/g, ""))}
              placeholder="CUI"
              style={{
                borderColor: patientData.cui.length === 13
                  ? colors.statusApproved
                  : colors.statusDenied,
              }}
            />
            {patientData.cui.length !== 13 && (
              <div style={{ color: colors.statusDenied }}>
                El CUI debe contener exactamente 13 caracteres.
              </div>
            )}

            <p>Ingrese el nombre del paciente:</p>

            <div style={{ display: "flex", gap: "1rem" }}>
              <BaseInput
                type="text"
                value={patientData.names}
                onChange={(e) => handleChange("names", e.target.value)}
                placeholder="Nombres"
                style={{ flex: 1 }}
              />
              <BaseInput
                type="text"
                value={patientData.surnames}
                onChange={(e) => handleChange("surnames", e.target.value)}
                placeholder="Apellidos"
                style={{ flex: 1 }}
              />
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "left",
                alignItems: "left",
                paddingTop: "1.25rem",
                paddingBottom: "1.25rem",
              }}
            >
              <div style={{ paddingRight: "1.25rem" }}>
                <RadioInput
                  name="gender"
                  checked={patientData.sex === true}
                  onChange={() => handleGenderChange(true)}
                  label="Femenino"
                />
              </div>
              <div>
                <RadioInput
                  name="gender"
                  checked={patientData.sex === false}
                  onChange={() => handleGenderChange(false)}
                  label="Masculino"
                />
              </div>
            </div>

            <p>Ingrese la fecha de nacimiento del paciente:</p>
            <DateInput
              value={patientData.birthDate}
              onChange={(e) => handleChange("birthDate", e.target.value)}
              placeholder="Fecha de nacimiento"
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              paddingTop: "4.5rem",
            }}
          >
            <BaseButton
              text="Registrar información"
              onClick={handleSubmit}
              disabled={isLoading} // Deshabilitar el botón mientras se carga
            />
          </div>
        </div>
      )}
    </div>
  );
}
