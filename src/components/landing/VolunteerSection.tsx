import { Button } from "@/components/ui/button";
import { Award, TrendingUp, BookOpen, Users } from "lucide-react";

const benefits = [
  { icon: Award, title: "Verified Impact Portfolio", description: "Build a credentialed record of your sessions, hours, and skill endorsements from seekers." },
  { icon: TrendingUp, title: "CPD & Certificates", description: "Log continuing professional development hours and generate verifiable PDF certificates." },
  { icon: BookOpen, title: "Self-Paced Training", description: "Complete structured training modules with quizzes before accepting your first session." },
  { icon: Users, title: "Purposeful Impact", description: "Every session you give is tracked, endorsed, and contributes to your verified impact portfolio." },
];

const VolunteerSection = () => {
  return (
    <section id="for-volunteers" className="py-echo-4xl bg-parchment">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-echo-3xl items-center max-w-5xl mx-auto">
          <div>
            <p className="text-shore font-medium text-sm tracking-wider uppercase mb-3">
              For Volunteers
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-bark mb-4">
              Your expertise deserves more than a time sheet
            </h2>
            <p className="text-driftwood text-lg leading-relaxed mb-8">
              Echo answers the question every volunteer asks but never says out loud: 
              "What do I get from this that I cannot get from my current life?" 
              The answer is real.
            </p>
            <Button variant="hero">Become a Volunteer</Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-sand rounded-echo-lg p-echo-lg shadow-echo-1"
                >
                  <Icon className="w-5 h-5 text-shore mb-3" />
                  <h3 className="font-heading text-sm font-semibold text-bark mb-1.5">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-driftwood leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VolunteerSection;
