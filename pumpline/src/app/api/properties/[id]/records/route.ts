import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const createRecordSchema = z.object({
  serviceDate: z.string().min(1, "Service date is required"),
  serviceType: z.string().min(1, "Service type is required"),
  providerName: z.string().min(1, "Provider name is required"),
  notes: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  nextDueDate: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "HOMEOWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Verify ownership
    const property = await db.property.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = createRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { serviceDate, serviceType, providerName, notes, cost, nextDueDate } =
      parsed.data;

    const record = await db.serviceRecord.create({
      data: {
        propertyId: id,
        serviceDate: new Date(serviceDate),
        serviceType,
        providerName,
        notes: notes || null,
        cost: cost ?? null,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating service record:", error);
    return NextResponse.json(
      { error: "Failed to create service record" },
      { status: 500 }
    );
  }
}
