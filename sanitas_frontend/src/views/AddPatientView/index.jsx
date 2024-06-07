import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Button from "src/components/Button/index";
import { BaseInput, DateInput, RadioInput } from "src/components/Input/index";
import { NAV_PATHS } from "src/router";

/**
 * @typedef {Object} PatientData
 * @property {string} cui - Unique identifier for the patient.
 * @property {string} names - First and middle names of the patient.
 * @property {string} surnames - Last names of the patient.
 * @property {string} isWoman - Gender of the patient.
 * @property {string} birthDate - Birthdate of the patient.
 * @property {boolean} isNew - Indicates if the patient data is new or existing.
 */

/**
 * Component for adding new patients.
 * Uses navigation state to pre-fill the CUI if available.
 *
 * @param {AddPatientViewProps} props - Component properties.
 * @param {function(PatientData): Promise<void>} props.submitPatientData - Function to submit patient data.
 */
export function AddPatientView({ submitPatientData }) {
  const location = useLocation();
  const [patientData, setPatientData] = useState({
    cui: "",
    names: "",
    surnames: "",
    isWoman: "",
    birthDate: "",
  });

  useEffect(() => {
    if (location.state?.cui) {
      setPatientData((prev) => ({ ...prev, cui: location.state.cui }));
    }
  }, [location.state?.cui]);

  return (
    <div>
      <h1>Información del paciente</h1>
      <h3>Por favor, registre al paciente</h3>
      <PatientForm
        patientData={patientData}
        setPatientData={setPatientData}
        submitPatientData={submitPatientData}
      />
    </div>
  );
}

/**
 * Form component for displaying and managing input for patient data.
 * Handles data validation and submission to the server for registration or updates.
 *
 * @param {Object} props - Component properties.
 * @param {PatientData} props.patientData - Current data for a single patient.
 * @param {function(PatientData): void} props.setPatientData - Function to update the state with patient data.
 * @param {function(PatientData): Promise<void>} props.submitPatientData - Function to submit patient data to the server.
 */
export function PatientForm({ patientData, setPatientData, submitPatientData }) {
  const navigate = useNavigate();

  if (!patientData) return null;

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
      alert("El CUI debe contener exactamente 13 caracteres.");
      return false;
    }
    for (let field of fields) {
      if (!patientData[field]) {
        alert(`El campo ${field} es obligatorio y no puede estar vacío.`);
        return false;
      }
    }
    if (patientData.isWoman === undefined) {
      alert(`El campo de género es obligatorio.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (validateFormData()) {
      try {
        const id = await submitPatientData(patientData);
        alert("¡Información registrada con éxito!");
        navigate(NAV_PATHS.UPDATE_PATIENT, { state: { id } });
      } catch (error) {
        alert(`Error al enviar datos: ${error.message}`);
      }
    }
  };

  /**
   * Handles changes to the gender radio buttons.
   * Updates the patient's gender in the state based on the selected option.
   * @param {boolean} isFemale - The selected gender.
   */
  const handleGenderChange = (isFemale) => {
    setPatientData({ ...patientData, isWoman: isFemale });
  };

  return (
    <div>
      <p>CUI del paciente:</p>
      <BaseInput
        type="text"
        value={patientData.cui}
        onChange={(e) => handleChange("cui", e.target.value)}
        placeholder="CUI"
        style={{ borderColor: patientData.cui.length === 13 ? "green" : "red" }}
      />
      {patientData.cui.length !== 13 && (
        <div style={{ color: "red", fontSize: "0.8rem" }}>
          El CUI debe contener exactamente 13 caracteres.
        </div>
      )}

      <p>Ingrese el nombre del paciente:</p>
      <BaseInput
        type="text"
        value={patientData.names}
        onChange={(e) => handleChange("names", e.target.value)}
        placeholder="Nombres"
      />
      <BaseInput
        type="text"
        value={patientData.surnames}
        onChange={(e) => handleChange("surnames", e.target.value)}
        placeholder="Apellidos"
      />
      <div>
        <RadioInput
          name="gender"
          checked={patientData.isWoman === true}
          onChange={() => handleGenderChange(true)}
          label="Femenino"
        />
        <RadioInput
          name="gender"
          checked={patientData.isWoman === false}
          onChange={() => handleGenderChange(false)}
          label="Masculino"
        />
      </div>

      <p>Ingrese la fecha de nacimiento del paciente:</p>
      <DateInput
        value={patientData.birthDate}
        onChange={(e) => handleChange("birthDate", e.target.value)}
        placeholder="Fecha de nacimiento"
      />
      <Button text="Registrar información" onClick={handleSubmit} />
    </div>
  );
}
