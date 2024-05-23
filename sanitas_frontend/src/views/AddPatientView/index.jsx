import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Defines the structure for patient data.
 * @typedef {Object} PatientData
 * @property {string} cui - Unique identifier for the patient.
 * @property {string} names - First and middle names of the patient.
 * @property {string} surnames - Last names of the patient.
 * @property {string} sex - Gender of the patient.
 * @property {string} birthDate - Birthdate of the patient.
 * @property {boolean} isNew - Indicates if the patient data is new or existing.
 */

/**
 * Component to check and fetch patient data by their CUI (Unique Identity Code).
 * This component allows users to input a CUI, check its existence, and either fetch existing data or register new data.
 */
export function AddPatientView() {
  const [cui, setCui] = useState('')
  const [patientData, setPatientData] = useState(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  /**
   * Checks if the patient's CUI exists in the system by making an API call.
   * Sets the patient data state and displays appropriate messages based on the API response.
   */
  const handleCheckCui = async () => {
    if (cui.length === 13) {
      try {
        const response = await fetch(`http://localhost:3000/check-cui/${cui}`)
        const data = await response.json()
        if (data.exists) {
          setMessage('¡Información del paciente encontrada!')
          setPatientData({ cui, isNew: false })
        } else {
          setPatientData({ cui, names: '', surnames: '', sex: '', birthDate: '', isNew: true })
          setMessage('No se encontró información. Por favor, registre al paciente.')
        }
      } catch (error) {
        setMessage('Error al verificar el CUI.')
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
        <PatientForm patientData={patientData} setPatientData={setPatientData} />
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
 * Component to display and edit patient data form.
 * This component provides input fields for each piece of patient data and handles data validation and submission.
 * @param {Object} props - Component props.
 * @param {PatientData} props.patientData - Patient data to be displayed and edited.
 * @param {(data: PatientData) => void} props.setPatientData - Function to update the patient data state.
 */
export function PatientForm({ patientData, setPatientData }) {
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
   * Makes a POST request with the patient data and handles the response.
   */
  const handleSubmit = async () => {
    if (validateFormData()) {
      try {
        const response = await fetch('http://localhost:3000/ficha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            CUI: patientData.cui,
            NOMBRES: patientData.names,
            APELLIDOS: patientData.surnames,
            SEXO: patientData.sex ? 'F' : 'M', // Asumiendo que "F" es true y "M" es false.
            FECHA_NACIMIENTO: patientData.birthDate,
          }),
        })

        const data = await response.json()
        if (response.ok) {
          alert('Información registrada con éxito')
          navigate('/update-view')
        } else {
          throw new Error(data.error || 'Error al registrar la información')
        }
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
