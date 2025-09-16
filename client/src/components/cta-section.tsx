import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="cta-title">
            Ready to Optimize for AI Discovery?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto" data-testid="cta-description">
            Join thousands of content creators and SEO professionals who trust our platform for comprehensive AI optimization. 
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-primary px-8 py-4 hover:bg-gray-100"
              data-testid="button-free-trial"
            >
              Start Free 14-Day Trial
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="border-white/30 bg-white/10 text-white px-8 py-4 hover:bg-white/20"
              data-testid="button-demo"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
