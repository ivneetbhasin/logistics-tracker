import { NextRequest, NextResponse } from "next/server";
import  supabase  from "../../../lib/supabase";

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);

  const metric =
    searchParams.get("metric") ||
    "total_packages";

  const driverIds =
    searchParams
      .get("driverIds")
      ?.split(",")
      .map(Number);

  const regions =
    searchParams
      .get("regions")
      ?.split(",");

  const startDate =
    searchParams.get("startDate") ||
    new Date().toISOString();

  const endDate =
    searchParams.get("endDate") ||
    new Date().toISOString();

  let query = supabase
    .from("delivery_events")
    .select("*")
    .gte("event_timestamp", startDate)
    .lte("event_timestamp", endDate);

  if (driverIds?.length) {
    query = query.in("driverID", driverIds);
  }

  const { data: events, error } =
    await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  let filteredEvents = events || [];

  if (regions?.length) {

    const { data: drivers } = await supabase
      .from("drivers")
      .select("driverID, region")
      .in("region", regions);

    const allowedDrivers =
      drivers?.map((d) => d.driverID) || [];

    filteredEvents =
      filteredEvents.filter((e) =>
        allowedDrivers.includes(e.driverID)
      );
  }

  const totalPackages =
    new Set(
      filteredEvents.map((e) => e.package_id)
    ).size;

  const delivered =
    filteredEvents.filter(
      (e) => e.status === "delivered"
    ).length;

  const failed =
    filteredEvents.filter(
      (e) => e.status === "failed"
    ).length;

  let result = 0;

  switch (metric) {

    case "total_packages":
      result = totalPackages;
      break;

    case "delivery_rate":
      result =
        totalPackages > 0
          ? (delivered / totalPackages) * 100
          : 0;
      break;

    case "failure_rate":
      result =
        totalPackages > 0
          ? (failed / totalPackages) * 100
          : 0;
      break;

    case "avg_deliveries_per_day":

      const days =
        (new Date(endDate).getTime() -
          new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24);

      result =
        delivered / Math.max(days, 1);

      break;
  }

  return NextResponse.json({
    metric,
    result,
  });
}