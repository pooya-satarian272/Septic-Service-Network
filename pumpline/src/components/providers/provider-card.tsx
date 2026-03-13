import Link from "next/link";
import { CheckCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/reviews/star-rating";

export interface ProviderCardData {
  id: string;
  businessName: string;
  slug: string;
  profileImage: string | null;
  isVerified: boolean;
  responseTime: string | null;
  yearsInBusiness: number | null;
  services: {
    name: string;
    slug: string;
    priceMin: number | null;
    priceMax: number | null;
    priceUnit: string | null;
  }[];
  averageRating: number;
  reviewCount: number;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getPriceRange(
  services: ProviderCardData["services"]
): string | null {
  const prices = services
    .flatMap((s) => [s.priceMin, s.priceMax])
    .filter((p): p is number => p !== null);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min}`;
  return `$${min} - $${max}`;
}

export function ProviderCard({ provider }: { provider: ProviderCardData }) {
  const initials = getInitials(provider.businessName);
  const priceRange = getPriceRange(provider.services);

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4">
        {/* Header: image + name */}
        <div className="flex items-start gap-3">
          {provider.profileImage ? (
            <img
              src={provider.profileImage}
              alt={provider.businessName}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-gray-900">
                {provider.businessName}
              </h3>
              {provider.isVerified && (
                <CheckCircle className="h-4 w-4 shrink-0 text-blue-600" />
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <StarRating rating={provider.averageRating} size="sm" />
              <span className="text-sm text-gray-500">
                ({provider.reviewCount})
              </span>
            </div>
          </div>
        </div>

        {/* Service badges */}
        {provider.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {provider.services.slice(0, 4).map((s) => (
              <Badge key={s.slug} variant="secondary">
                {s.name}
              </Badge>
            ))}
            {provider.services.length > 4 && (
              <Badge variant="outline">
                +{provider.services.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
          {provider.responseTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {provider.responseTime}
            </span>
          )}
          {priceRange && <span>{priceRange}</span>}
          {provider.yearsInBusiness != null && (
            <span>{provider.yearsInBusiness}+ yrs</span>
          )}
        </div>

        {/* CTA */}
        <Button asChild variant="outline" className="mt-auto w-full">
          <Link href={`/providers/${provider.slug}`}>View Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
