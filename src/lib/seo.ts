import { Metadata } from "next";
import { SITE_URL, SITE_NAME, DEFAULT_TITLE, DEFAULT_DESCRIPTION, SEO_KEYWORDS, GOOGLE_SITE_VERIFICATION } from "./site";
import { WHAT_FORMS_DOES, LANDING_FAQS } from "./landing-seo";

interface MetadataProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

export function buildSiteMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: MetadataProps = {}): Metadata {
  const finalTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const url = `${SITE_URL}${path}`;

  const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: finalTitle,
    description: finalDescription,
    keywords: SEO_KEYWORDS,
    applicationName: SITE_NAME,
    publisher: SITE_NAME,
    creator: "ANSH Apps",
    authors: [{ name: "ANSH Apps", url: "https://anshapps.com" }],
    verification: {
      google: GOOGLE_SITE_VERIFICATION || undefined,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDescription,
    },
    icons: {
      icon: "/anshFavicon.png",
    },
  };

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}

export function buildWebSiteNameJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "name": SITE_NAME,
    "alternateName": ["ANSH Forms App", "Ansh Forms"],
    "url": `${SITE_URL}/`
  };
}

export function buildLandingJsonLd() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": SITE_NAME,
    "url": SITE_URL,
    "parentOrganization": {
      "@type": "Organization",
      "name": "ANSH Apps",
      "url": "https://anshapps.com"
    }
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    "url": `${SITE_URL}/`,
    "name": SITE_NAME,
    "headline": DEFAULT_TITLE,
    "description": WHAT_FORMS_DOES,
    "publisher": {
      "@id": `${SITE_URL}/#organization`
    }
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/#softwareapplication`,
    "name": SITE_NAME,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "url": SITE_URL,
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "INR",
      "lowPrice": "0",
      "highPrice": "399",
      "offers": [
        {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR",
          "name": "Free Plan"
        },
        {
          "@type": "Offer",
          "price": "399",
          "priceCurrency": "INR",
          "name": "Pro Plan"
        }
      ]
    }
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": LANDING_FAQS.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      webPageSchema,
      softwareApplicationSchema,
      faqPageSchema
    ]
  };
}
