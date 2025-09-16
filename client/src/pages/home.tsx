import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import DashboardDemo from "@/components/dashboard-demo";
import FAQSection from "@/components/faq-section";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  // Generate SEO metadata and Schema.org markup
  const { data: seoData } = useQuery({
    queryKey: ["/api/optimize/seo-metadata"],
    queryFn: async () => {
      const response = await fetch("/api/optimize/seo-metadata", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch SEO data");
      }
      return response.json();
    },
  });

  return (
    <>
      {/* SEO and Schema.org JSON-LD */}
      {seoData && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(seoData.organizationSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(seoData.personSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(seoData.webSiteSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(seoData.webPageSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(seoData.articleSchema),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(seoData.faqSchema),
            }}
          />
        </>
      )}
      
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Navigation />
        <main>
          <HeroSection />
          <FeaturesSection />
          <DashboardDemo />
          <FAQSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
}
