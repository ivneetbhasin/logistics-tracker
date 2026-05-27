import { NextRequest } from 'next/server'
import { GET } from '../../app/api/delivery-statistics/route'

const mockIn = jest.fn().mockReturnThis()
const mockResult = jest.fn()

jest.mock('../../lib/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        gte: jest.fn(() => ({
          lte: jest.fn(() => ({
            in: mockIn,
            then: (resolve: (val: unknown) => void) => resolve(mockResult()),
          })),
        })),
      })),
    })),
  },
}))

function createRequest(params: Record<string, string>): NextRequest {
  const url = new URL('http://localhost/api/delivery-statistics')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return new NextRequest(url)
}

describe('GET /api/delivery-statistics', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIn.mockReturnThis()
  })

  it('should return 400 for invalid metric', async () => {
    const req = createRequest({ metric: 'invalid_metric' })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.errors).toBeDefined()
  })

  it('should return 400 when startDate is after endDate', async () => {
    const req = createRequest({
      metric: 'total_packages',
      startDate: '2026-05-10',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('should return 400 for invalid region', async () => {
    const req = createRequest({
      metric: 'total_packages',
      regions: 'central',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('should return 400 for non-numeric driverIds', async () => {
    const req = createRequest({
      metric: 'total_packages',
      driverIds: 'abc',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('should return total_packages count', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'failed', event_timestamp: '2026-05-01T11:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'total_packages',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.result).toBe(2)
  })

  it('should count unique packages for total_packages', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'picked_up', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T12:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'total_packages',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(1)
  })

  it('should compute delivery_rate', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'failed', event_timestamp: '2026-05-01T11:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'delivery_rate',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(50)
  })

  it('should compute failure_rate', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 2, status: 'failed', event_timestamp: '2026-05-01T11:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'failure_rate',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(50)
  })

  it('should compute avg_deliveries_per_day', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'delivered', event_timestamp: '2026-05-02T10:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'avg_deliveries_per_day',
      startDate: '2026-05-01',
      endDate: '2026-05-02',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(1)
  })

  it('should return 0 when no data exists', async () => {
    mockResult.mockReturnValue({ data: [], error: null })

    const req = createRequest({
      metric: 'delivery_rate',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(0)
  })

  it('should return 500 on supabase error', async () => {
    mockResult.mockReturnValue({ data: null, error: { message: 'DB error' } })

    const req = createRequest({
      metric: 'total_packages',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe('DB error')
  })

  it('should default startDate and endDate to today when not provided', async () => {
    const today = new Date().toISOString().split('T')[0]
    const supabase = (await import('../../lib/supabase')).default
    mockResult.mockReturnValue({ data: [], error: null })

    const req = createRequest({ metric: 'total_packages' })
    await GET(req)

    const fromCall = (supabase.from as jest.Mock).mock.results[0].value
    const selectCall = fromCall.select.mock.results[0].value
    const gteCall = selectCall.gte

    expect(gteCall).toHaveBeenCalledWith('event_timestamp', `${today}T00:00:00`)
    const lteCall = gteCall.mock.results[0].value.lte
    expect(lteCall).toHaveBeenCalledWith('event_timestamp', `${today}T23:59:59`)
  })

  it('should use provided startDate and endDate instead of today', async () => {
    const supabase = (await import('../../lib/supabase')).default
    mockResult.mockReturnValue({ data: [], error: null })

    const req = createRequest({
      metric: 'total_packages',
      startDate: '2026-03-15',
      endDate: '2026-03-20',
    })
    await GET(req)

    const fromCall = (supabase.from as jest.Mock).mock.results[0].value
    const selectCall = fromCall.select.mock.results[0].value
    const gteCall = selectCall.gte

    expect(gteCall).toHaveBeenCalledWith('event_timestamp', '2026-03-15T00:00:00')
    const lteCall = gteCall.mock.results[0].value.lte
    expect(lteCall).toHaveBeenCalledWith('event_timestamp', '2026-03-20T23:59:59')
  })

  it('should default metric to total_packages when not provided', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.result).toBe(1)
  })

  it('should return 500 with error message on unexpected error', async () => {
    const req = {
      url: 'not-a-valid-url',
    } as unknown as NextRequest

    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBeDefined()
  })

  it('should filter by driverIds', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'total_packages',
      driverIds: '1,2',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockIn).toHaveBeenCalledWith('driverID', [1, 2])
  })

  it('should filter by regions', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'total_packages',
      regions: 'north,south',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockIn).toHaveBeenCalledWith('drivers.region', ['north', 'south'])
  })

  it('should filter by both driverIds and regions', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'total_packages',
      driverIds: '3',
      regions: 'east',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockIn).toHaveBeenCalledWith('driverID', [3])
    expect(mockIn).toHaveBeenCalledWith('drivers.region', ['east'])
  })

  it('should not call .in() when no driverIds or regions provided', async () => {
    mockResult.mockReturnValue({
      data: [],
      error: null,
    })

    const req = createRequest({
      metric: 'total_packages',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)

    expect(response.status).toBe(200)
    expect(mockIn).not.toHaveBeenCalled()
  })

  it('should return failure_rate as 0 when no packages exist', async () => {
    mockResult.mockReturnValue({ data: [], error: null })

    const req = createRequest({
      metric: 'failure_rate',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(0)
  })

  it('should compute failure_rate with multiple statuses', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'failed', event_timestamp: '2026-05-01T11:00:00' },
        { package_id: 'PKG-3', driverID: 1, status: 'failed', event_timestamp: '2026-05-01T12:00:00' },
        { package_id: 'PKG-4', driverID: 1, status: 'in_transit', event_timestamp: '2026-05-01T13:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'failure_rate',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(50)
  })

  it('should return avg_deliveries_per_day as 0 when no packages exist', async () => {
    mockResult.mockReturnValue({ data: [], error: null })

    const req = createRequest({
      metric: 'avg_deliveries_per_day',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(0)
  })

  it('should compute avg_deliveries_per_day over multiple days', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'delivered', event_timestamp: '2026-05-02T10:00:00' },
        { package_id: 'PKG-3', driverID: 1, status: 'delivered', event_timestamp: '2026-05-03T10:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'avg_deliveries_per_day',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(1)
  })

  it('should return generic error message when non-Error is thrown', async () => {
    const originalURL = global.URL
    const mockURL = jest.fn().mockImplementation(() => { throw 'string error' })
    global.URL = mockURL as unknown as typeof URL

    const req = { url: 'http://localhost/api/delivery-statistics' } as unknown as NextRequest
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe('failed')

    global.URL = originalURL
  })

  it('should only count delivered events for avg_deliveries_per_day', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'failed', event_timestamp: '2026-05-01T11:00:00' },
        { package_id: 'PKG-3', driverID: 1, status: 'in_transit', event_timestamp: '2026-05-02T10:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'avg_deliveries_per_day',
      startDate: '2026-05-01',
      endDate: '2026-05-02',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(0.5)
  })

  it('should compute avg_deliveries_per_day for a single day', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T11:00:00' },
        { package_id: 'PKG-3', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T12:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'avg_deliveries_per_day',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.result).toBe(3)
  })

  it('should return Error message in catch block when Error is thrown', async () => {
    const originalURL = global.URL
    const mockURL = jest.fn().mockImplementation(() => { throw new Error('something broke') })
    global.URL = mockURL as unknown as typeof URL

    const req = { url: 'http://localhost/api/delivery-statistics' } as unknown as NextRequest
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.success).toBe(false)
    expect(body.error).toBe('something broke')

    global.URL = originalURL
  })

  it('should return avg_deliveries_per_day with days=1 when startDate equals endDate', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T14:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'avg_deliveries_per_day',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    // days = (0 / 86400000) + 1 = 1, result = 2 / 1 = 2
    expect(body.result).toBe(2)
  })

  it('should return fractional avg_deliveries_per_day over a 7-day range', async () => {
    mockResult.mockReturnValue({
      data: [
        { package_id: 'PKG-1', driverID: 1, status: 'delivered', event_timestamp: '2026-05-01T10:00:00' },
        { package_id: 'PKG-2', driverID: 1, status: 'delivered', event_timestamp: '2026-05-03T10:00:00' },
        { package_id: 'PKG-3', driverID: 1, status: 'delivered', event_timestamp: '2026-05-05T10:00:00' },
      ],
      error: null,
    })

    const req = createRequest({
      metric: 'avg_deliveries_per_day',
      startDate: '2026-05-01',
      endDate: '2026-05-07',
    })
    const response = await GET(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    // days = 7, deliveredCount = 3, result = 3/7
    expect(body.result).toBeCloseTo(3 / 7)
  })
})
