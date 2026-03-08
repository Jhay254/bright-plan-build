import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCpdEntries, useAddCpdEntry } from "@/hooks/use-volunteer-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Award, Clock, FileText } from "lucide-react";

const CPD_CATEGORIES = ["training", "workshop", "supervision", "self-study", "conference", "certification"];

const CpdLog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: entries = [], isLoading } = useCpdEntries(user?.id);
  const addEntry = useAddCpdEntry();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [category, setCategory] = useState("training");

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0);

  const handleAdd = async () => {
    if (!user || !title.trim() || !hours) return;
    try {
      await addEntry.mutateAsync({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        hours: parseFloat(hours),
        category,
      });
      setTitle(""); setDescription(""); setHours(""); setCategory("training");
      setShowForm(false);
      toast({ title: "CPD entry logged" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="space-y-2">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-16 bg-sand rounded-echo-md animate-pulse" />)}</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-lg font-semibold text-bark">CPD Log</h2>
          <p className="text-xs text-driftwood">{totalHours.toFixed(1)} total hours logged</p>
        </div>
        <Button variant="default" size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Log Hours
        </Button>
      </div>

      {showForm && (
        <div className="bg-dawn rounded-echo-md p-5 border border-mist mb-5 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 100))} placeholder="e.g., Active Listening Workshop" className="text-sm h-9" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Hours</Label>
              <Input type="number" step="0.5" min="0.5" max="100" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="2.0" className="text-sm h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Category</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm text-bark">
                {CPD_CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description <span className="text-driftwood">(optional)</span></Label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 300))} placeholder="Brief notes about what you learned…" className="w-full h-16 px-3 py-2 rounded-md border border-border bg-background text-sm text-bark resize-none focus:outline-none focus:border-fern" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button variant="default" size="sm" onClick={handleAdd} disabled={!title.trim() || !hours || addEntry.isPending}>
              {addEntry.isPending ? "Saving…" : "Log Entry"}
            </Button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-sand rounded-echo-md p-6 text-center border border-stone">
          <FileText className="h-8 w-8 text-driftwood mx-auto mb-2" />
          <p className="text-sm text-driftwood">No CPD entries yet. Log your training hours to track your professional development.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((e) => (
            <div key={e.id} className="bg-card rounded-echo-md p-4 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-bark">{e.title}</p>
                  {e.description && <p className="text-xs text-driftwood mt-0.5">{e.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-forest">
                      <Clock className="h-3 w-3" /> {Number(e.hours).toFixed(1)}h
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-echo-pill bg-sand text-driftwood capitalize">{e.category}</span>
                  </div>
                </div>
                <p className="text-[10px] text-driftwood shrink-0">{new Date(e.completed_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalHours >= 10 && (
        <div className="bg-dawn rounded-echo-md p-5 border border-mist mt-5 text-center">
          <Award className="h-8 w-8 text-forest mx-auto mb-2" />
          <p className="font-heading font-semibold text-bark text-sm">CPD Certificate Available</p>
          <p className="text-xs text-driftwood mt-1">{totalHours.toFixed(1)} hours of professional development completed</p>
          <button
            onClick={() => {
              const w = window.open("", "_blank");
              if (w) {
                w.document.write(`<html><head><title>Echo CPD Certificate</title><style>body{font-family:Georgia,serif;text-align:center;padding:80px 40px;max-width:700px;margin:auto;}h1{color:#2D6A4F;font-size:28px;}h2{color:#6B6560;font-weight:normal;font-size:18px;}.hours{font-size:48px;color:#2D6A4F;font-weight:bold;margin:30px 0;}.border{border:3px solid #2D6A4F;padding:60px;border-radius:16px;}.date{color:#999;font-size:14px;margin-top:40px;}</style></head><body><div class="border"><h1>🌿 Project Echo</h1><h2>Certificate of Continuing Professional Development</h2><div class="hours">${totalHours.toFixed(1)} hours</div><p>This certifies that the volunteer has completed ${totalHours.toFixed(1)} hours of professional development activities.</p><p class="date">Issued: ${new Date().toLocaleDateString()}</p></div></body></html>`);
                w.document.close();
                w.print();
              }
            }}
            className="mt-3 px-4 py-2 rounded-echo-pill text-sm font-medium bg-forest text-primary-foreground hover:bg-fern transition-colors"
          >
            Generate Certificate
          </button>
        </div>
      )}
    </div>
  );
};

export default CpdLog;
