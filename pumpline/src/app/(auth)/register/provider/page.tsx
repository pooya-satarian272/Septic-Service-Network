"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ServiceType {
  id: string;
  name: string;
  slug: string;
}

interface ServiceEntry {
  serviceTypeId: string;
  name: string;
  priceMin: string;
  priceMax: string;
  priceUnit: string;
}

export default function ProviderRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  // Form state
  const [account, setAccount] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [business, setBusiness] = useState({
    businessName: "",
    bio: "",
    website: "",
    licenseNumber: "",
    yearsInBusiness: "",
    responseTime: "",
  });
  const [zipCodes, setZipCodes] = useState<string[]>([]);
  const [zipInput, setZipInput] = useState("");
  const [services, setServices] = useState<ServiceEntry[]>([]);

  useEffect(() => {
    fetch("/api/service-types")
      .then((r) => r.json())
      .then((data) => setServiceTypes(data))
      .catch(() => {});
  }, []);

  function addZipCode() {
    const zip = zipInput.trim();
    if (zip.length >= 5 && !zipCodes.includes(zip)) {
      setZipCodes([...zipCodes, zip]);
      setZipInput("");
    }
  }

  function toggleService(st: ServiceType) {
    const exists = services.find((s) => s.serviceTypeId === st.id);
    if (exists) {
      setServices(services.filter((s) => s.serviceTypeId !== st.id));
    } else {
      setServices([
        ...services,
        {
          serviceTypeId: st.id,
          name: st.name,
          priceMin: "",
          priceMax: "",
          priceUnit: "per job",
        },
      ]);
    }
  }

  function updateServicePrice(
    idx: number,
    field: "priceMin" | "priceMax" | "priceUnit",
    value: string
  ) {
    const updated = [...services];
    updated[idx] = { ...updated[idx], [field]: value };
    setServices(updated);
  }

  async function onSubmit() {
    setError("");
    setLoading(true);

    const data = {
      ...account,
      ...business,
      yearsInBusiness: business.yearsInBusiness
        ? parseInt(business.yearsInBusiness)
        : undefined,
      zipCodes,
      services: services.map((s) => ({
        serviceTypeId: s.serviceTypeId,
        priceMin: s.priceMin ? parseFloat(s.priceMin) : undefined,
        priceMax: s.priceMax ? parseFloat(s.priceMax) : undefined,
        priceUnit: s.priceUnit,
      })),
    };

    const res = await fetch("/api/register/provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: account.email,
      password: account.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created but sign-in failed. Please try logging in.");
    } else {
      router.push("/dashboard/provider");
      router.refresh();
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Register Your Business</CardTitle>
          <CardDescription>
            Step {step} of 3 &mdash;{" "}
            {step === 1
              ? "Account Info"
              : step === 2
              ? "Business Details"
              : "Services & Areas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={account.name}
                  onChange={(e) =>
                    setAccount({ ...account, name: e.target.value })
                  }
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={account.email}
                  onChange={(e) =>
                    setAccount({ ...account, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={account.phone}
                  onChange={(e) =>
                    setAccount({ ...account, phone: e.target.value })
                  }
                  placeholder="(555) 555-5555"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={account.password}
                  onChange={(e) =>
                    setAccount({ ...account, password: e.target.value })
                  }
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  if (
                    account.name &&
                    account.email &&
                    account.phone &&
                    account.password.length >= 8
                  ) {
                    setStep(2);
                  }
                }}
              >
                Next: Business Details
              </Button>
            </div>
          )}

          {/* Step 2: Business */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={business.businessName}
                  onChange={(e) =>
                    setBusiness({ ...business, businessName: e.target.value })
                  }
                  placeholder="Acme Septic Services"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Bio / Description</Label>
                <Textarea
                  value={business.bio}
                  onChange={(e) =>
                    setBusiness({ ...business, bio: e.target.value })
                  }
                  placeholder="Tell homeowners about your business..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Years in Business</Label>
                  <Input
                    type="number"
                    value={business.yearsInBusiness}
                    onChange={(e) =>
                      setBusiness({
                        ...business,
                        yearsInBusiness: e.target.value,
                      })
                    }
                    placeholder="10"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Response Time</Label>
                  <Input
                    value={business.responseTime}
                    onChange={(e) =>
                      setBusiness({
                        ...business,
                        responseTime: e.target.value,
                      })
                    }
                    placeholder="Within 2 hours"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Website (optional)</Label>
                <Input
                  value={business.website}
                  onChange={(e) =>
                    setBusiness({ ...business, website: e.target.value })
                  }
                  placeholder="https://yoursite.com"
                />
              </div>
              <div className="space-y-2">
                <Label>License Number (optional)</Label>
                <Input
                  value={business.licenseNumber}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      licenseNumber: e.target.value,
                    })
                  }
                  placeholder="License #"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (business.businessName) setStep(3);
                  }}
                >
                  Next: Services & Areas
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Services & Areas */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Zip codes */}
              <div className="space-y-2">
                <Label>Service Areas (ZIP Codes)</Label>
                <div className="flex gap-2">
                  <Input
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value)}
                    placeholder="Enter ZIP code"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addZipCode();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={addZipCode}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {zipCodes.map((zip) => (
                    <Badge key={zip} variant="secondary" className="gap-1">
                      {zip}
                      <button
                        onClick={() =>
                          setZipCodes(zipCodes.filter((z) => z !== zip))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Services */}
              <div className="space-y-2">
                <Label>Services Offered</Label>
                <div className="flex flex-wrap gap-2">
                  {serviceTypes.map((st) => {
                    const selected = services.some(
                      (s) => s.serviceTypeId === st.id
                    );
                    return (
                      <Badge
                        key={st.id}
                        variant={selected ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleService(st)}
                      >
                        {st.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Pricing for selected services */}
              {services.map((s, idx) => (
                <div key={s.serviceTypeId} className="border rounded-md p-3">
                  <p className="font-medium text-sm mb-2">{s.name} Pricing</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Min ($)</Label>
                      <Input
                        type="number"
                        value={s.priceMin}
                        onChange={(e) =>
                          updateServicePrice(idx, "priceMin", e.target.value)
                        }
                        placeholder="100"
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max ($)</Label>
                      <Input
                        type="number"
                        value={s.priceMax}
                        onChange={(e) =>
                          updateServicePrice(idx, "priceMax", e.target.value)
                        }
                        placeholder="500"
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <Input
                        value={s.priceUnit}
                        onChange={(e) =>
                          updateServicePrice(idx, "priceUnit", e.target.value)
                        }
                        placeholder="per job"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  disabled={
                    loading || zipCodes.length === 0 || services.length === 0
                  }
                  onClick={onSubmit}
                >
                  {loading ? "Creating account..." : "Register Business"}
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
