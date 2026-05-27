import { NextRequest, NextResponse } from "next/server";
import  supabase  from "../../../lib/supabase";

import{
  deliveryStatsSchema,
  DeliveryStatsQuery
} from '../../../validators/deliveryStatistics.validator';

export async function GET(req: NextRequest) {
 try {
    const { searchParams } = new URL(req.url)

    const queryParams = {
      driverIds:
        searchParams.get('driverIds') ||
        undefined,

      regions:
        searchParams.get('regions') ||
        undefined,

      metric:
        searchParams.get('metric') ||
        'total_packages',

      startDate:
        searchParams.get('startDate') ||
        undefined,

      endDate:
        searchParams.get('endDate') ||
        undefined,
    }

    // Validate query params
    const parsed = deliveryStatsSchema.safeParse(queryParams)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const query: DeliveryStatsQuery = parsed.data

    // Default to current day
    const today = new Date().toISOString().split('T')[0]

    const startDate = query.startDate || today

    const endDate = query.endDate || today

    let deliveryEventsQuery = supabase
      .from('delivery_events')
      .select(`
        package_id,
        driverID,
        status,
        event_timestamp,
        drivers!inner(region)
      `)
      .gte('event_timestamp', `${startDate}T00:00:00`)
      .lte('event_timestamp', `${endDate}T23:59:59`)

    // Filter by driver IDs
    if (query.driverIds) {
      const ids = query.driverIds.split(',').map(Number)

      deliveryEventsQuery = deliveryEventsQuery.in('driverID', ids)
    }

    // Filter by regions
    if (query.regions) {
      const regionList = query.regions.split(',').map((r) => r.trim())

      deliveryEventsQuery = deliveryEventsQuery.in('drivers.region', regionList)
    }

    const { data, error } = await deliveryEventsQuery

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      )
    }

    // Compute metrics
    const totalPackages =  new Set(
      data.map((e) => e.package_id)
    ).size;

    const deliveredCount =
      data.filter((d) => d.status === 'delivered').length

    const failedCount =
      data.filter((d) => d.status === 'failed').length

    const days =
      (
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      ) + 1

    let result: number = 0

    switch (query.metric) {
      case 'total_packages':
        result = totalPackages
        break

      case 'delivery_rate':
        result =
          totalPackages === 0
            ? 0
            : (deliveredCount / totalPackages) * 100
        break

      case 'failure_rate':
        result =
          totalPackages === 0
            ? 0
            : (failedCount / totalPackages) * 100
        break

      case 'avg_deliveries_per_day':
        result =
          days === 0
            ? 0
            : deliveredCount / days
        break
    }

    return NextResponse.json({
      success: true,
      data: query,
      result,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'failed'
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}