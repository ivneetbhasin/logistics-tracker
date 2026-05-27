import { NextRequest, NextResponse } from "next/server";
import  supabase  from "../../../lib/supabase";

import{
  DeliveryEventInput,
  deliveryEventSchema
} from '../../../validators/deliveryEvent.validator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

     // Validate request body
    const parsed =
      deliveryEventSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parsed.error.issues,
        },
        { status: 400 }
      )
    }

    const event: DeliveryEventInput =
      parsed.data

    // Check if driver exists
    const { data: driver, error: driverError } =
      await supabase
        .from('drivers')
        .select('driverID')
        .eq('driverID', event.driverID)
        .single()

    if (driverError || !driver) {
      return NextResponse.json(
        {
          success: false,
          error: `Driver ${event.driverID} not found`,
        },
        { status: 404 }
      )
    }

    // Insert delivery event
    const { data, error } = await supabase
      .from('delivery_events')
      .insert({
        package_id: event.packageId,
        driverID: event.driverID,
        status: event.status,
        event_timestamp: event.timestamp,
      })
      .select()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}