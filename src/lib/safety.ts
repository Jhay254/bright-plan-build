/**
 * Crisis keyword detection for safety guardrails.
 * Returns true if the text contains crisis-related language.
 */

const CRISIS_PATTERNS = [
  /\b(kill\s*(my)?self|suicide|suicidal|end\s*(my|it\s*all)?\s*life)\b/i,
  /\b(want\s*to\s*die|don'?t\s*want\s*to\s*(live|be\s*alive|exist))\b/i,
  /\b(self[- ]?harm|cutting\s*(my)?self|hurt\s*(my)?self)\b/i,
  /\b(overdose|jump\s*off|hang\s*(my)?self)\b/i,
  /\b(no\s*reason\s*to\s*live|better\s*off\s*dead|wish\s*i\s*was\s*dead)\b/i,
  /\b(planning\s*(to\s*)?(die|end\s*it)|goodbye\s*letter)\b/i,
];

export const detectCrisisLanguage = (text: string): boolean => {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
};

export const EMERGENCY_RESOURCES = [
  { region: "🇺🇸 US", name: "988 Suicide & Crisis Lifeline", contact: "988" },
  { region: "🌍 Global", name: "Crisis Text Line", contact: "Text HELLO to 741741" },
  { region: "🇬🇧 UK", name: "Samaritans", contact: "116 123" },
  { region: "🇨🇦 Canada", name: "Talk Suicide Canada", contact: "1-833-456-4566" },
  { region: "🇦🇺 Australia", name: "Lifeline", contact: "13 11 14" },
];
