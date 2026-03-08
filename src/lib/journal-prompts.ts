export type PromptCategory = "gratitude" | "processing" | "coping" | "growth" | "post-session";

export interface JournalPrompt {
  id: string;
  text: string;
  category: PromptCategory;
}

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Gratitude
  { id: "g1", text: "What is one small thing that brought you comfort today?", category: "gratitude" },
  { id: "g2", text: "Name three things you're grateful for right now, no matter how small.", category: "gratitude" },
  { id: "g3", text: "Who made a positive difference in your life recently? What did they do?", category: "gratitude" },
  { id: "g4", text: "What is something about yourself you appreciate today?", category: "gratitude" },
  { id: "g5", text: "Describe a moment this week when you felt at peace.", category: "gratitude" },

  // Processing
  { id: "p1", text: "What emotion has been showing up most often for you lately? What might it be telling you?", category: "processing" },
  { id: "p2", text: "Write about something that's been weighing on your mind. Let it flow without editing.", category: "processing" },
  { id: "p3", text: "If you could say something to your past self, what would it be?", category: "processing" },
  { id: "p4", text: "What is one thing you've been avoiding thinking about? Why might that be?", category: "processing" },
  { id: "p5", text: "Describe a recent experience that surprised you emotionally.", category: "processing" },
  { id: "p6", text: "What does safety mean to you? When do you feel safest?", category: "processing" },

  // Coping
  { id: "c1", text: "What helped you get through a difficult moment this week?", category: "coping" },
  { id: "c2", text: "List three things you can do when you feel overwhelmed.", category: "coping" },
  { id: "c3", text: "Describe your ideal calm space — what does it look, sound, and feel like?", category: "coping" },
  { id: "c4", text: "What is one boundary you'd like to set or strengthen?", category: "coping" },
  { id: "c5", text: "Write a kind message to yourself for a hard day.", category: "coping" },

  // Growth
  { id: "gr1", text: "What have you learned about yourself in the last month?", category: "growth" },
  { id: "gr2", text: "Describe a challenge you've overcome. What strength did you draw on?", category: "growth" },
  { id: "gr3", text: "What does healing look like for you? How will you know you're making progress?", category: "growth" },
  { id: "gr4", text: "If you could change one pattern in your life, what would it be?", category: "growth" },
  { id: "gr5", text: "What is one step — no matter how small — you can take toward your goals today?", category: "growth" },

  // Post-session
  { id: "ps1", text: "How are you feeling after your session? What stood out to you?", category: "post-session" },
  { id: "ps2", text: "Was there something your volunteer said that resonated with you? Write it down.", category: "post-session" },
  { id: "ps3", text: "What's one insight or takeaway from your session today?", category: "post-session" },
  { id: "ps4", text: "Is there something you wanted to say during the session but didn't? Write it here.", category: "post-session" },
];

/** Returns `count` random prompts, optionally filtered by category. */
export function getRandomPrompts(count: number, category?: PromptCategory): JournalPrompt[] {
  const pool = category ? JOURNAL_PROMPTS.filter((p) => p.category === category) : JOURNAL_PROMPTS.filter((p) => p.category !== "post-session");
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Returns one random post-session prompt. */
export function getPostSessionPrompt(): JournalPrompt {
  const pool = JOURNAL_PROMPTS.filter((p) => p.category === "post-session");
  return pool[Math.floor(Math.random() * pool.length)];
}
