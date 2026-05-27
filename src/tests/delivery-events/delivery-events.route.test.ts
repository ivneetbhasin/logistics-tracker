import { NextRequest } from 'next/server'
import { POST } from '../../app/api/delivery-events/route'

const mockSelect = jest.fn()
const mockInsert = jest.fn(() => ({ select: mockSelect }))
const mockSingle = jest.fn()
const mockEq = jest.fn(() => ({ single: mockSingle }))
const mockDriverSelect = jest.fn(() => ({ eq: mockEq }))

jest.mock('../../lib/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn((table: string) => {
      if (table === 'drivers') {
        return { select: mockDriverSelect }
      }
      return { insert: mockInsert }
    }),
  },
}))

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/delivery-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const validEvent = {
  packageId: 'PKG-001',
  driverID: 1,
  status: 'delivered',
  timestamp: '2024-01-01T12:00:00Z',
}

describe('POST /api/delivery-events', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSingle.mockResolvedValue({ data: { driverID: 1 }, error: null })
    mockSelect.mockResolvedValue({ data: [{ id: 1 }], error: null })
  })

  it('should return 400 for invalid request body', async () => {
    const req = createRequest({ packageId: '', driverID: -1, status: 'invalid', timestamp: 'bad' })
    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.errors).toBeDefined()
  })

  it('should return 404 when driver does not exist', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })

    const req = createRequest(validEvent)
    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Driver 1 not found')
  })

  it('should return 500 when insert fails', async () => {
    mockSelect.mockResolvedValue({ data: null, error: { message: 'Insert failed' } })

    const req = createRequest(validEvent)
    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Insert failed')
  })

  it('should return success when event is created', async () => {
    const req = createRequest(validEvent)
    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
  })

  it('should return 500 with "Failed to create event" on unexpected error', async () => {
    const req = {
      json: async () => { throw new Error('unexpected') },
    } as unknown as NextRequest

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Failed to create event')
  })
})
