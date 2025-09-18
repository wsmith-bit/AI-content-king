import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import FeaturesSection from "@/components/features-section";
import DashboardDemo from "@/components/dashboard-demo";
import FAQSection from "@/components/faq-section";
import CTASection from "@/components/cta-section";
import Footer from "@/components/footer";
import ContentOptimizer from "@/components/content-optimizer";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { resolveApiUrl } from "@/lib/api";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  // Generate SEO metadata and Schema.org markup
  const { data: seoData } = useQuery({
    queryKey: ["/api/optimize/seo-metadata"],
    queryFn: async () => {
      const response = await fetch(resolveApiUrl("/api/optimize/seo-metadata"), {
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
          {isAuthenticated && user ? (
            // Authenticated user dashboard
            <div className="container mx-auto px-4 py-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2" data-testid="welcome-title">
                  Welcome back, {user.firstName || user.email}!
                </h1>
                <p className="text-muted-foreground" data-testid="welcome-description">
                  Optimize your content for AI search engines with our comprehensive optimization tools.
                </p>
              </div>
              
              <ContentOptimizer />
              
              <div className="mt-12">
                <section id="dashboard">
                  <DashboardDemo />
                </section>
              </div>
            </div>
          ) : (
            // Public marketing site
            <>
              <HeroSection />
              <FeaturesSection />
              <section id="dashboard">
                <DashboardDemo />
              </section>
              <section id="pricing" className="py-20 bg-muted/30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                  <p className="text-lg text-muted-foreground mb-8">Choose the plan that fits your content optimization needs</p>
                  <div className="bg-background rounded-2xl border border-border shadow-xl p-8">
                    <h3 className="text-2xl font-bold mb-2">Professional Plan</h3>
                    <p className="text-4xl font-bold text-primary mb-4">$49<span className="text-lg text-muted-foreground">/month</span></p>
                    <ul className="text-left mb-6 space-y-2">
                      <li>✅ 96+ point AI optimization checklist</li>
                      <li>✅ Automated Schema.org markup</li>
                      <li>✅ Voice search optimization</li>
                      <li>✅ Multi-AI engine support</li>
                      <li>✅ Core Web Vitals optimization</li>
                    </ul>
                  </div>
                </div>
              </section>
              <section id="docs" className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Documentation & Resources</h2>
                  <p className="text-lg text-muted-foreground mb-8">Everything you need to get started with AI SEO optimization</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-background rounded-xl border border-border p-6">
                      <h3 className="text-xl font-semibold mb-3">Quick Start Guide</h3>
                      <p className="text-muted-foreground">Get up and running with our platform in minutes</p>
                    </div>
                    <div className="bg-background rounded-xl border border-border p-6">
                      <h3 className="text-xl font-semibold mb-3">API Reference</h3>
                      <p className="text-muted-foreground">Complete API documentation for developers</p>
                    </div>
                  </div>
                </div>
              </section>
              <FAQSection />
              <CTASection />
            </>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
