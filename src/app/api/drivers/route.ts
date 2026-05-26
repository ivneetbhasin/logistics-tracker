import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import supabase from "../../../lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('drivers') as File

    if (!file) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      )
    }

    const text = await file.text()

    const records: Record<string, string>[] = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    const drivers = records.map((row) => ({
      driverID: Number(row.driverID),
      name: row.name,
      phone: row.phone,
      email: row.email,
      region: row.region,
    }))

    const { data, error } = await supabase
      .from("drivers")
      .upsert(drivers, {
        onConflict: 'driverID',
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
      count: drivers.length,
      data
    });

  } catch {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}