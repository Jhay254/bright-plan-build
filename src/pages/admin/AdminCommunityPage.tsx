import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Heart, BookOpen, Plus, Pencil, Trash2, MessageSquare } from "lucide-react";
import ForumModeration from "@/components/community/ForumModeration";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* ─── Encouragements Tab ─── */
function EncouragementModeration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-encouragements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("peer_encouragements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ id, visible }: { id: string; visible: boolean }) => {
      const { error } = await supabase
        .from("peer_encouragements")
        .update({ is_visible: visible })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-encouragements"] });
      toast({ title: "Updated" });
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Loading…</p>;

  return (
    <div className="space-y-3">
      {posts.length === 0 && (
        <p className="text-sm text-muted-foreground">No encouragements yet.</p>
      )}
      {posts.map((p) => (
        <div
          key={p.id}
          className={`flex items-start justify-between gap-4 rounded-echo-md border p-4 ${
            p.is_visible ? "bg-card border-border" : "bg-muted/40 border-dashed border-muted-foreground/30"
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{p.content}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(p.created_at).toLocaleDateString()} · User: {p.user_id.slice(0, 8)}…
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label htmlFor={`vis-${p.id}`} className="text-xs text-muted-foreground">
              {p.is_visible ? "Visible" : "Hidden"}
            </Label>
            <Switch
              id={`vis-${p.id}`}
              checked={p.is_visible}
              onCheckedChange={(v) => toggleVisibility.mutate({ id: p.id, visible: v })}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Resources Tab ─── */
type ResourceForm = {
  title: string;
  description: string;
  url: string;
  emoji: string;
  category: string;
};

const emptyForm: ResourceForm = { title: "", description: "", url: "", emoji: "📌", category: "general" };

function ResourceManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ResourceForm>(emptyForm);

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_resources")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase
          .from("community_resources")
          .update({ ...form, updated_at: new Date().toISOString() })
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("community_resources")
          .insert({ ...form, sort_order: resources.length });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      toast({ title: editingId ? "Resource updated" : "Resource added" });
      closeDialog();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("community_resources")
        .update({ is_active: active, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-resources"] }),
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("community_resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      toast({ title: "Resource deleted" });
    },
  });

  const openEdit = (r: any) => {
    setEditingId(r.id);
    setForm({ title: r.title, description: r.description || "", url: r.url || "", emoji: r.emoji || "📌", category: r.category });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  if (isLoading) return <p className="text-sm text-muted-foreground p-4">Loading…</p>;

  return (
    <div className="space-y-4">
      <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) closeDialog(); else setDialogOpen(true); }}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1.5" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
            <Plus className="h-4 w-4" /> Add Resource
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Resource" : "Add Resource"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <div className="w-16">
                <Label>Emoji</Label>
                <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} maxLength={4} />
              </div>
              <div className="flex-1">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="general" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>URL</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} type="url" placeholder="https://…" />
            </div>
            <Button className="w-full" onClick={() => upsert.mutate()} disabled={!form.title.trim() || upsert.isPending}>
              {upsert.isPending ? "Saving…" : editingId ? "Update" : "Add"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {resources.length === 0 && <p className="text-sm text-muted-foreground">No resources yet.</p>}

      {resources.map((r) => (
        <div
          key={r.id}
          className={`flex items-center justify-between gap-4 rounded-echo-md border p-4 ${
            r.is_active ? "bg-card border-border" : "bg-muted/40 border-dashed border-muted-foreground/30"
          }`}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {r.emoji} {r.title}
              <span className="ml-2 text-xs font-normal text-muted-foreground">({r.category})</span>
            </p>
            {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={r.is_active}
              onCheckedChange={(v) => toggleActive.mutate({ id: r.id, active: v })}
              aria-label={r.is_active ? "Deactivate" : "Activate"}
            />
            <Button variant="ghost" size="icon" onClick={() => openEdit(r)} aria-label="Edit">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { if (confirm("Delete this resource?")) deleteResource.mutate(r.id); }}
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ─── */
const AdminCommunityPage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="font-heading text-2xl font-bold text-foreground mb-6">Community Moderation</h1>

      <Tabs defaultValue="encouragements">
        <TabsList className="mb-6">
          <TabsTrigger value="encouragements" className="gap-1.5">
            <Heart className="h-4 w-4" /> Encouragements
          </TabsTrigger>
          <TabsTrigger value="resources" className="gap-1.5">
            <BookOpen className="h-4 w-4" /> Resources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encouragements">
          <EncouragementModeration />
        </TabsContent>
        <TabsContent value="resources">
          <ResourceManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCommunityPage;
