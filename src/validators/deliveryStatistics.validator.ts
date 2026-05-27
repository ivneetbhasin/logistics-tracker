import { z } from 'zod'

import { allowedRegions, metrics } from '../app/deliveryConstants'

export const deliveryStatsSchema = z
  .object({
    driverIds: z
      .string()
      .optional(),

    regions: z
      .string()
      .optional(),

    metric: z.enum(metrics),

    startDate: z
      .iso.date()
      .optional(),

    endDate: z
      .iso.date()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validate date range
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)

      if (start > end) {
        ctx.addIssue({
          code: 'custom',
          message:
            'startDate cannot be after endDate',
          path: ['startDate'],
        })
      }
    }

    // Validate regions list
    if (data.regions) {
      const regionList =
        data.regions.split(',')

      for (const region of regionList) {
        if (
          !allowedRegions.includes(
            region.trim() as typeof allowedRegions[number]
          )
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `Invalid region: ${region}`,
            path: ['regions'],
          })
        }
      }
    }

    // Validate driverIds
    if (data.driverIds) {
      const ids =
        data.driverIds.split(',')

console.log('driver ids ' + ids);

      for (const id of ids) {
        if (
          isNaN(Number(id.trim()))
        ) {
          ctx.addIssue({
            code: 'custom',
            message: `Invalid driver ID: ${id}`,
            path: ['driverIds'],
          })
        }
      }
    }
  })

export type DeliveryStatsQuery =
  z.infer<typeof deliveryStatsSchema>