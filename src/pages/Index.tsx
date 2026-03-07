import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FlywheelSection from "@/components/landing/FlywheelSection";
import PrinciplesSection from "@/components/landing/PrinciplesSection";
import VolunteerSection from "@/components/landing/VolunteerSection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <HeroSection />
      <FlywheelSection />
      <PrinciplesSection />
      <VolunteerSection />
      <Footer />
    </div>
  );
};

export default Index;
