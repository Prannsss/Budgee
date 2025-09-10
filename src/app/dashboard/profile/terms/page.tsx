"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 border-b bg-background/95 backdrop-blur-sm">
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Terms and Conditions</h1>
      </header>

      {/* Main Content */}
      <div className="p-4 pb-20">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Budgee Terms of Service</h2>
          <p className="text-sm text-muted-foreground">Last updated: September 10, 2025</p>
        </div>
        
        <div className="space-y-6 text-sm">
          <section>
            <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
            <p className="text-muted-foreground">
              By accessing and using Budgee, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">2. Use License</h3>
            <p className="text-muted-foreground">
              Permission is granted to temporarily download one copy of Budgee for personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">3. Privacy Policy</h3>
            <p className="text-muted-foreground">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">4. Account Security</h3>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">5. Financial Data</h3>
            <p className="text-muted-foreground">
              We use bank-level security to protect your financial information. We do not store your banking credentials on our servers.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">6. Service Availability</h3>
            <p className="text-muted-foreground">
              We strive to maintain service availability but cannot guarantee uninterrupted access to our services.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">7. Changes to Terms</h3>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">8. Contact Information</h3>
            <p className="text-muted-foreground">
              If you have any questions about these Terms and Conditions, please contact us at terms@budgee.app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
