import { Shield, Globe, MessageCircleHeart, Zap } from "lucide-react";

const principles = [
  {
    icon: Shield,
    title: "Dignity & Safety",
    description: "Person-first language. Trauma-informed design. No clinical pathologising. Every interaction assumes the person may have experienced trauma.",
    accent: "bg-forest/10 text-forest",
  },
  {
    icon: Globe,
    title: "Meaningful Access",
    description: "Available in 5 languages — English, French, Swahili, Arabic, and Portuguese. Zero financial barrier — free forever for seekers.",
    accent: "bg-shore/20 text-shore",
  },
  {
    icon: MessageCircleHeart,
    title: "Participation",
    description: "In-session feedback after every Cocoon conversation. Emotional check-ins and skill endorsements that directly shape volunteer development.",
    accent: "bg-ember/15 text-ember",
  },
  {
    icon: Zap,
    title: "Empowerment",
    description: "Seeker-led healing goals. Full data ownership with export and deletion. A private journal to track your journey on your own terms.",
    accent: "bg-dusk/15 text-dusk",
  },
];

const PrinciplesSection = () => {
  return (
    <section id="principles" className="py-echo-4xl bg-dawn/40">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-echo-3xl">
          <p className="text-fern font-medium text-sm tracking-wider uppercase mb-3">
            Built on principles, not trends
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-bark mb-4">
            Every feature answers to these four
          </h2>
          <p className="text-driftwood text-lg leading-relaxed">
            These aren't aspirational. They are structural requirements. Any feature 
            that can't satisfy them is redesigned or removed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="bg-parchment rounded-echo-xl p-echo-xl shadow-echo-1 hover:shadow-echo-2 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-echo-md flex items-center justify-center mb-4 ${principle.accent}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-bark mb-3">
                  {principle.title}
                </h3>
                <p className="text-driftwood leading-relaxed">
                  {principle.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PrinciplesSection;
