import {
  deliveryStatsSchema,
} from '../../validators/deliveryStatistics.validator'

describe('Delivery Stats Validator', () => {
  it('should validate valid query', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'delivery_rate',
        driverIds: '1,2',
        regions: 'north,south',
        startDate: '2026-05-01',
        endDate: '2026-05-07',
      })

    expect(result.success).toBe(true)
  })

  it('should reject invalid metric', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'speed',
      })

    expect(result.success).toBe(false)
  })

  it('should reject invalid region', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'delivery_rate',
        regions: 'central',
      })

    expect(result.success).toBe(false)
 })

  it('should reject invalid date range', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'delivery_rate',
        startDate: '2026-05-01',
        endDate: '2026-06-20',
      })

    expect(result.success).toBe(false)
  })
})