import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import type { Metadata } from "next";
import { MsmeBadge } from "@/components/shared/msme-badge";

export const metadata: Metadata = {
  title: "Privacy Policy | ANSH Forms",
  description: "Privacy Policy for ANSH Forms — how we collect, use, and protect your form and submission data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#04070f] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400 relative overflow-x-hidden">
      {/* Background Mesh/Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Glow Blurs */}
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-16 relative z-10 w-full flex-grow flex flex-col justify-center">
        
        {/* Back Link */}
        <Link 
          href="/" 
          id="back-home-link"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 mb-10 group w-fit"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to ANSH Forms</span>
        </Link>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Legal Agreements</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Privacy Policy
            </h1>
            <p className="text-xs font-semibold text-zinc-400 mt-2.5">
              Last updated: April 16, 2026
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/[0.02] border border-white/5 w-fit">
            <Image src="/logoAnshapps.png" alt="ANSH Logo" width={20} height={20} className="h-5 w-5 object-contain" />
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">ANSH Forms</span>
          </div>
        </div>

        {/* Document Card */}
        <div className="bg-[#070b13]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden space-y-12">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              1. Introduction
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                At ANSH Forms, we respect your privacy and are committed to protecting the digital assets, form schemas, and personal data you trust us with. This Privacy Policy explains how we collect, process, store, and safeguard your data when you access or use our digital form builder, response canvas, and the broader ANSH Apps ecosystem.
              </p>
              <p>
                By using our services, you consent to the data collection and usage practices described in this policy. If you do not agree with any terms outlined here, please refrain from submitting information to our platform.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              2. Information We Collect
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                To provide our high-performance form generation and brand customizer features, we collect the following categories of information:
              </p>
              <ul className="list-disc pl-5 space-y-2.5 text-zinc-400 mt-2">
                <li>
                  <strong className="text-zinc-200">Account Information:</strong> Profile details including name, corporate email address, password hashes, and user settings required for authentication.
                </li>
                <li>
                  <strong className="text-zinc-200">Workspace &amp; Form Data:</strong> Custom schemas, question configurations, validation rules, brand assets (logos, custom CSS themes), and media attachments stored in your workspace library.
                </li>
                <li>
                  <strong className="text-zinc-200">Response Submissions:</strong> Form responses submitted by your end-users, which we process and index securely for real-time analytics.
                </li>
                <li>
                  <strong className="text-zinc-200">Payment Metadata:</strong> Transaction IDs, billing timestamps, subscription tier, and metadata associated with transactions processed through Stripe or other authorized payment partners. We do not store raw card numbers.
                </li>
                <li>
                  <strong className="text-zinc-200">Technical Diagnostics:</strong> Browser types, access timestamps, IP-derived general location, device properties, and console log data collected automatically for performance telemetry.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              3. How We Use Data
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                We use the collected information for the following primary business purposes:
              </p>
              <ul className="list-disc pl-5 space-y-2.5 text-zinc-400 mt-2">
                <li>To compile, deploy, and host your custom form canvas pages.</li>
                <li>To generate downloadable high-resolution QR codes and unique share links.</li>
                <li>To power AI-assisted layout schema suggestions via NLP prompts.</li>
                <li>To offer interactive real-time visual charts and conversion funnel analytics.</li>
                <li>To process monthly or annual subscription billings and monitor seat allocations.</li>
                <li>To secure the platform from distributed abuse, spam, and brute-force vectors.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              4. Legal Basis and Consent
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                Our processing of your data is grounded in contractual necessity (delivering form builder access), legal obligations (tax compliance and security mandates), and our legitimate interests in offering a stable, functional system. When you configure forms to gather custom respondent data, you act as the Data Controller, and ANSH Forms acts as the Data Processor.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              5. Data Sharing
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                We do not sell, rent, or trade user data to data brokers. We share information only with verified third-party subprocessors who assist in delivery of core features:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 mt-2">
                <li>Cloud infrastructure hosts (for database clustering and media uploads).</li>
                <li>Email distribution APIs (for system notifications and support communication).</li>
                <li>Merchant payment gateways (for subscription invoice checkouts).</li>
              </ul>
              <p className="mt-2">
                All such subprocessor engagements are subject to strict data processing agreements ensuring equivalent protection levels.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              6. Data Retention
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                We retain your account profile and workspace configuration for as long as your corporate workspace remains active. If you choose to terminate your workspace, we will delete your custom schemas, responses, and file assets from our production clusters within 30 days, subject to legal overrides (e.g., pending audits, tax billing records, or fraud investigations).
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              7. Your Rights
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                Depending on your geographic region, you have rights regarding access, portability, correction, and erasure of your personal data.
              </p>
              <p>
                To request data deletion, account correction, or standard compliance certificates, please contact our team at{" "}
                <a href="mailto:support@anshapps.com" className="text-emerald-400 hover:underline font-bold">
                  support@anshapps.com
                </a>
                .
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              8. Security Measures
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                We protect your files, forms, and responses using strict technical controls. This includes TLS encryption for data in transit, AES-256 block encryption for databases at rest, isolated storage volumes for client uploads, and multi-factor validation logs for admin accounts.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              9. India-Specific Compliance Note
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                We align our operations with applicable Indian laws, including the Information Technology Act, 2000, rules made thereunder, and the Digital Personal Data Protection (DPDP) Act. For grievance redressal under Indian regulations, users may reach our designated officer via email at{" "}
                <a href="mailto:support@anshapps.com" className="text-emerald-400 hover:underline font-bold">
                  support@anshapps.com
                </a>
                .
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              10. Billing and Refund Clarification
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                Subscription plans, checkout cycles, and account scaling terms are detailed in our{" "}
                <Link href="/terms" className="text-emerald-400 hover:underline font-bold">
                  Terms &amp; Conditions
                </Link>
                . For clarity, ANSH Forms enforces a no-refund policy. We do not offer partial refunds or account credit adjustments for early cancellation, workspace size reduction, or general non-use of active paid plans.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              11. Policy Updates
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                We may periodically update this Privacy Policy to reflect changing product behaviors, features, or compliance frameworks. Any updates will be posted here with an updated revision date. Your continued use of ANSH Forms after updates are posted constitutes acceptance of those revisions.
              </p>
            </div>
          </section>

        </div>
        
        {/* Simple Footer */}
        <div className="mt-12 flex flex-col items-center gap-4 select-none">
          <MsmeBadge />
          <p className="text-center text-[10px] text-zinc-600">
            &copy; 2026 ANSH Forms. Hosted securely within the ANSH Apps Ecosystem.
          </p>
        </div>

      </main>
    </div>
  );
}
