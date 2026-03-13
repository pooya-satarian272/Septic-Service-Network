import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const updatePropertySchema = z.object({
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  zipCode: z.string().min(5).optional(),
  septicType: z.string().optional(),
  tankSize: z.string().optional(),
  installYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
  notes: z.string().optional(),
});

async function verifyOwnership(propertyId: string, userId: string) {
  const property = await db.property.findFirst({
    where: { id: propertyId, userId },
  });
  return property;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const property = await db.property.findFirst({
      where: { id, userId: session.user.id },
      include: {
        serviceRecords: {
          orderBy: { serviceDate: "desc" },
        },
        bookings: {
          include: {
            provider: { select: { businessName: true } },
            serviceType: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const owned = await verifyOwnership(id, session.user.id);
    if (!owned) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = updatePropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const property = await db.property.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
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

    const owned = await verifyOwnership(id, session.user.id);
    if (!owned) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    await db.property.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}
