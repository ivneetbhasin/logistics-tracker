import { NextRequest, NextResponse } from "next/server";
import  supabase  from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("delivery_events")
      .insert([
        {
          package_id: body.packageId,
          driverID: body.driverId,
          status: body.status,
          event_timestamp: body.timestamp,
        },
      ])
      .select()

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