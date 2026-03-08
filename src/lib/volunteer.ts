/** Training module definitions (content is placeholder per PRD) */
export const TRAINING_MODULES = [
  {
    key: "active-listening",
    title: "Active Listening Fundamentals",
    description: "Learn reflective listening, paraphrasing, and empathic response techniques.",
    duration: "45 min",
    category: "Core",
  },
  {
    key: "boundaries-ethics",
    title: "Boundaries & Ethics",
    description: "Understanding professional boundaries, confidentiality, and ethical guidelines.",
    duration: "30 min",
    category: "Core",
  },
  {
    key: "crisis-recognition",
    title: "Crisis Recognition & Escalation",
    description: "Identifying signs of crisis and following the Echo escalation protocol.",
    duration: "60 min",
    category: "Core",
  },
  {
    key: "cultural-sensitivity",
    title: "Cultural Sensitivity & Inclusion",
    description: "Working with seekers from diverse cultural, religious, and social backgrounds.",
    duration: "45 min",
    category: "Core",
  },
  {
    key: "trauma-informed",
    title: "Trauma-Informed Care Basics",
    description: "Understanding trauma responses and providing safe, non-re-traumatising support.",
    duration: "60 min",
    category: "Advanced",
  },
  {
    key: "self-care",
    title: "Volunteer Self-Care",
    description: "Recognising compassion fatigue and building personal resilience strategies.",
    duration: "30 min",
    category: "Wellbeing",
  },
  {
    key: "platform-orientation",
    title: "Echo Platform Orientation",
    description: "Navigating the Cocoon session interface, messaging tools, and safety features.",
    duration: "20 min",
    category: "Platform",
  },
];

export const SPECIALISATIONS = [
  "Anxiety & Stress",
  "Grief & Loss",
  "Trauma Recovery",
  "Relationship Support",
  "Youth & Adolescents",
  "LGBTQ+ Support",
  "Substance Use",
  "Family Dynamics",
  "Life Transitions",
  "Spiritual Care",
];

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
