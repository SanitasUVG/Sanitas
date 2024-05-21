// src/tests/CheckCUIAndPatientForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { CheckCUI, PatientForm } from './index'

describe('CheckCUI Component', () => {
  const foundUserDataMock = vi.fn((cui) =>
    cui === '1234567890123'
      ? Promise.resolve({
          names: 'Juan',
          surnames: 'Pérez',
          sex: 'Masculino',
          birthDate: '1990-01-01',
        })
      : Promise.resolve({}),
  )

  it('should display an error message if CUI is not 13 digits', () => {
    window.alert = vi.fn()
    render(
      <MemoryRouter>
        <CheckCUI foundUserData={foundUserDataMock} useStore={() => {}} />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Ingrese el CUI')
    fireEvent.change(input, { target: { value: '123' } })
    fireEvent.click(screen.getByText('Ver paciente'))

    expect(window.alert).toHaveBeenCalledWith('El CUI debe contener exactamente 13 dígitos.')
  })

  it('should display patient information if CUI is found', async () => {
    render(
      <MemoryRouter>
        <CheckCUI foundUserData={foundUserDataMock} useStore={() => {}} />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Ingrese el CUI')
    fireEvent.change(input, { target: { value: '1234567890123' } })
    fireEvent.click(screen.getByText('Ver paciente'))

    expect(await screen.findByText('¡Información del paciente encontrada!')).toBeInTheDocument()
  })

  it('should display a registration message if CUI is not found', async () => {
    render(
      <MemoryRouter>
        <CheckCUI foundUserData={foundUserDataMock} useStore={() => {}} />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Ingrese el CUI')
    fireEvent.change(input, { target: { value: '9876543210987' } })
    fireEvent.click(screen.getByText('Ver paciente'))

    expect(
      await screen.findByText('No se encontró información. Por favor, registre al paciente.'),
    ).toBeInTheDocument()
  })
})

describe('PatientForm Component', () => {
  const patientDataMock = {
    names: 'Juan',
    surnames: 'Pérez',
    sex: 'Masculino',
    birthDate: '1990-01-01',
    isNew: true,
  }

  const setPatientDataMock = vi.fn()

  it('should display input fields with correct initial values', () => {
    render(
      <MemoryRouter>
        <PatientForm patientData={patientDataMock} setPatientData={setPatientDataMock} />
      </MemoryRouter>,
    )

    expect(screen.getByPlaceholderText('Nombres').value).toBe('Juan')
    expect(screen.getByPlaceholderText('Apellidos').value).toBe('Pérez')
    expect(screen.getByPlaceholderText('Fecha de nacimiento').value).toBe('1990-01-01')
  })

  it('should update patient data on input change', () => {
    render(
      <MemoryRouter>
        <PatientForm patientData={patientDataMock} setPatientData={setPatientDataMock} />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Nombres'), { target: { value: 'Carlos' } })
    fireEvent.change(screen.getByPlaceholderText('Apellidos'), { target: { value: 'Sánchez' } })

    expect(setPatientDataMock).toHaveBeenCalledWith(expect.objectContaining({ names: 'Carlos' }))
    expect(setPatientDataMock).toHaveBeenCalledWith(
      expect.objectContaining({ surnames: 'Sánchez' }),
    )
  })
})
