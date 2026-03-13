import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  Star,
  FileText,
  CheckCircle,
  ArrowRight,
  Phone,
  Shield,
  Calendar,
  Home,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works | Pumpline",
  description:
    "Learn how Pumpline connects homeowners with trusted, verified septic service providers.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16 sm:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            How Pumpline Works
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            The trust infrastructure that septic services have been missing.
            Real reviews, transparent pricing, and maintenance records that
            follow the home.
          </p>
        </div>
      </section>

      {/* Steps for Homeowners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              For Homeowners
            </span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Find the Right Provider
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                step: "1",
                icon: Search,
                title: "Search Your Area",
                description:
                  "Enter your ZIP code to find septic providers serving your neighborhood. Filter by service type, rating, experience, and price range.",
              },
              {
                step: "2",
                icon: Star,
                title: "Read Real Reviews",
                description:
                  "Every review comes from a verified service booking. See photos of completed work, average response times, and what your neighbors actually experienced.",
              },
              {
                step: "3",
                icon: Phone,
                title: "Book Service",
                description:
                  "Request a booking directly through the platform. Choose your property, select the service type, pick a date, and add any notes. The provider responds within their listed response time.",
              },
              {
                step: "4",
                icon: FileText,
                title: "Build Your Property Record",
                description:
                  "Every completed service is logged to your property. When your next pumping or inspection is due, you get a reminder. When you sell your home, the maintenance history comes with it.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/search">
                Find a Provider
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Steps for Providers */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
              For Providers
            </span>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Grow Your Business
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                step: "1",
                icon: Shield,
                title: "Create Your Profile",
                description:
                  "Register your business with your service areas, pricing, and experience. Upload photos of completed work. The more detail you provide, the more trust you build.",
              },
              {
                step: "2",
                icon: Calendar,
                title: "Receive Bookings",
                description:
                  "Homeowners find you through search and send booking requests. Accept or decline from your dashboard. You control your schedule.",
              },
              {
                step: "3",
                icon: Star,
                title: "Earn Reviews",
                description:
                  "After completing a service, homeowners leave verified reviews. Your reputation builds with every job, creating a track record no competitor can replicate.",
              },
              {
                step: "4",
                icon: TrendingUp,
                title: "Scale with Premium",
                description:
                  "Upgrade to a premium listing for priority placement in search results, lead prioritization, and analytics on how homeowners interact with your profile.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-600 text-white font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/register/provider">
                List Your Business
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why Pumpline */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Pumpline Exists
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Trust infrastructure exists for every other home service. For
              septic, it has been word of mouth and hope. We are changing that.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                icon: CheckCircle,
                title: "Verified Work History",
                description:
                  "Every review is tied to a real booking. No fake reviews, no anonymous complaints — just real experiences from real homeowners.",
              },
              {
                icon: Home,
                title: "Property-Level Records",
                description:
                  "Maintenance history follows the home, not the owner. Useful for inspections, insurance, and when it is time to sell.",
              },
              {
                icon: Shield,
                title: "Transparent Pricing",
                description:
                  "See what providers charge for comparable jobs before you call. No more showing up with no written estimate.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <item.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white">Get Started Today</h2>
          <p className="mt-3 text-blue-100 max-w-lg mx-auto">
            Whether you need service or provide it, Pumpline is free to get
            started.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50 px-8"
            >
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10 px-8"
            >
              <Link href="/search">Browse Providers</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
