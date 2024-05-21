import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * @typedef {Object} PatientData
 * @property {string} cui
 * @property {string} names
 * @property {string} surnames
 * @property {string} sex
 * @property {string} birthDate
 * @property {boolean} isNew
 */

/**
 * @typedef {Object} CheckCUIProps
 * @property {(cui: string) => Promise<PatientData>} foundUserData
 * @property {() => any} useStore
 */

/**
 * Component to check and fetch patient data by CUI.
 * @param {CheckCUIProps} props
 */

export function CheckCUI({ foundUserData, useStore }) {
  const [cui, setCui] = useState('')
  const [patientData, setPatientData] = useState(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleCheckCui = () => {
    if (cui.length === 13) {
      foundUserData(cui)
        .then((patient) => {
          if (Object.keys(patient).length > 0) {
            setMessage('¡Información del paciente encontrada!')
            setPatientData({ ...patient, isNew: false })
          } else {
            setPatientData({ cui, names: '', surnames: '', sex: '', birthDate: '', isNew: true })
            setMessage('No se encontró información. Por favor, registre al paciente.')
          }
        })
        .catch((error) => {
          setMessage('Error al buscar datos del paciente.')
        })
    } else {
      alert('El CUI debe contener exactamente 13 dígitos.')
    }
  }

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
 * @typedef {Object} PatientFormProps
 * @property {PatientData} patientData
 * @property {(data: PatientData) => void} setPatientData
 */

/**
 * Component to display and edit patient data form.
 * @param {PatientFormProps} props
 */

export function PatientForm({ patientData, setPatientData }) {
  const navigate = useNavigate()

  if (!patientData) return null

  /**
   * Handles the change of input fields and updates the patient data state.
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
   * Validates the form data.
   * @returns {boolean} - Returns true if the data is valid, otherwise false.
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

  const handleSubmit = () => {
    if (validateFormData()) {
      if (patientData.isNew) {
        navigate('/update-view')
      }
    }
  }

  /**
   * Handles the gender checkbox change.
   * @param {string} gender - The gender to set.
   */
  const handleGenderChange = (gender) => {
    if (
      (gender === 'Femenino' && patientData.sex) ||
      (gender === 'Masculino' && !patientData.sex)
    ) {
      setPatientData({ ...patientData, sex: null })
    } else {
      setPatientData({ ...patientData, sex: gender === 'Femenino' })
    }
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
            type="checkbox"
            checked={patientData.sex === false}
            onChange={() => handleGenderChange('Masculino')}
          />{' '}
          Masculino
        </label>
        <label>
          <input
            type="checkbox"
            checked={patientData.sex === true}
            onChange={() => handleGenderChange('Femenino')}
          />{' '}
          Femenino
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
