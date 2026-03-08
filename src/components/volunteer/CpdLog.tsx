import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCpdEntries, useAddCpdEntry } from "@/hooks/use-volunteer-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Award, Clock, FileText, Download } from "lucide-react";

const CPD_CATEGORIES = ["training", "workshop", "supervision", "self-study", "conference", "certification"];

const generateCertificateSvg = (totalHours: number, date: string): string => {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#FAFAF8"/>
  <rect x="30" y="30" width="740" height="540" rx="16" fill="none" stroke="#2D6A4F" stroke-width="3"/>
  <rect x="40" y="40" width="720" height="520" rx="12" fill="none" stroke="#B7E4C7" stroke-width="1"/>
  <text x="400" y="120" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#2D6A4F">🌿 Project Echo</text>
  <text x="400" y="175" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#6B6560">Certificate of Continuing Professional Development</text>
  <line x1="200" y1="200" x2="600" y2="200" stroke="#B7E4C7" stroke-width="1"/>
  <text x="400" y="280" text-anchor="middle" font-family="Georgia, serif" font-size="64" fill="#2D6A4F" font-weight="bold">${totalHours.toFixed(1)}</text>
  <text x="400" y="320" text-anchor="middle" font-family="Georgia, serif" font-size="18" fill="#6B6560">hours of professional development</text>
  <text x="400" y="400" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#6B6560">This certifies that the volunteer has completed ${totalHours.toFixed(1)} hours</text>
  <text x="400" y="425" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#6B6560">of professional development activities through Project Echo.</text>
  <line x1="200" y1="470" x2="600" y2="470" stroke="#B7E4C7" stroke-width="1"/>
  <text x="400" y="510" text-anchor="middle" font-family="Georgia, serif" font-size="12" fill="#999">Issued: ${date}</text>
  <text x="400" y="535" text-anchor="middle" font-family="Georgia, serif" font-size="10" fill="#999">Project Echo · Peer Support Platform</text>
</svg>`;
};

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

  const downloadCertificate = () => {
    const svg = generateCertificateSvg(totalHours, new Date().toLocaleDateString());
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `echo-cpd-certificate-${new Date().toISOString().slice(0, 10)}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Certificate downloaded!" });
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
          <Button
            variant="default"
            size="sm"
            className="mt-3"
            onClick={downloadCertificate}
          >
            <Download className="h-4 w-4 mr-1" /> Download Certificate
          </Button>
        </div>
      )}
    </div>
  );
};

export default CpdLog;
