export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CCE Game Guide",
    "alternateName": "Professional Gaming Guides & Resource Recommendations",
    "url": "https://game-seo-links.netlify.app",
    "description": "Professional gaming guide website providing the latest and most comprehensive game guides, strategy tips and resource recommendations",
    "inLanguage": ["en", "zh", "nl", "de"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://game-seo-links.netlify.app/?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "CCE Game Guide",
      "logo": {
        "@type": "ImageObject",
        "url": "https://game-seo-links.netlify.app/logo.png"
      }
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Game Guide Articles",
      "description": "Professional game guides and resource recommendation articles",
      "itemListElement": [
        {
          "@type": "Article",
          "name": "Game Currency Purchase Guide",
          "description": "Professional guide for safely purchasing game currency"
        },
        {
          "@type": "Article",
          "name": "Game Strategy Tips",
          "description": "Practical strategies for improving gaming skills"
        }
      ]
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CCE Game Guide",
    "url": "https://game-seo-links.netlify.app",
    "logo": "https://game-seo-links.netlify.app/logo.png",
    "description": "Professional gaming guide website providing game guides, strategy tips and resource recommendation services",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": ["English", "Chinese", "Dutch", "German"]
    },
    "sameAs": [
      "https://game-seo-links.netlify.app"
    ],
    "knowsAbout": [
      "game guides",
      "gaming strategies",
      "game currency",
      "game items",
      "gaming tips",
      "game boosting"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
