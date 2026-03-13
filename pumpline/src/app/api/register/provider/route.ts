import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { providerRegisterSchema } from "@/lib/validators/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = providerRegisterSchema.parse(body);

    const existing = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(data.password, 12);
    let slug = slugify(data.businessName);

    // Ensure unique slug
    const existingSlug = await db.provider.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash,
          phone: data.phone,
          role: "PROVIDER",
        },
      });

      await tx.provider.create({
        data: {
          userId: newUser.id,
          businessName: data.businessName,
          slug,
          phone: data.phone,
          bio: data.bio,
          website: data.website || null,
          licenseNumber: data.licenseNumber,
          yearsInBusiness: data.yearsInBusiness,
          responseTime: data.responseTime,
          services: {
            create: data.services.map((s) => ({
              serviceTypeId: s.serviceTypeId,
              priceMin: s.priceMin,
              priceMax: s.priceMax,
              priceUnit: s.priceUnit,
            })),
          },
          serviceAreas: {
            create: data.zipCodes.map((zip) => ({
              zipCode: zip,
            })),
          },
        },
      });

      return newUser;
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Provider registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
