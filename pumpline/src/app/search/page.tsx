import { Suspense } from "react";
import { db } from "@/lib/db";
import { SearchFilters } from "@/components/providers/search-filters";
import {
  ProviderCard,
  type ProviderCardData,
} from "@/components/providers/provider-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search } from "lucide-react";

const PAGE_SIZE = 12;

interface SearchPageProps {
  searchParams: Promise<{
    zip?: string;
    service?: string;
    rating?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Find Septic Providers | Pumpline",
  description:
    "Search for trusted, verified septic service providers in your area.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const zip = params.zip || "";
  const service = params.service || "";
  const minRating = params.rating ? parseFloat(params.rating) : 0;
  const sort = params.sort || "rating";
  const page = Math.max(1, parseInt(params.page || "1"));
  const skip = (page - 1) * PAGE_SIZE;

  // Build Prisma where clause
  const where: Record<string, unknown> = { isActive: true };

  if (zip) {
    where.serviceAreas = { some: { zipCode: zip } };
  }
  if (service) {
    where.services = { some: { serviceType: { slug: service } } };
  }

  const [providers, total] = await Promise.all([
    db.provider.findMany({
      where,
      include: {
        user: { select: { name: true } },
        services: { include: { serviceType: true } },
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
      take: PAGE_SIZE,
    }),
    db.provider.count({ where }),
  ]);

  // Map + compute average ratings
  let results: ProviderCardData[] = providers.map((p) => {
    const avgRating =
      p.reviews.length > 0
        ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
        : 0;

    return {
      id: p.id,
      businessName: p.businessName,
      slug: p.slug,
      profileImage: p.profileImage,
      isVerified: p.isVerified,
      responseTime: p.responseTime,
      yearsInBusiness: p.yearsInBusiness,
      services: p.services.map((s) => ({
        name: s.serviceType.name,
        slug: s.serviceType.slug,
        priceMin: s.priceMin ? Number(s.priceMin) : null,
        priceMax: s.priceMax ? Number(s.priceMax) : null,
        priceUnit: s.priceUnit,
      })),
      averageRating: Math.round(avgRating * 10) / 10,
      reviewCount: p._count.reviews,
    };
  });

  // Filter by minimum rating
  if (minRating > 0) {
    results = results.filter((p) => p.averageRating >= minRating);
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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Find Septic Service Providers
        </h1>
        <p className="mt-1 text-gray-500">
          Browse verified providers in your area
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-gray-100" />}>
        <SearchFilters />
      </Suspense>

      {/* Results count */}
      <div className="mt-6 mb-4 text-sm text-gray-500">
        {total} provider{total !== 1 ? "s" : ""} found
        {zip ? ` near ${zip}` : ""}
      </div>

      {/* Results grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {results.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-16">
          <Search className="mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">
            No providers found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or searching a different area.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {page > 1 && (
            <Button variant="outline" asChild>
              <Link
                href={`/search?${buildParams(params, page - 1)}`}
              >
                Previous
              </Link>
            </Button>
          )}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - page) <= 1
              )
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push("...");
                }
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    asChild={p !== page}
                  >
                    {p === page ? (
                      <span>{p}</span>
                    ) : (
                      <Link href={`/search?${buildParams(params, p as number)}`}>
                        {p}
                      </Link>
                    )}
                  </Button>
                )
              )}
          </div>
          {page < totalPages && (
            <Button variant="outline" asChild>
              <Link
                href={`/search?${buildParams(params, page + 1)}`}
              >
                Next
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function buildParams(
  current: Record<string, string | undefined>,
  page: number
): string {
  const params = new URLSearchParams();
  if (current.zip) params.set("zip", current.zip);
  if (current.service) params.set("service", current.service);
  if (current.rating) params.set("rating", current.rating);
  if (current.sort) params.set("sort", current.sort);
  if (page > 1) params.set("page", String(page));
  return params.toString();
}
