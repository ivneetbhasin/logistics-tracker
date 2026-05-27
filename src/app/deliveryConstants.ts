export const allowedRegions = [
  'north',
  'south',
  'east',
  'west',
] as const

export const metrics = [
  'total_packages',
  'delivery_rate',
  'failure_rate',
  'avg_deliveries_per_day',
] as const

export const deliveryStatuses = [
  'picked_up',
  'in_transit',
  'delivered',
  'failed',
  'returned',
] as const