"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface ServiceType {
  id: string;
  name: string;
  slug: string;
}

export function SearchFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [zip, setZip] = useState(searchParams.get("zip") || "");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/service-types")
      .then((res) => res.json())
      .then((data) => setServiceTypes(data))
      .catch(() => {});
  }, []);

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when changing filters
      if (key !== "page") {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    setZip(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      if (value.length === 5 || value.length === 0) {
        updateParams("zip", value);
      }
    }, 500);
  };

  const handleServiceChange = (value: string | null) => {
    updateParams("service", !value || value === "__all__" ? "" : value);
  };

  const handleRatingChange = (value: string | null) => {
    updateParams("rating", !value || value === "__any__" ? "" : value);
  };

  const handleSortChange = (value: string | null) => {
    updateParams("sort", value || "rating");
  };

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Zip Code */}
        <div className="space-y-1.5">
          <Label htmlFor="zip" className="text-sm font-medium">
            Zip Code
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="zip"
              placeholder="Enter zip code"
              value={zip}
              onChange={handleZipChange}
              className="pl-9"
            />
          </div>
        </div>

        {/* Service Type */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Service Type</Label>
          <Select
            value={searchParams.get("service") || "__all__"}
            onValueChange={handleServiceChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Services</SelectItem>
              {serviceTypes.map((st) => (
                <SelectItem key={st.id} value={st.slug}>
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Rating */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Min Rating</Label>
          <Select
            value={searchParams.get("rating") || "__any__"}
            onValueChange={handleRatingChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any__">Any Rating</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select
            value={searchParams.get("sort") || "rating"}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Best Rated" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Best Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="experience">Most Experienced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
