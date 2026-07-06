import { SITE_NAME } from "@/lib/site";
import { WHAT_FORMS_DOES, LANDING_FAQS } from "@/lib/landing-seo";

export default function LandingSeoContent() {
  return (
    <noscript>
      <div style={{ display: "none" }}>
        <h1>{SITE_NAME} — High-Performance Forms & AI Landing Page Builder</h1>
        <p>{WHAT_FORMS_DOES}</p>
        
        <h2>Core Features of {SITE_NAME}</h2>
        <ul>
          <li>
            <strong>Intuitive Visual Builder:</strong> Design polished multi-step forms using a drag-and-build canvas with live previews. Customize validation rules and responsive input styles easily.
          </li>
          <li>
            <strong>AI-Powered Generation:</strong> Draft fully custom form schemas in seconds using natural language prompts. Fine-tune fields and settings instantly.
          </li>
          <li>
            <strong>Granular Brand Customization:</strong> Take command of header logos, footers, typography tone, and styling assets. Select premium backgrounds.
          </li>
          <li>
            <strong>Real-Time Response Insights:</strong> Monitor views, conversion funnels, and completion metrics from interactive dashboard charts. Export data to CSV.
          </li>
          <li>
            <strong>Centralized Media Library:</strong> Manage brand logo assets, forms-specific media files, and attachment uploads securely.
          </li>
          <li>
            <strong>Instant Sharing & QR Codes:</strong> Share forms with automatically generated short links, embed codes, or high-res QR codes.
          </li>
        </ul>

        <h2>Frequently Asked Questions</h2>
        {LANDING_FAQS.map((faq, index) => (
          <div key={index}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </div>
    </noscript>
  );
}
