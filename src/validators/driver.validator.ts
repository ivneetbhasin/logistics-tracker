import { z } from 'zod'

import { allowedRegions } from '../app/deliveryConstants'

export const driverSchema = z.object({
  driverID: z.coerce
    .number()
    .int()
    .positive(),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100),

  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(
      /^[0-9+\-\s()]+$/,
      'Invalid phone number'
    ),

  email: z
    .email('Invalid email address'),

  region: z.enum(allowedRegions),
})

export type DriverInput = z.infer<typeof driverSchema>