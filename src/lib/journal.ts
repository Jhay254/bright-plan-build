import type { Database } from "@/integrations/supabase/types";

type JournalMood = Database["public"]["Enums"]["journal_mood"];

export interface MoodOption {
  value: JournalMood;
  emoji: string;
  label: string;
  color: string; // Tailwind class
}

export const MOOD_OPTIONS: MoodOption[] = [
  { value: "joyful", emoji: "😊", label: "Joyful", color: "bg-sunlight/30 border-sunlight" },
  { value: "calm", emoji: "😌", label: "Calm", color: "bg-mist border-sage" },
  { value: "hopeful", emoji: "🌱", label: "Hopeful", color: "bg-dawn border-fern" },
  { value: "neutral", emoji: "😐", label: "Neutral", color: "bg-sand border-stone" },
  { value: "anxious", emoji: "😰", label: "Anxious", color: "bg-ember/20 border-ember" },
  { value: "sad", emoji: "😢", label: "Sad", color: "bg-shore/30 border-shore" },
  { value: "angry", emoji: "😤", label: "Angry", color: "bg-care-alert/15 border-care-alert" },
  { value: "overwhelmed", emoji: "😵", label: "Overwhelmed", color: "bg-dusk/15 border-dusk" },
];

export const getMoodOption = (mood: JournalMood | null): MoodOption | undefined =>
  mood ? MOOD_OPTIONS.find((m) => m.value === mood) : undefined;

export const SUGGESTED_TAGS = [
  "gratitude", "progress", "setback", "insight", "dream",
  "trigger", "coping", "self-care", "relationship", "therapy",
];
