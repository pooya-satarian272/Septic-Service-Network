import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod/v4";

const createPropertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "Valid zip code is required"),
  septicType: z.string().optional(),
  tankSize: z.string().optional(),
  installYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const properties = await db.property.findMany({
      where: { userId: session.user.id },
      include: {
        _count: { select: { bookings: true, serviceRecords: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.role !== "HOMEOWNER") {
      return NextResponse.json(
        { error: "Only homeowners can create properties" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = createPropertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const property = await db.property.create({
      data: {
        userId: session.user.id,
        ...parsed.data,
        installYear: parsed.data.installYear || null,
        notes: parsed.data.notes || null,
        septicType: parsed.data.septicType || null,
        tankSize: parsed.data.tankSize || null,
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}
