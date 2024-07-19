import React, { Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SanitasLogo from "src/assets/images/logoSanitas.png";
import BaseButton from "src/components/Button/Base/index";
import { BaseInput, DateInput, RadioInput } from "src/components/Input/index";
import Throbber from "src/components/Throbber";
import { NAV_PATHS } from "src/router";
import { colors, fonts, fontSize } from "src/theme.mjs";
import WrapPromise from "src/utils/promiseWrapper";

/**
 * @typedef {Object} PatientData
 * @property {string} cui - Unique identifier for the patient.
 * @property {string} names - First and middle names of the patient.
 * @property {string} surnames - Last names of the patient.
 * @property {boolean} isWoman - Gender of the patient.
 * @property {string} birthDate - Birthdate of the patient.
 * @property {boolean} isNew - Indicates if the patient data is new or existing.
 */

/**
 * Component for adding new patients.
 * Uses navigation state to pre-fill the CUI if available.
 *
 * @param {AddPatientViewProps} props - Component properties.
 * @param {import("src/store.mjs").UseStoreHook} props.useStore
 * @param {function(PatientData): Promise<void>} props.submitPatientData - Function to submit patient data.
 */
export function AddPatientView({ submitPatientData, useStore }) {
  const setSelectedPatientId = useStore((s) => s.setSelectedPatientId);
  const location = useLocation();

  const Hijo = () => {
    const [patientData, setPatientData] = useState({
      cui: location.state?.cui ?? "",
      names: "",
      surnames: "",
      sex: null,
      birthDate: "",
    });

    const navigate = useNavigate();
    const [updateError, setUpdateError] = useState("");
    const [resourceUpdate, setResourceUpdate] = useState(null);

    /**
     * Handles changes to the input fields for patient data and updates the state.
     * Filters input based on the field type to ensure data integrity.
     * @param {string} field - The field name to update.
     * @param {string} value - The new value for the field.
     */
    const handleChange = (field, value) => {
      if (field === "names" || field === "surnames") {
        const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
        setPatientData({ ...patientData, [field]: filteredValue });
      } else {
        setPatientData({ ...patientData, [field]: value });
      }
    };

    /**
     * Validates the patient data form before submission.
     * Ensures all required fields are filled.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const validateFormData = () => {
      const fields = ["names", "surnames", "birthDate"];
      if (patientData.cui.length !== 13) {
        setUpdateError("El CUI debe contener exactamente 13 caracteres.");
        return false;
      }
      for (let field of fields) {
        if (!patientData[field]) {
          setUpdateError(`El campo ${field} es obligatorio y no puede estar vacío.`);
          return false;
        }
      }
      if (patientData.sex === null) {
        setUpdateError(`El campo de género es obligatorio.`);
        return false;
      }
      return true;
    };

    /**
     * Handles changes to the gender radio buttons.
     * Updates the patient's gender in the state based on the selected option.
     * @param {boolean} isFemale - The selected gender.
     */
    const handleGenderChange = (isFemale) => {
      setPatientData({ ...patientData, sex: isFemale });
    };

    const errorPStyles = {
      fontFamily: fonts.textFont,
      fontSize: fontSize.textSize,
      color: colors.statusDenied,
    };

    /**
     * Submits the patient data to the server.
     */
    const handleSubmit = async () => {
      if (validateFormData()) {
        setResourceUpdate(WrapPromise(submitPatientData(patientData)));
      }
    };

    if (resourceUpdate !== null) {
      const response = resourceUpdate.read();
      setUpdateError("");
      if (response.error) {
        setUpdateError(`Lo sentimos! Ha ocurrido un error al enviar los datos!\n${response.error.toString()}`);
      } else {
        const id = response.result;
        setSelectedPatientId(id);
        navigate(NAV_PATHS.UPDATE_PATIENT, { replace: true });
      }

      setResourceUpdate(null);
    }

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
                <p
                  style={{
                    fontFamily: fonts.textFont,
                    fontSize: fontSize.textSize,
                    paddingBottom: "0.625rem",
                  }}
                >
                  CUI del paciente:
                </p>
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

                <p
                  style={{
                    fontFamily: fonts.textFont,
                    fontSize: fontSize.textSize,
                    paddingBottom: "0.625rem",
                    paddingTop: "1.25rem",
                  }}
                >
                  Ingrese el nombre del paciente:
                </p>

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
                      style={{
                        fontFamily: fonts.textFont,
                      }}
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

                <p
                  style={{
                    fontFamily: fonts.textFont,
                    fontSize: fontSize.textSize,
                    paddingBottom: "0.625rem",
                  }}
                >
                  Ingrese la fecha de nacimiento del paciente:
                </p>
                <DateInput
                  value={patientData.birthDate}
                  onChange={(e) => handleChange("birthDate", e.target.value)}
                  placeholder="Fecha de nacimiento"
                />
              </div>
              <p style={errorPStyles}>{updateError}</p>
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
                />
              </div>
            </div>
          </div>
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
        <Throbber loadingMessage="Actualizando información del paciente..." />
      </div>
    );
  };
  return (
    <Suspense fallback={<LoadingView />}>
      <Hijo />
    </Suspense>
  );
}
