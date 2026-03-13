"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StarRating } from "@/components/reviews/star-rating";
import { MapPin, Clock, DollarSign, User } from "lucide-react";

interface Service {
  id: string;
  serviceType: { name: string; slug: string };
  priceMin: string | number | null;
  priceMax: string | number | null;
  priceUnit: string | null;
  description: string | null;
}

interface ServiceArea {
  id: string;
  zipCode: string;
  city: string | null;
  state: string | null;
}

interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
  user: { name: string | null };
}

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

interface ProviderTabsProps {
  bio: string | null;
  services: Service[];
  serviceAreas: ServiceArea[];
  availability: Availability[];
  photos: Photo[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatPrice(min: string | number | null, max: string | number | null, unit: string | null): string {
  const minN = min != null ? Number(min) : null;
  const maxN = max != null ? Number(max) : null;
  if (minN == null && maxN == null) return "Contact for pricing";
  if (minN != null && maxN != null && minN !== maxN) {
    return `$${minN} - $${maxN}${unit ? ` / ${unit}` : ""}`;
  }
  const price = minN ?? maxN;
  return `$${price}${unit ? ` / ${unit}` : ""}`;
}

function getRatingDistribution(reviews: Review[]): number[] {
  const dist = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating - 1]++;
  });
  return dist;
}

export function ProviderTabs({
  bio,
  services,
  serviceAreas,
  availability,
  photos,
  reviews,
  averageRating,
  reviewCount,
}: ProviderTabsProps) {
  const ratingDist = getRatingDistribution(reviews);
  const maxCount = Math.max(...ratingDist, 1);

  return (
    <Tabs defaultValue="about">
      <TabsList variant="line" className="w-full justify-start border-b pb-0">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="photos">
          Photos {photos.length > 0 && `(${photos.length})`}
        </TabsTrigger>
        <TabsTrigger value="reviews">
          Reviews {reviewCount > 0 && `(${reviewCount})`}
        </TabsTrigger>
      </TabsList>

      {/* About Tab */}
      <TabsContent value="about" className="pt-6">
        <div className="space-y-8">
          {/* Bio */}
          {bio && (
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                About
              </h3>
              <p className="leading-relaxed text-gray-600 whitespace-pre-line">{bio}</p>
            </div>
          )}

          {/* Services */}
          {services.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Services &amp; Pricing
              </h3>
              <div className="space-y-3">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {s.serviceType.name}
                      </p>
                      {s.description && (
                        <p className="mt-0.5 text-sm text-gray-500">
                          {s.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                      <DollarSign className="h-3.5 w-3.5" />
                      {formatPrice(s.priceMin, s.priceMax, s.priceUnit)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service Areas */}
          {serviceAreas.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Service Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <Badge key={area.id} variant="outline">
                    <MapPin className="mr-1 h-3 w-3" />
                    {area.city && area.state
                      ? `${area.city}, ${area.state} ${area.zipCode}`
                      : area.zipCode}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {availability.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Availability
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {availability
                  .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-2"
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {dayNames[a.dayOfWeek]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {a.startTime} - {a.endTime}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      {/* Photos Tab */}
      <TabsContent value="photos" className="pt-6">
        {photos.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="mb-4 break-inside-avoid overflow-hidden rounded-lg"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || "Work photo"}
                  className="w-full object-cover"
                />
                {photo.caption && (
                  <p className="mt-1 text-sm text-gray-500">{photo.caption}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            No photos yet.
          </div>
        )}
      </TabsContent>

      {/* Reviews Tab */}
      <TabsContent value="reviews" className="pt-6">
        {reviewCount > 0 ? (
          <div className="space-y-8">
            {/* Rating distribution */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </p>
                <StarRating rating={averageRating} size="md" />
                <p className="mt-1 text-sm text-gray-500">
                  {reviewCount} review{reviewCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-8 text-right text-sm text-gray-600">
                      {star}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{
                          width: `${(ratingDist[star - 1] / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-400">
                      {ratingDist[star - 1]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Review cards */}
            <div className="space-y-6">
              {reviews
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {review.user.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                    {review.title && (
                      <p className="font-medium text-gray-900">
                        {review.title}
                      </p>
                    )}
                    {review.comment && (
                      <p className="text-sm leading-relaxed text-gray-600">
                        {review.comment}
                      </p>
                    )}
                    <Separator className="!mt-6" />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">
            No reviews yet.
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}
