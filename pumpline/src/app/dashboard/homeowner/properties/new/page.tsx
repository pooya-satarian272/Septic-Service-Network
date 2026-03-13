"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      zipCode: formData.get("zipCode") as string,
      septicType: (formData.get("septicType") as string) || undefined,
      tankSize: (formData.get("tankSize") as string) || undefined,
      installYear: formData.get("installYear")
        ? Number(formData.get("installYear"))
        : undefined,
      notes: (formData.get("notes") as string) || undefined,
    };

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to create property");
      }

      router.push("/dashboard/homeowner/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/homeowner/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Property</h1>
          <p className="text-muted-foreground text-sm">
            Add a property to track its septic maintenance history.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
          <CardDescription>
            Enter the address and septic system information for your property.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" name="city" placeholder="Springfield" required />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" name="state" placeholder="IL" required />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    placeholder="62701"
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                Septic System Info{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="septicType">System Type</Label>
                  <Input
                    id="septicType"
                    name="septicType"
                    placeholder="Conventional"
                  />
                </div>
                <div>
                  <Label htmlFor="tankSize">Tank Size</Label>
                  <Input
                    id="tankSize"
                    name="tankSize"
                    placeholder="1000 gal"
                  />
                </div>
                <div>
                  <Label htmlFor="installYear">Install Year</Label>
                  <Input
                    id="installYear"
                    name="installYear"
                    type="number"
                    placeholder="2005"
                    min={1950}
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any additional details about the property or septic system..."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Add Property"}
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/homeowner/properties">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Separator() {
  return <div className="border-t" />;
}
