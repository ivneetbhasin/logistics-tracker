import { NextRequest, NextResponse } from "next/server";
import  supabase  from "../../lib/supabase";

export async function updateDeliveryEvents(req: NextRequest) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("delivery_events")
      .insert([
        {
          package_id: body.packageId,
          driver_id: body.driverId,
          status: body.status,
          event_timestamp: body.timestamp,
        },
      ]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);

  } catch {
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}