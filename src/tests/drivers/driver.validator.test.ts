import {
  driverSchema,
} from '../../validators/driver.validator'

describe('Driver Validator', () => {
  it('should validate valid driver', () => {
    const result = driverSchema.safeParse({
      driver_id: 1,
      name: 'John Doe',
      phone: '123456789',
      email: 'john@test.com',
      region: 'north',
    })

    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = driverSchema.safeParse({
      driver_id: 1,
      name: 'John Doe',
      phone: '123456789',
      email: 'bad-email',
      region: 'north',
    })

    expect(result.success).toBe(false)
  })

  it('should reject invalid region', () => {
    const result = driverSchema.safeParse({
      driver_id: 1,
      name: 'John Doe',
      phone: '123456789',
      email: 'john@test.com',
      region: 'central',
    })

    expect(result.success).toBe(false)
  })

  it('should reject negative driver id', () => {
    const result = driverSchema.safeParse({
      driver_id: -1,
      name: 'John Doe',
      phone: '123456789',
      email: 'john@test.com',
      region: 'north',
    })

    expect(result.success).toBe(false)
  })
})