import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg text-blue-600 mb-3">Pumpline</h3>
            <p className="text-sm text-gray-600">
              The trusted marketplace for septic service providers. Verified
              work history, transparent pricing, honest reviews.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">For Homeowners</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/search" className="hover:text-gray-900">
                  Find a Provider
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-gray-900">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gray-900">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">For Providers</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/register/provider" className="hover:text-gray-900">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-gray-900">
                  Provider Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-4 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Pumpline. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
