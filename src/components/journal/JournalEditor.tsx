import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateJournalEntry } from "@/hooks/use-journal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Flag, X, Lightbulb, RefreshCw } from "lucide-react";
import { MOOD_OPTIONS, SUGGESTED_TAGS } from "@/lib/journal";
import { getRandomPrompts, getPostSessionPrompt } from "@/lib/journal-prompts";
import type { Database } from "@/integrations/supabase/types";

type JournalMood = Database["public"]["Enums"]["journal_mood"];

const JournalEditor = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const createEntry = useCreateJournalEntry();
  const [searchParams] = useSearchParams();

  const isPostSession = searchParams.get("prompt") === "post-session";

  // Prompt state
  const [prompts, setPrompts] = useState(() =>
    isPostSession ? [getPostSessionPrompt()] : getRandomPrompts(3)
  );

  const refreshPrompts = () => {
    setPrompts(isPostSession ? [getPostSessionPrompt()] : getRandomPrompts(3));
  };

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalMood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneLabel, setMilestoneLabel] = useState("");

  const goalTags = profile?.healing_goals?.map((g) => g.toLowerCase().replace(/\s+/g, "-")) ?? [];
  const allSuggested = [...new Set([...SUGGESTED_TAGS, ...goalTags])];

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase().slice(0, 30);
    if (t && !tags.includes(t) && tags.length < 10) setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const usePrompt = (text: string) => {
    setContent((prev) => (prev ? prev + "\n\n" + text : text));
  };

  const handleSave = async () => {
    if (!user || !content.trim()) return;
    try {
      await createEntry.mutateAsync({
        user_id: user.id,
        title: title.trim() || null,
        content: content.trim(),
        mood,
        tags,
        is_milestone: isMilestone,
        milestone_label: isMilestone ? milestoneLabel.trim() || null : null,
      });
      toast({ title: "Entry saved" });
      navigate("/app/journal");
    } catch (e: any) {
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      <button onClick={() => navigate("/app/journal")} className="flex items-center gap-1 text-sm text-driftwood hover:text-dusk mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="font-journal text-2xl font-semibold text-bark mb-6">
        {isPostSession ? "Reflect on Your Session" : "New Entry"}
      </h1>

      {/* Prompt suggestions */}
      {!content && (
        <div className="bg-dawn rounded-echo-md p-4 border border-mist mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-dusk">
              <Lightbulb className="h-4 w-4" />
              <p className="text-xs font-medium uppercase tracking-wide">
                {isPostSession ? "Session reflection" : "Need inspiration?"}
              </p>
            </div>
            <button
              onClick={refreshPrompts}
              className="text-driftwood hover:text-dusk transition-colors"
              aria-label="Refresh prompts"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {prompts.map((p) => (
              <button
                key={p.id}
                onClick={() => usePrompt(p.text)}
                className="w-full text-left text-sm text-bark bg-card rounded-echo-md px-3 py-2.5 border border-border hover:border-dusk/40 hover:bg-mist/30 transition-colors"
              >
                {p.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, 100))}
        placeholder="Title (optional)"
        className="font-journal text-lg border-0 border-b border-stone rounded-none px-0 focus-visible:ring-0 focus-visible:border-dusk mb-4 bg-transparent"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, 5000))}
        placeholder="What's on your mind today…"
        aria-label="Journal entry content"
        className="w-full min-h-[200px] px-0 py-3 font-journal text-sm text-bark bg-transparent border-0 focus:outline-none resize-none placeholder:text-driftwood/50 leading-relaxed"
        autoFocus
      />
      <p className="text-[10px] text-driftwood text-right mb-6">{content.length}/5000</p>

      {/* Mood selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-bark mb-3">How are you feeling?</p>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mood selector">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? null : m.value)}
              role="radio"
              aria-checked={mood === m.value}
              aria-label={`Mood: ${m.label}`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-echo-pill text-sm border-2 transition-all ${
                mood === m.value ? `${m.color} font-medium` : "border-stone text-driftwood hover:border-dusk/40"
              }`}
            >
              <span>{m.emoji}</span><span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <p className="text-sm font-medium text-bark mb-3">Tags</p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-echo-pill text-xs font-medium bg-dusk/10 text-dusk border border-dusk/30">
                {tag}
                <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`} className="hover:text-care-alert"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value.slice(0, 30))}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
            placeholder="Add a tag…"
            className="text-sm h-9"
          />
          <Button variant="secondary" size="sm" onClick={() => addTag(tagInput)} disabled={!tagInput.trim()}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allSuggested.filter((t) => !tags.includes(t)).slice(0, 8).map((tag) => (
            <button key={tag} onClick={() => addTag(tag)} aria-label={`Add suggested tag ${tag}`} className="text-[11px] px-2.5 py-1 rounded-echo-pill border border-stone text-driftwood hover:border-dusk/40 hover:text-dusk transition-colors">
              + {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Milestone */}
      <div className="mb-8 bg-sand rounded-echo-md p-4 border border-stone">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => setIsMilestone(!isMilestone)}
            role="checkbox"
            aria-checked={isMilestone}
            aria-label="Mark as milestone"
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              isMilestone ? "bg-dusk border-dusk text-white" : "border-stone"
            }`}
          >
            {isMilestone && <Flag className="h-3.5 w-3.5" />}
          </button>
          <div>
            <p className="text-sm font-medium text-bark">Mark as milestone</p>
            <p className="text-xs text-driftwood">Highlight this as a significant moment in your journey</p>
          </div>
        </label>
        {isMilestone && (
          <Input
            value={milestoneLabel}
            onChange={(e) => setMilestoneLabel(e.target.value.slice(0, 60))}
            placeholder="e.g., First week of journaling, Breakthrough moment…"
            className="mt-3 text-sm"
          />
        )}
      </div>

      <Button variant="hero" className="w-full" onClick={handleSave} disabled={!content.trim() || createEntry.isPending}>
        {createEntry.isPending ? "Saving…" : "Save Entry"}
      </Button>
    </div>
  );
};

export default JournalEditor;
