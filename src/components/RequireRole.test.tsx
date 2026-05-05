import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RequireRole from './RequireRole'

const apiJsonMock = vi.fn()
const getTokenMock = vi.fn()
const clearTokenMock = vi.fn()

vi.mock('../api', () => ({
  apiJson: (...args: unknown[]) => apiJsonMock(...args),
  getToken: () => getTokenMock(),
  clearToken: () => clearTokenMock(),
}))

describe('RequireRole', () => {
  beforeEach(() => {
    apiJsonMock.mockReset()
    getTokenMock.mockReset()
    clearTokenMock.mockReset()
  })

  it('renders children for matching role', async () => {
    getTokenMock.mockReturnValue('token')
    apiJsonMock.mockResolvedValue({ user: { role: 'admin' } })
    render(
      <MemoryRouter>
        <RequireRole role="admin" redirectTo="/app/admin/login">
          <div>Protected</div>
        </RequireRole>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Protected')).toBeInTheDocument())
  })
})
