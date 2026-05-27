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

  it('should reject when startDate is after endDate', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'delivery_rate',
        startDate: '2026-05-10',
        endDate: '2026-05-01',
      })

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('startDate cannot be after endDate')
    }
  })

  it('should allow when startDate equals endDate', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'delivery_rate',
        startDate: '2026-05-01',
        endDate: '2026-05-01',
      })

    expect(result.success).toBe(true)
  })

  it('should allow when startDate is before endDate', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'delivery_rate',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
      })

    expect(result.success).toBe(true)
  })

  it('should reject non-numeric driver ID', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'total_packages',
        driverIds: 'abc',
      })

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Invalid driver ID: abc')
    }
  })

  it('should reject mixed valid and invalid driver IDs', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'total_packages',
        driverIds: '1,abc,3',
      })

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Invalid driver ID: abc')
    }
  })

  it('should allow valid numeric driver IDs', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'total_packages',
        driverIds: '1,2,3',
      })

    expect(result.success).toBe(true)
  })

  it('should reject date range exceeding 31 days', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'total_packages',
        startDate: '2026-05-01',
        endDate: '2026-06-02',
      })

    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Date range cannot exceed 31 days')
    }
  })

  it('should allow date range of exactly 31 days', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'total_packages',
        startDate: '2026-05-01',
        endDate: '2026-06-01',
      })

    expect(result.success).toBe(true)
  })

  it('should allow date range under 31 days', () => {
    const result =
      deliveryStatsSchema.safeParse({
        metric: 'total_packages',
        startDate: '2026-05-01',
        endDate: '2026-05-20',
      })

    expect(result.success).toBe(true)
  })
})
