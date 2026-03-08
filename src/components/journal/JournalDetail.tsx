import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Trash2, Flag, Save, X } from "lucide-react";
import { MOOD_OPTIONS, SUGGESTED_TAGS, getMoodOption } from "@/lib/journal";
import type { Database } from "@/integrations/supabase/types";

type JournalEntry = Database["public"]["Tables"]["journal_entries"]["Row"];
type JournalMood = Database["public"]["Enums"]["journal_mood"];

const JournalDetail = () => {
  const { entryId } = useParams<{ entryId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalMood | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isMilestone, setIsMilestone] = useState(false);
  const [milestoneLabel, setMilestoneLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!entryId) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", entryId)
        .single();
      if (data) {
        setEntry(data);
        setTitle(data.title ?? "");
        setContent(data.content);
        setMood(data.mood);
        setTags(data.tags ?? []);
        setIsMilestone(data.is_milestone);
        setMilestoneLabel(data.milestone_label ?? "");
      }
    };
    fetch();
  }, [entryId]);

  const goalTags = profile?.healing_goals?.map((g) => g.toLowerCase().replace(/\s+/g, "-")) ?? [];
  const allSuggested = [...new Set([...SUGGESTED_TAGS, ...goalTags])];

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase().slice(0, 30);
    if (t && !tags.includes(t) && tags.length < 10) setTags([...tags, t]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleSave = async () => {
    if (!entryId || !content.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("journal_entries").update({
        title: title.trim() || null,
        content: content.trim(),
        mood,
        tags,
        is_milestone: isMilestone,
        milestone_label: isMilestone ? milestoneLabel.trim() || null : null,
      }).eq("id", entryId);
      if (error) throw error;
      toast({ title: "Entry updated" });
      setEditing(false);
      // Refresh
      const { data } = await supabase.from("journal_entries").select("*").eq("id", entryId).single();
      if (data) setEntry(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entryId) return;
    const { error } = await supabase.from("journal_entries").delete().eq("id", entryId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Entry deleted" });
      navigate("/app/journal");
    }
  };

  if (!entry) {
    return (
      <div className="px-6 pt-8">
        <div className="animate-pulse-gentle text-dusk font-journal">Loading…</div>
      </div>
    );
  }

  const moodInfo = getMoodOption(entry.mood);

  // Read mode
  if (!editing) {
    return (
      <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate("/app/journal")} className="flex items-center gap-1 text-sm text-driftwood hover:text-dusk">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>Edit</Button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <Button variant="destructive" size="sm" onClick={handleDelete}>Confirm</Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="text-care-alert" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          {moodInfo && (
            <div className={`w-10 h-10 rounded-full ${moodInfo.color} border flex items-center justify-center text-xl`}>
              {moodInfo.emoji}
            </div>
          )}
          <div>
            <p className="text-xs text-driftwood">
              {new Date(entry.created_at).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              {" · "}
              {new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
            {entry.is_milestone && (
              <div className="flex items-center gap-1 mt-0.5">
                <Flag className="h-3 w-3 text-dusk" />
                <span className="text-xs font-medium text-dusk">{entry.milestone_label ?? "Milestone"}</span>
              </div>
            )}
          </div>
        </div>

        <h1 className="font-journal text-xl font-semibold text-bark mb-4">{entry.title || "Untitled"}</h1>
        <div className="font-journal text-sm text-bark leading-relaxed whitespace-pre-wrap">{entry.content}</div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-6">
            {entry.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2.5 py-1 rounded-echo-pill bg-dusk/10 text-dusk border border-dusk/30">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div className="px-6 pt-8 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-driftwood hover:text-dusk">
          <ArrowLeft className="h-4 w-4" /> Cancel
        </button>
        <Button variant="default" size="sm" onClick={handleSave} disabled={!content.trim() || saving}>
          <Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, 100))}
        placeholder="Title (optional)"
        className="font-journal text-lg border-0 border-b border-stone rounded-none px-0 focus-visible:ring-0 focus-visible:border-dusk mb-4 bg-transparent"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, 5000))}
        className="w-full min-h-[200px] px-0 py-3 font-journal text-sm text-bark bg-transparent border-0 focus:outline-none resize-none leading-relaxed"
      />

      {/* Mood */}
      <div className="mb-6">
        <p className="text-sm font-medium text-bark mb-3">Mood</p>
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMood(mood === m.value ? null : m.value)}
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
                <button onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2 mb-2">
          <Input value={tagInput} onChange={(e) => setTagInput(e.target.value.slice(0, 30))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }}} placeholder="Add a tag…" className="text-sm h-9" />
          <Button variant="secondary" size="sm" onClick={() => addTag(tagInput)} disabled={!tagInput.trim()}>Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {allSuggested.filter((t) => !tags.includes(t)).slice(0, 8).map((tag) => (
            <button key={tag} onClick={() => addTag(tag)} className="text-[11px] px-2.5 py-1 rounded-echo-pill border border-stone text-driftwood hover:border-dusk/40 transition-colors">+ {tag}</button>
          ))}
        </div>
      </div>

      {/* Milestone */}
      <div className="bg-sand rounded-echo-md p-4 border border-stone">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            onClick={() => setIsMilestone(!isMilestone)}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isMilestone ? "bg-dusk border-dusk text-white" : "border-stone"}`}
          >
            {isMilestone && <Flag className="h-3.5 w-3.5" />}
          </button>
          <div>
            <p className="text-sm font-medium text-bark">Milestone</p>
            <p className="text-xs text-driftwood">A significant moment in your journey</p>
          </div>
        </label>
        {isMilestone && (
          <Input value={milestoneLabel} onChange={(e) => setMilestoneLabel(e.target.value.slice(0, 60))} placeholder="Milestone label…" className="mt-3 text-sm" />
        )}
      </div>
    </div>
  );
};

export default JournalDetail;
