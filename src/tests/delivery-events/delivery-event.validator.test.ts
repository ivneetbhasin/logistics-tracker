import {
  deliveryEventSchema,
} from '../../validators/deliveryEvent.validator'

describe('Delivery Event Validator', () => {
  it('should validate valid event', () => {
    const result =
      deliveryEventSchema.safeParse({
        packageId: 'PKG-1',
        driverID: 1,
        status: 'delivered',
        timestamp:
          '2026-05-26T10:00:00Z',
      })

    expect(result.success).toBe(true)
  })

  it('should reject invalid status', () => {
    const result =
      deliveryEventSchema.safeParse({
        packageId: 'PKG-1',
        driverID: 1,
        status: 'shipping',
        timestamp:
          '2026-05-26T10:00:00Z',
      })

    expect(result.success).toBe(false)
  })

  it('should reject invalid timestamp', () => {
    const result =
      deliveryEventSchema.safeParse({
        packageId: 'PKG-1',
        driverID: 1,
        status: 'delivered',
        timestamp: 'invalid-date',
      })

    expect(result.success).toBe(false)
  })
})