import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const serviceTypes = await db.serviceType.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(serviceTypes);
}
