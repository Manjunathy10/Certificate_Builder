import React from "react";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  Palette,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";
import { NavLink } from "react-router";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white transition-colors">
      {/* ==================== HERO SECTION ==================== */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Generate Certificates Instantly
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Upload CSV → Select Template → Download PDFs. Create professional
            certificates in seconds for courses, events, and achievements.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <NavLink to="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Get Started Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </NavLink>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 dark:border-gray-600"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to generate professional certificates at scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6">
                <UploadCloud size={24} className="text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Upload CSV</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Easily upload your recipient data via CSV file. Multiple columns
                supported for flexible certificate information.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6">
                <Palette size={24} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Custom Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from pre-designed templates or create your own. Customize
                colors, fonts, logos, and layouts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6">
                <Zap size={24} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">
                Bulk Generation
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Generate hundreds or thousands of certificates instantly. Download
                as ZIP file for easy distribution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS SECTION ==================== */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Simple 3-step process to generate your certificates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
            {[
              {
                step: 1,
                title: "Upload CSV",
                desc: "Prepare your recipient data in CSV format and upload it to our platform.",
              },
              {
                step: 2,
                title: "Select Template",
                desc: "Choose from our collection of professionally designed certificate templates.",
              },
              {
                step: 3,
                title: "Generate & Download",
                desc: "Click generate and download all your certificates as PDFs instantly.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-blue-600">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING SECTION ==================== */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Choose the plan that fits your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Essential features to get started</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <Button
                variant="outline"
                className="w-full mb-8 border-2 border-gray-300 dark:border-gray-600"
              >
                Get Started
              </Button>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Up to 100 certificates/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>5 basic templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Email support</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border-2 border-blue-600 shadow-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 mt-4">Pro</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">For growing teams</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <Button className="w-full mb-8 bg-blue-600 hover:bg-blue-700 text-white">
                Start Free Trial
              </Button>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Up to 10,000 certificates/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>50+ premium templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Custom branding</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Priority support</span>
                </li>
              </ul>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <Button
                variant="outline"
                className="w-full mb-8 border-2 border-gray-300 dark:border-gray-600"
              >
                Contact Sales
              </Button>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Unlimited certificates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>Custom templates & branding</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  <span>24/7 dedicated support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-lg mb-4">Certificate Generator</h4>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Generate professional certificates instantly with our powerful platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#templates" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Certificate Generator. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
