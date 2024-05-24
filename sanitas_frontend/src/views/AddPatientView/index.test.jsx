import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { AddPatientView } from '../AddPatientView/index'

describe('AddPatientView tests', () => {
  test('Check CUI with invalid length shows alert', () => {
    window.alert = vi.fn()
    const checkCui = vi.fn()
    render(
      <MemoryRouter>
        <AddPatientView checkCui={checkCui} submitPatientData={() => {}} />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Ingrese el CUI')
    fireEvent.change(input, { target: { value: '123' } })
    const button = screen.getByText('Ver paciente')
    fireEvent.click(button)

    expect(window.alert).toHaveBeenCalledWith('El CUI debe contener exactamente 13 dígitos.')
    expect(checkCui).not.toHaveBeenCalled()
  })

  test('Valid CUI triggers checkCui function', async () => {
    const checkCui = vi.fn().mockResolvedValue({ exists: true })
    const submitPatientData = vi.fn()
    render(
      <MemoryRouter>
        <AddPatientView checkCui={checkCui} submitPatientData={submitPatientData} />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Ingrese el CUI')
    fireEvent.change(input, { target: { value: '1234567890123' } })
    const button = screen.getByText('Ver paciente')
    fireEvent.click(button)

    await vi.waitFor(() => expect(checkCui).toHaveBeenCalledWith('1234567890123'))

    await waitFor(() => {
      expect(screen.getByText('¡Información del paciente encontrada!')).toBeVisible()
    })
  })

  test('Displays error message when CUI check fails', async () => {
    const errorMessage = 'Error de conexión'
    const checkCui = vi.fn().mockRejectedValue(new Error(errorMessage))
    render(
      <MemoryRouter>
        <AddPatientView checkCui={checkCui} submitPatientData={() => {}} />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Ingrese el CUI')
    fireEvent.change(input, { target: { value: '1234567890123' } })
    const button = screen.getByText('Ver paciente')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(`Error al verificar el CUI. ${errorMessage}`)).toBeVisible()
    })
  })

  test('CUI input only allows numeric characters and limits to 13 digits', () => {
    render(
      <MemoryRouter>
        <AddPatientView checkCui={() => {}} submitPatientData={() => {}} />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Ingrese el CUI')
    fireEvent.change(input, { target: { value: 'abc1234567890123456' } })
    expect(input.value).toBe('1234567890123')
  })

  test('Shows new patient form when CUI does not exist', async () => {
    const checkCui = vi.fn().mockResolvedValue({ exists: false })
    render(
      <MemoryRouter>
        <AddPatientView checkCui={checkCui} submitPatientData={() => {}} />
      </MemoryRouter>,
    )

    const input = screen.getByPlaceholderText('Ingrese el CUI')
    fireEvent.change(input, { target: { value: '1234567890123' } })
    const button = screen.getByText('Ver paciente')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Registrar información')).toBeVisible()
      expect(
        screen.getByText('No se encontró información. Por favor, registre al paciente.'),
      ).toBeVisible()
    })
  })
})
