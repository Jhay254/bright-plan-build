import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FlywheelSection from "@/components/landing/FlywheelSection";
import PrinciplesSection from "@/components/landing/PrinciplesSection";
import VolunteerSection from "@/components/landing/VolunteerSection";
import Footer from "@/components/landing/Footer";
import CookieBanner from "@/components/CookieBanner";
import { Helmet } from "react-helmet-async";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Echo",
  url: "https://bright-plan-build.lovable.app",
  logo: "https://bright-plan-build.lovable.app/favicon.ico",
  description:
    "Echo connects you with trained, compassionate volunteers in a safe, anonymous space. Free forever.",
  sameAs: [],
};

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Echo — Safe, Dignified Mental Health Support</title>
        <meta
          name="description"
          content="Echo connects you with trained, compassionate volunteers in a safe, anonymous space. Free forever. At your pace. On your terms."
        />
        <link rel="canonical" href="https://bright-plan-build.lovable.app/" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <div className="min-h-screen bg-parchment">
        <Navbar />
        <main id="main-content">
          <HeroSection />
          <FlywheelSection />
          <PrinciplesSection />
          <VolunteerSection />
        </main>
        <Footer />
        <CookieBanner />
      </div>
    </>
  );
};

export default Index;
