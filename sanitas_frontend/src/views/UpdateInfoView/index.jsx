import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function UpdateInfoView() {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div>
      <h1>Actualizar información del paciente</h1>
      <div>Aquí se actualiza la información</div>
      <button type="button" onClick={handleBack}>
        Volver
      </button>
    </div>
  )
}
