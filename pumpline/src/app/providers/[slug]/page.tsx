import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProviderTabs } from "@/components/providers/provider-tabs";
import { BookingForm } from "@/components/bookings/booking-form";
import { StarRating } from "@/components/reviews/star-rating";
import {
  CheckCircle,
  Clock,
  Phone,
  Globe,
  Shield,
  MapPin,
} from "lucide-react";
import type { Metadata } from "next";

interface ProviderPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProviderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const provider = await db.provider.findUnique({
    where: { slug },
    select: { businessName: true, bio: true },
  });

  if (!provider) return { title: "Provider Not Found | Pumpline" };

  return {
    title: `${provider.businessName} | Pumpline`,
    description:
      provider.bio?.slice(0, 160) ||
      `View ${provider.businessName}'s profile, services, and reviews on Pumpline.`,
  };
}

export default async function ProviderProfilePage({
  params,
}: ProviderPageProps) {
  const { slug } = await params;

  const provider = await db.provider.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true } },
      services: {
        include: { serviceType: true },
      },
      serviceAreas: true,
      availability: { orderBy: { dayOfWeek: "asc" } },
      photos: { orderBy: { createdAt: "desc" } },
      reviews: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
        },
      },
    },
  });

  if (!provider || !provider.isActive) {
    notFound();
  }

  const avgRating =
    provider.reviews.length > 0
      ? provider.reviews.reduce((sum, r) => sum + r.rating, 0) /
        provider.reviews.length
      : 0;
  const roundedRating = Math.round(avgRating * 10) / 10;
  const reviewCount = provider.reviews.length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Provider Header */}
      <div className="rounded-xl border bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            {provider.profileImage ? (
              <img
                src={provider.profileImage}
                alt={provider.businessName}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                {provider.businessName
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {provider.businessName}
                </h1>
                {provider.isVerified && (
                  <Badge className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-2">
                <StarRating rating={roundedRating} size="md" showValue />
                <span className="text-sm text-gray-500">
                  ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                </span>
              </div>

              {/* Quick info */}
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600">
                {provider.responseTime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {provider.responseTime}
                  </span>
                )}
                {provider.yearsInBusiness != null && (
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-gray-400" />
                    {provider.yearsInBusiness}+ years in business
                  </span>
                )}
                {provider.licenseNumber && (
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-gray-400" />
                    Lic. #{provider.licenseNumber}
                  </span>
                )}
              </div>

              {/* Service badges */}
              {provider.services.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {provider.services.map((s) => (
                    <Badge key={s.id} variant="secondary">
                      {s.serviceType.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact + Book */}
          <div className="flex flex-col gap-3 sm:items-end shrink-0">
            <BookingForm
              providerId={provider.id}
              providerName={provider.businessName}
            />
            <div className="flex flex-col gap-1.5 text-sm text-gray-600">
              {provider.phone && (
                <a
                  href={`tel:${provider.phone}`}
                  className="flex items-center gap-1.5 hover:text-blue-600"
                >
                  <Phone className="h-4 w-4" />
                  {provider.phone}
                </a>
              )}
              {provider.website && (
                <a
                  href={provider.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-600"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
              {provider.serviceAreas.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {provider.serviceAreas.length} service area
                  {provider.serviceAreas.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: About, Photos, Reviews */}
      <div className="mt-8">
        <ProviderTabs
          bio={provider.bio}
          services={provider.services.map((s) => ({
            ...s,
            priceMin: s.priceMin ? Number(s.priceMin) : null,
            priceMax: s.priceMax ? Number(s.priceMax) : null,
          }))}
          serviceAreas={provider.serviceAreas}
          availability={provider.availability}
          photos={provider.photos}
          reviews={provider.reviews.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
          }))}
          averageRating={roundedRating}
          reviewCount={reviewCount}
        />
      </div>
    </div>
  );
}
