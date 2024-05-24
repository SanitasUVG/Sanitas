import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * @typedef {Object} PatientData
 * @property {string} cui - Unique identifier for the patient.
 * @property {string} names - First and middle names of the patient.
 * @property {string} surnames - Last names of the patient.
 * @property {string} sex - Gender of the patient.
 * @property {string} birthDate - Birthdate of the patient.
 * @property {boolean} isNew - Indicates if the patient data is new or existing.
 */

/**
 * @typedef {Object} AddPatientViewProps
 * @property {function(string): Promise<Object>} checkCui - Function to check existence of a CUI.
 * @property {function(PatientData): Promise<void>} submitPatientData - Function to submit patient data.
 */

export function AddPatientView({ checkCui, submitPatientData }) {
  const [cui, setCui] = useState('')
  const [patientData, setPatientData] = useState(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  /**
   * Checks if the patient's CUI exists in the system.
   * Sets the patient data state and displays appropriate messages based on the API response.
   */
  const handleCheckCui = async () => {
    if (cui.length === 13) {
      try {
        const data = await checkCui(cui)
        if (data.exists) {
          setMessage('¡Información del paciente encontrada!')
          setPatientData({ cui, isNew: false })
        } else {
          setPatientData({ cui, names: '', surnames: '', sex: '', birthDate: '', isNew: true })
          setMessage('No se encontró información. Por favor, registre al paciente.')
        }
      } catch (error) {
        setMessage('Error al verificar el CUI. ' + error.message)
      }
    } else {
      alert('El CUI debe contener exactamente 13 dígitos.')
    }
  }

  /**
   * Handles changes to the CUI input field.
   * Filters non-numeric input and limits the length to 13 characters.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The event emitted by the input field.
   */
  const handleCuiInput = (e) => {
    const input = e.target.value
    const filteredInput = input.replace(/[^0-9]/g, '').slice(0, 13)
    setCui(filteredInput)
  }
  return (
    <div>
      <h1>Sanitas</h1>
      <input type="text" value={cui} onChange={handleCuiInput} placeholder="Ingrese el CUI" />
      <button type="button" onClick={handleCheckCui}>
        Ver paciente
      </button>
      {message && <div>{message}</div>}
      {patientData && patientData.isNew && (
        <PatientForm
          patientData={patientData}
          setPatientData={setPatientData}
          submitPatientData={submitPatientData}
        />
      )}
      {patientData && !patientData.isNew && (
        <button type="button" onClick={() => navigate('/update-view')}>
          Ir a Actualizar Datos
        </button>
      )}
    </div>
  )
}

/**
 * Form component to display and manage input for patient data.
 * Handles data validation and submission to server for registration or updates.
 * @param {Object} props - Component props.
 * @param {PatientData} props.patientData - Data for a single patient.
 * @param {function(PatientData): void} props.setPatientData - Function to update the patient data state.
 * @param {function(PatientData): Promise<void>} props.submitPatientData - Function to submit patient data to the server.
 */
export function PatientForm({ patientData, setPatientData, submitPatientData }) {
  const navigate = useNavigate()

  if (!patientData) return null

  /**
   * Handles changes to the input fields for patient data and updates the state.
   * Filters input based on the field type to ensure data integrity.
   * @param {string} field - The field name to update.
   * @param {string} value - The new value of the field.
   */
  const handleChange = (field, value) => {
    if (field === 'names' || field === 'surnames') {
      const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '')
      setPatientData({ ...patientData, [field]: filteredValue })
    } else {
      setPatientData({ ...patientData, [field]: value })
    }
  }

  /**
   * Validates the patient data form before submission.
   * Ensures all required fields are filled.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateFormData = () => {
    const fields = ['names', 'surnames', 'sex', 'birthDate']
    for (let field of fields) {
      if (!patientData[field]) {
        alert(`El campo ${field} es obligatorio y no puede estar vacío.`)
        return false
      }
    }
    return true
  }

  /**
   * Submits the patient data to the server.
   */
  const handleSubmit = async () => {
    if (validateFormData()) {
      try {
        await submitPatientData(patientData)
        alert('Información registrada con éxito')
        navigate('/update-view')
      } catch (error) {
        alert(`Error al enviar datos: ${error.message}`)
      }
    }
  }

  /**
   * Handles changes to the gender radio buttons.
   * Updates the patient's gender in the state based on the selected option.
   * @param {string} gender - The selected gender.
   */
  const handleGenderChange = (gender) => {
    setPatientData({ ...patientData, sex: gender })
  }

  return (
    <div>
      <input
        type="text"
        value={patientData.names}
        onChange={(e) => handleChange('names', e.target.value)}
        placeholder="Nombres"
      />
      <input
        type="text"
        value={patientData.surnames}
        onChange={(e) => handleChange('surnames', e.target.value)}
        placeholder="Apellidos"
      />
      <div>
        <label>
          <input
            type="radio"
            name="gender"
            checked={patientData.sex === 'F'}
            onChange={() => handleGenderChange('F')}
          />
          Femenino
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            checked={patientData.sex === 'M'}
            onChange={() => handleGenderChange('M')}
          />
          Masculino
        </label>
      </div>
      <input
        type="date"
        value={patientData.birthDate}
        onChange={(e) => handleChange('birthDate', e.target.value)}
        placeholder="Fecha de nacimiento"
      />
      <button type="button" onClick={handleSubmit}>
        Registrar información
      </button>
    </div>
  )
}
