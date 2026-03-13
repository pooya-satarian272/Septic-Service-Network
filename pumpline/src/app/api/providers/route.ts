import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const zip = searchParams.get("zip");
  const service = searchParams.get("service");
  const minRating = searchParams.get("rating");
  const sort = searchParams.get("sort") || "rating";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (zip) {
    where.serviceAreas = {
      some: { zipCode: zip },
    };
  }

  if (service) {
    where.services = {
      some: { serviceType: { slug: service } },
    };
  }

  const [providers, total] = await Promise.all([
    db.provider.findMany({
      where,
      include: {
        user: { select: { name: true } },
        services: {
          include: { serviceType: true },
        },
        serviceAreas: true,
        reviews: {
          where: { isPublished: true },
          select: { rating: true },
        },
        _count: {
          select: { reviews: { where: { isPublished: true } } },
        },
      },
      skip,
      take: limit,
    }),
    db.provider.count({ where }),
  ]);

  // Calculate average ratings and apply rating filter
  let results = providers.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;

    return {
      id: p.id,
      businessName: p.businessName,
      slug: p.slug,
      bio: p.bio,
      phone: p.phone,
      profileImage: p.profileImage,
      isVerified: p.isVerified,
      responseTime: p.responseTime,
      yearsInBusiness: p.yearsInBusiness,
      ownerName: p.user.name,
      services: p.services.map((s) => ({
        name: s.serviceType.name,
        slug: s.serviceType.slug,
        priceMin: s.priceMin ? Number(s.priceMin) : null,
        priceMax: s.priceMax ? Number(s.priceMax) : null,
        priceUnit: s.priceUnit,
      })),
      serviceAreas: p.serviceAreas.map((a) => a.zipCode),
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: p._count.reviews,
    };
  });

  // Filter by minimum rating
  if (minRating) {
    const minR = parseFloat(minRating);
    results = results.filter((p) => p.averageRating >= minR);
  }

  // Sort
  if (sort === "rating") {
    results.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sort === "reviews") {
    results.sort((a, b) => b.reviewCount - a.reviewCount);
  } else if (sort === "experience") {
    results.sort(
      (a, b) => (b.yearsInBusiness || 0) - (a.yearsInBusiness || 0)
    );
  }

  return NextResponse.json({
    providers: results,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
