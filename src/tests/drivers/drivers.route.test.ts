import { NextRequest } from 'next/server'
import { POST } from '../../app/api/drivers/route'

jest.mock('../../lib/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      upsert: jest.fn(() => ({
        select: jest.fn(() =>
          Promise.resolve({ data: [{ driverID: 1 }], error: null })
        ),
      })),
    })),
  },
}))

function createCSVRequest(content: string, filename = 'drivers.csv'): NextRequest {
  const file = new File([content], filename, { type: 'text/csv' })
  const formData = new FormData()
  formData.append('drivers', file)

  return new NextRequest('http://localhost/api/drivers', {
    method: 'POST',
    body: formData,
  })
}

describe('POST /api/drivers', () => {
  it('should return 400 if no file is provided', async () => {
    const formData = new FormData()
    const req = new NextRequest('http://localhost/api/drivers', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(req)
    expect(response.status).toBe(400)
  })

  it('should return 400 if file is not a CSV', async () => {
    const file = new File(['data'], 'drivers.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('drivers', file)

    const req = new NextRequest('http://localhost/api/drivers', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Only CSV files are allowed')
  })

  it('should successfully upload valid CSV', async () => {
    const csv = `driverID,name,phone,email,region\n1,John Doe,123456789,john@test.com,north`
    const req = createCSVRequest(csv)

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.count).toBe(1)
  })

  it('should return validation errors for invalid rows', async () => {
    const csv = `driverID,name,phone,email,region\nabc,J,12,bad-email,central`
    const req = createCSVRequest(csv)

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.count).toBe(0)
  })

  it('should handle multiple valid rows', async () => {
    const csv = `driverID,name,phone,email,region\n1,John Doe,123456789,john@test.com,north\n2,Jane Doe,987654321,jane@test.com,south`
    const req = createCSVRequest(csv)

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.count).toBe(2)
  })

  it('should return 500 with Supabase error message when upsert fails', async () => {
    const { default: supabase } = await import('../../lib/supabase')
    ;(supabase.from as jest.Mock).mockReturnValueOnce({
      upsert: jest.fn(() => ({
        select: jest.fn(() =>
          Promise.resolve({ data: null, error: { message: 'Database connection failed' } })
        ),
      })),
    })

    const csv = `driverID,name,phone,email,region\n1,John Doe,123456789,john@test.com,north`
    const req = createCSVRequest(csv)

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Database connection failed')
  })

  it('should return 500 with "Upload failed" when an unexpected error is thrown', async () => {
    const req = {
      formData: async () => { throw new Error('unexpected') },
    } as unknown as NextRequest

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Upload failed')
  })
})
