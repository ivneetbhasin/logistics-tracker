import { z } from 'zod'

import { deliveryStatuses } from '../app/deliveryConstants'

export const deliveryEventSchema = z.object({
  packageId: z
    .string()
    .min(1, 'Package ID is required')
    .max(100),

  driverID: z.coerce
    .number()
    .int()
    .positive(),

  status: z.enum(deliveryStatuses),

  timestamp: z.iso.datetime({ message: 'Invalid ISO timestamp' }),
})

export type DeliveryEventInput = z.infer<
  typeof deliveryEventSchema
>