import { Heart, Search, Sparkles, BookOpen, Users, Share2, Lightbulb, HandHeart } from "lucide-react";

const stages = [
  { icon: Search, name: "Discover", description: "Find Echo through authentic stories that say 'you are not alone.'", color: "text-forest" },
  { icon: HandHeart, name: "Seek", description: "Register anonymously. Get matched with a vetted volunteer.", color: "text-fern" },
  { icon: Heart, name: "Heal", description: "Engage in safe, trauma-informed sessions at your own pace.", color: "text-sage" },
  { icon: BookOpen, name: "Document", description: "Record your journey privately in your Healing Journal.", color: "text-dusk" },
  { icon: Users, name: "Connect", description: "Find curated mental health resources and share encouragements with others on the same journey.", color: "text-ember" },
  { icon: Share2, name: "Reflect", description: "Reflect privately in your Healing Journal. Track your moods, milestones, and growth over time.", color: "text-shore" },
  { icon: Lightbulb, name: "Encourage", description: "Your encouragements on the community wall reach someone who needs to hear them today.", color: "text-sunlight" },
  { icon: Sparkles, name: "Advocate", description: "When you're ready, apply to become a volunteer. Your lived experience becomes the foundation for helping others.", color: "text-forest" },
];

const FlywheelSection = () => {
  return (
    <section id="how-it-works" className="py-echo-4xl bg-parchment">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-echo-3xl">
          <p className="text-fern font-medium text-sm tracking-wider uppercase mb-3">
            The Healing Flywheel
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-bark mb-4">
            A journey that comes full circle
          </h2>
          <p className="text-driftwood text-lg leading-relaxed">
            Echo isn't a one-way service. It's a living cycle where healing creates 
            the conditions for more healing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.name}
                className="group bg-sand rounded-echo-xl p-echo-lg shadow-echo-1 hover:shadow-echo-2 hover:-translate-y-0.5 transition-all duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-mist/50 flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${stage.color}`} />
                  </div>
                  <span className="text-xs font-medium text-driftwood uppercase tracking-wider">
                    Stage {i + 1}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-bark mb-2">
                  {stage.name}
                </h3>
                <p className="text-sm text-driftwood leading-relaxed">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FlywheelSection;
