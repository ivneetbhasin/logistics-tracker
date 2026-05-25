import { NextRequest, NextResponse } from "next/server";
import supabase from "../../lib/supabase";

export async function UploadDrivers(req: NextRequest) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("drivers")
      .insert(body.drivers);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}