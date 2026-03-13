"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
}

interface ServiceType {
  id: string;
  name: string;
}

interface BookingFormProps {
  providerId: string;
  providerName: string;
}

export function BookingForm({ providerId, providerName }: BookingFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  const [propertyId, setPropertyId] = useState<string | null>("");
  const [serviceTypeId, setServiceTypeId] = useState<string | null>("");
  const [requestedDate, setRequestedDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/properties")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setProperties(data);
        })
        .catch(() => setProperties([]));

      fetch("/api/service-types")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setServiceTypes(data);
        })
        .catch(() => setServiceTypes([]));
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId,
          propertyId,
          serviceTypeId,
          requestedDate,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create booking");
      }

      setSuccess(true);
      setPropertyId("");
      setServiceTypeId("");
      setRequestedDate("");
      setNotes("");
      setTimeout(() => setOpen(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Get tomorrow's date as minimum for date picker
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>Book Service</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Book a Service</SheetTitle>
          <SheetDescription>
            Request a service from {providerName}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-md">
              Booking request submitted successfully!
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="property">Property</Label>
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No properties found. Please add a property first.
              </p>
            ) : (
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.address}, {p.city}, {p.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Select value={serviceTypeId} onValueChange={setServiceTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {serviceTypes.map((st) => (
                  <SelectItem key={st.id} value={st.id}>
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requestedDate">Requested Date</Label>
            <Input
              id="requestedDate"
              type="date"
              min={minDate}
              value={requestedDate}
              onChange={(e) => setRequestedDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !propertyId || !serviceTypeId || !requestedDate}
          >
            {loading ? "Submitting..." : "Request Booking"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
