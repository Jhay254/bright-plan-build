import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-dawn pt-16">
      <div className="absolute inset-0">
        <img src={heroIllustration} alt="" className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-dawn/60 via-dawn/40 to-parchment" />
      </div>

      <div className="container relative z-10 mx-auto px-6 py-echo-4xl text-center">
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <p className="text-fern font-medium text-sm tracking-wider uppercase mb-4">
            Dignity · Safety · Meaningful Access · Empowerment
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-bark leading-tight mb-6">
            You are not alone.{" "}
            <span className="text-forest">Healing starts here.</span>
          </h1>
          <p className="text-lg md:text-xl text-driftwood leading-relaxed max-w-2xl mx-auto mb-10">
            Echo connects you with trained, compassionate volunteers in a safe,
            anonymous space. At your pace. On your terms. Completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" asChild>
              <Link to="/auth">I Need Support</Link>
            </Button>
            <Button variant="hero-outline" asChild>
              <Link to="/volunteer">I Want to Volunteer</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-driftwood">
            Free forever for seekers. No account required to explore.
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 40 1440 40V80H0V40Z" fill="hsl(40, 20%, 98%)" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
