import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import supabase from "../../../lib/supabase";

import { z } from 'zod';
import {
  driverSchema,
  DriverInput
} from '../../../validators/driver.validator';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get('drivers') as File

    const text = await file.text();

    const validatedDrivers: DriverInput[] = []
    const errors: Array<{ row: number; errors: unknown }> = []

    // Track duplicates inside CSV
    const DriverIds = new Set<number>()

    if (!file) {
      return NextResponse.json(
        { error: 'CSV file is required' },
        { status: 400 }
      )
    }

     if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      )
    }

    const records: Record<string, string>[] = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })

    records.forEach((row: Record<string, string>, index: number) => {
      const parsed = driverSchema.safeParse(row)

      if (!parsed.success) {
        errors.push({
          row: index + 2, // +2 because CSV header is row 1
          errors: parsed.error.issues,
        })

        return
      }

      const driver = parsed.data

      DriverIds.add(driver.driverID)

      validatedDrivers.push(driver)
    })

    const { data, error } = await supabase
      .from("drivers")
      .upsert(validatedDrivers, {
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
      count: validatedDrivers.length,
      data
    });

  } catch {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}