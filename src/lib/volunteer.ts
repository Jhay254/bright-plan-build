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

/** Training module content for expandable panels */
export interface TrainingModuleContent {
  material: string[];
  takeaways: string[];
  assessment?: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}

export const TRAINING_CONTENT: Record<string, TrainingModuleContent> = {
  "active-listening": {
    material: [
      "Active listening is the foundation of peer support. It means giving your full attention to the speaker, understanding their message, and responding thoughtfully rather than reactively.",
      "Key techniques include paraphrasing (restating what someone said in your own words), reflecting feelings (naming the emotion you hear), and using open-ended questions to invite deeper sharing.",
      "Avoid common pitfalls: don't interrupt, don't jump to solutions, and resist the urge to share your own similar experiences unless invited.",
    ],
    takeaways: [
      "Listen to understand, not to respond",
      "Use paraphrasing to show you heard correctly",
      "Reflect feelings: 'It sounds like you're feeling…'",
      "Silence is okay — give space for processing",
    ],
    assessment: {
      question: "A seeker says: 'I've been struggling with sleep and can't focus at work.' What is the best active listening response?",
      options: [
        "You should try melatonin, it really helped me.",
        "It sounds like the lack of sleep is affecting many areas of your life. Can you tell me more?",
        "That's normal, a lot of people have trouble sleeping.",
        "Have you talked to your doctor about this?",
      ],
      correctIndex: 1,
    },
  },
  "boundaries-ethics": {
    material: [
      "As a volunteer, you are a peer supporter — not a therapist, counsellor, or medical professional. Understanding this distinction is critical to providing safe and effective support.",
      "Key boundaries include: maintaining confidentiality (except in cases of immediate risk), avoiding dual relationships, not sharing personal contact details, and recognising when to refer a seeker to professional help.",
      "Ethical guidelines require you to be honest about your role, avoid making promises you cannot keep, and report any safeguarding concerns through the proper Echo channels.",
    ],
    takeaways: [
      "You are a peer supporter, not a therapist",
      "Confidentiality is paramount except when safety is at risk",
      "Never share personal contact information",
      "Know when to refer to professional services",
    ],
    assessment: {
      question: "A seeker asks for your personal phone number so they can reach you outside of Echo. What should you do?",
      options: [
        "Give them your number — building trust is important",
        "Politely decline and explain that all communication happens through Echo for everyone's safety",
        "Give them a secondary number you don't use much",
        "Ignore the request and change the subject",
      ],
      correctIndex: 1,
    },
  },
  "crisis-recognition": {
    material: [
      "Crisis recognition is one of the most important skills you will learn. A crisis exists when a person is at imminent risk of harm to themselves or others.",
      "Warning signs include: direct statements about wanting to die or harm themselves, expressions of hopelessness, giving away possessions, sudden calmness after a period of distress, and mentions of specific plans or means.",
      "When you detect crisis language, Echo will automatically flag the conversation. Your role is to stay calm, validate the person's feelings, avoid minimising their experience, and follow the escalation protocol: keep them talking, share emergency resources, and alert the admin team.",
    ],
    takeaways: [
      "Take every mention of self-harm seriously",
      "Stay calm — your composure helps the seeker feel safer",
      "Never promise to keep suicidal ideation a secret",
      "Follow the Echo escalation protocol immediately",
    ],
    assessment: {
      question: "A seeker says: 'I've made a plan and I'm going to do it tonight.' What is your first action?",
      options: [
        "Try to talk them out of it and explain why life is worth living",
        "Stay calm, acknowledge their pain, share crisis resources, and ensure the admin team is alerted",
        "Tell them you'll call the police",
        "End the session so a professional can handle it",
      ],
      correctIndex: 1,
    },
  },
  "cultural-sensitivity": {
    material: [
      "Echo serves a global community with diverse cultural, religious, and social backgrounds. Cultural sensitivity means approaching each seeker with humility, curiosity, and respect for their worldview.",
      "Avoid assumptions about someone's beliefs, family structures, or values based on their background. Ask open-ended questions about what matters to them, and be willing to learn.",
      "Be aware of your own cultural biases. Concepts like mental health, emotional expression, and help-seeking behaviour vary significantly across cultures. What feels supportive in one culture may feel intrusive in another.",
    ],
    takeaways: [
      "Approach every seeker with cultural humility",
      "Ask about their values rather than assuming them",
      "Be aware of your own cultural biases",
      "Respect different ways of expressing and processing emotions",
    ],
    assessment: {
      question: "A seeker from a collectivist culture says they can't discuss personal problems because it would shame their family. What approach is most appropriate?",
      options: [
        "Explain that talking about problems is healthy and they should be more open",
        "Respect their perspective while gently exploring what support feels safe within their cultural context",
        "Suggest they need to put their own needs first",
        "Agree that they shouldn't talk about it and end the session",
      ],
      correctIndex: 1,
    },
  },
  "trauma-informed": {
    material: [
      "Trauma-informed care recognises that many seekers have experienced significant adversity. It shifts the question from 'What's wrong with you?' to 'What happened to you?'",
      "Core principles include: safety (ensuring the seeker feels physically and emotionally safe), trustworthiness (being consistent and transparent), choice (giving the seeker control over the conversation), collaboration (working alongside, not directing), and empowerment (focusing on strengths, not deficits).",
      "Avoid re-traumatisation by never pushing someone to share details of traumatic events. Let them lead the conversation. Watch for signs of dissociation or emotional flooding, and gently ground them if needed.",
    ],
    takeaways: [
      "Never push a seeker to relive traumatic details",
      "Focus on safety, choice, and empowerment",
      "Watch for signs of dissociation or emotional flooding",
      "Use grounding techniques when needed",
    ],
    assessment: {
      question: "A seeker starts describing a traumatic event in graphic detail and becomes increasingly distressed. What should you do?",
      options: [
        "Encourage them to keep going — getting it out will help",
        "Gently pause them, validate their courage, and use a grounding technique to bring them back to the present",
        "Change the subject to distract them",
        "Tell them they seem too upset to continue and suggest ending the session",
      ],
      correctIndex: 1,
    },
  },
  "self-care": {
    material: [
      "Compassion fatigue is a real risk for anyone in a helping role. It can manifest as emotional exhaustion, reduced empathy, difficulty sleeping, irritability, or a sense of hopelessness.",
      "Prevention is key: set clear boundaries around your volunteering hours, debrief regularly (with peers or supervisors), maintain activities that replenish you, and be honest with yourself about your capacity.",
      "If you notice signs of burnout, reduce your session load or take a break. Echo supports volunteers who need time off — your wellbeing is not negotiable.",
    ],
    takeaways: [
      "Recognise early signs of compassion fatigue",
      "Set boundaries around volunteering hours",
      "Debrief regularly after difficult sessions",
      "Taking breaks is strength, not weakness",
    ],
  },
  "platform-orientation": {
    material: [
      "The Cocoon is Echo's private conversation space. When a seeker requests a session, the matching algorithm scores available volunteers based on language, specialisation, availability, and load balance.",
      "During a session, you'll see status indicators showing the session lifecycle: Requested → Matched → Active → Wrap Up → Closed. Use the session controls to advance the status as appropriate.",
      "Safety features are built into the platform: crisis language is automatically detected and flagged, the admin team receives real-time alerts, and emergency resources are shown to seekers. All sessions are anonymous by default.",
    ],
    takeaways: [
      "Understand the session lifecycle and status transitions",
      "Crisis detection is automatic — follow the protocol when alerted",
      "All conversations are anonymous and confidential",
      "Use the wrap-up phase to close sessions gently",
    ],
  },
};

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
