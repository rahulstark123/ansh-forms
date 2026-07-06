import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { buildSiteMetadata } from "@/lib/seo";
import { MsmeBadge } from "@/components/shared/msme-badge";

export const metadata = buildSiteMetadata({
  title: "Terms & Conditions",
  description: "Terms and Conditions governing the use of ANSH Forms.",
  path: "/terms",
});

export default function TermsPage() {
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
          id="back-home-link-terms"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200 mb-10 group w-fit"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Back to ANSH Forms</span>
        </Link>

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Legal Agreements</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Terms &amp; Conditions
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
              1. Acceptance of Terms
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                These Terms &amp; Conditions govern your access to and use of ANSH Forms, our digital form builder, response canvases, custom stylesheet configurators, real-time analytics dashboards, and other related software services (collectively, &quot;ANSH Forms&quot;).
              </p>
              <p>
                By creating a corporate workspace, logging into the application, or designing forms on the platform, you agree to be bound by these terms. If you do not agree to all provisions, you must immediately terminate use of the service.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              2. Service Description
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                ANSH Forms is a digital workspace platform for individuals and teams to build, style, publish, and analyze custom web forms. Features include visual drag-and-build canvases, AI drafting assistants, custom branding toolsets, unique share links, downloadable QR codes, and integrated respondent analytics dashboards.
              </p>
              <p>
                We reserve the right to alter, update, or discontinue specific product modules, tier limits, or database capabilities at any time. We will endeavor to notify workspace owners in advance of any material deprecations.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              3. Account Responsibility
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                To utilize the workspace features, you must register for an account using a valid email address and maintain strong login credentials. You are solely responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 mt-2">
                <li>All activities occurring under your workspace seats.</li>
                <li>The compliance, truthfulness, and legality of questions added to your forms.</li>
                <li>Ensuring custom styles or assets uploaded to your media library do not violate intellectual property rights.</li>
              </ul>
              <p className="mt-2">
                You must report any unauthorized access or security breaches to support@anshapps.com immediately.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              4. Subscription, Billing, and Renewal
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                Paid tiers are billed in advance on a recurring monthly or annual basis via our secure payment partners (e.g., Stripe).
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 mt-2">
                <li>
                  <strong className="text-zinc-200">Payment Authorization:</strong> You authorize us to charge your designated payment method for all subscription fees, taxes, and overages.
                </li>
                <li>
                  <strong className="text-zinc-200">Price Adjustments:</strong> Pricing and seat thresholds may be adjusted with a minimum of 30 days prior notice sent to the workspace administrator&apos;s registered email.
                </li>
                <li>
                  <strong className="text-zinc-200">Automatic Renewal:</strong> Unless cancelled before the next billing timestamp, your subscription will automatically renew under the same terms.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              5. Cancellation and No-Refund Policy
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                You may cancel your workspace subscription at any time via the billing console. Upon cancellation, your access to premium builder slots, AI features, and extra storage remains active until the end of the current billing cycle.
              </p>
              <p className="font-semibold text-zinc-200 mt-3">
                Strict No-Refund Rule:
              </p>
              <p>
                All billing transactions on ANSH Forms are final. We do not provide refunds, credits, or prorated adjustments for user-initiated cancellations, workspace downsizing, account deletions, or unused months in an active annual plan.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              6. Acceptable Use
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                You agree not to utilize ANSH Forms to design, distribute, or capture responses containing illegal or abusive contents. Prohibited uses include, but are not limited to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 mt-2">
                <li>Forms designed to trick users into submitting credit card pins, passwords, or government IDs (phishing).</li>
                <li>Forms designed to harvest contact details for automated email spamming.</li>
                <li>Uploading malware, trojans, or infected executables through attachment upload questions.</li>
                <li>Using automated scraping tools or scripts to stress-test our form response endpoints.</li>
              </ul>
              <p className="mt-2">
                Violations of this section will result in immediate workspace termination without notice or refund.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              7. Data, Privacy, and Compliance
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                Your use of the services is also governed by our{" "}
                <Link href="/privacy" className="text-emerald-400 hover:underline font-bold">
                  Privacy Policy
                </Link>
                . We follow applicable Indian legal requirements, including relevant provisions under the Information Technology Act, 2000 and the Digital Personal Data Protection (DPDP) Act.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              8. Service Availability
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                While we aim to maintain high availability for your published forms, we do not guarantee uninterrupted access. The service may be temporarily unavailable for scheduled database updates, infrastructure scaling, or emergency repairs. ANSH Forms is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              9. Limitation of Liability
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                To the maximum extent permitted by law, ANSH Forms, its affiliates, and its developers will not be liable for any indirect, loss of profits, data corruption, or business interruption damages. Our total liability for any legal claims arising under this agreement is strictly capped at the fees paid by you to ANSH Forms during the three (3) months preceding the incident.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              10. Governing Law and Jurisdiction
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                These Terms &amp; Conditions and any disputes arising out of or in connection with them are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of the competent courts in India.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              11. Contact Us
            </h2>
            <div className="text-zinc-300 text-sm leading-relaxed pl-4 space-y-3 font-medium">
              <p>
                For questions, support inquiries, or legal clarifications regarding these terms, please contact us at:
              </p>
              <a href="mailto:support@anshapps.com" className="inline-flex items-center gap-2 text-emerald-400 hover:underline font-bold mt-1">
                <Mail className="h-4 w-4" />
                <span>support@anshapps.com</span>
              </a>
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
