import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Download, FileText } from "lucide-react";

const DataExport = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const gatherAllData = async () => {
    if (!user) throw new Error("Not authenticated");

    const [journalRes, sessionsRes, feedbackRes] = await Promise.all([
      supabase
        .from("journal_entries")
        .select("title, content, mood, tags, is_milestone, milestone_label, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("cocoon_sessions")
        .select("id, topic, urgency, language, status, created_at, started_at, ended_at")
        .or(`seeker_id.eq.${user.id},volunteer_id.eq.${user.id}`)
        .order("created_at", { ascending: false }),
      supabase
        .from("session_feedback")
        .select("session_id, role, emotional_rating, felt_heard, felt_safe, reflection, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (journalRes.error) throw journalRes.error;
    if (sessionsRes.error) throw sessionsRes.error;
    if (feedbackRes.error) throw feedbackRes.error;

    return {
      exported_at: new Date().toISOString(),
      profile: profile
        ? {
            alias: profile.alias,
            language: profile.language,
            healing_goals: profile.healing_goals,
            cultural_context: profile.cultural_context,
            created_at: profile.created_at,
          }
        : null,
      journal_entries: {
        count: journalRes.data?.length ?? 0,
        entries: journalRes.data ?? [],
      },
      sessions: {
        count: sessionsRes.data?.length ?? 0,
        note: "Message content is not included due to the 90-day retention policy.",
        sessions: sessionsRes.data ?? [],
      },
      feedback: {
        count: feedbackRes.data?.length ?? 0,
        entries: feedbackRes.data ?? [],
      },
    };
  };

  const handleJsonExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const exportData = await gatherAllData();
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `echo-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: t("profile.export.success") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
    setExporting(false);
  };

  const handlePdfExport = async () => {
    if (!user) return;
    setExportingPdf(true);
    try {
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("title, content, mood, tags, is_milestone, milestone_label, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const alias = profile?.alias ?? "User";
      const date = new Date().toLocaleDateString();

      const html = `
        <!DOCTYPE html>
        <html><head><meta charset="utf-8">
        <title>Echo Journal — ${alias}</title>
        <style>
          body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; padding: 0 20px; color: #2d2d2d; }
          h1 { font-size: 24px; border-bottom: 2px solid #4a7c59; padding-bottom: 8px; }
          .entry { margin-bottom: 28px; page-break-inside: avoid; }
          .entry h2 { font-size: 16px; margin: 0 0 4px; color: #4a7c59; }
          .meta { font-size: 12px; color: #888; margin-bottom: 6px; }
          .content { font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
          .tags { font-size: 11px; color: #6b8f71; margin-top: 4px; }
          .milestone { display: inline-block; background: #e8f5e9; color: #2e7d32; font-size: 11px; padding: 2px 8px; border-radius: 8px; margin-top: 4px; }
          footer { text-align: center; font-size: 11px; color: #aaa; margin-top: 40px; border-top: 1px solid #ddd; padding-top: 12px; }
        </style></head><body>
        <h1>Echo Journal — ${alias}</h1>
        <p style="font-size:13px;color:#888;">Exported on ${date} · ${entries?.length ?? 0} entries</p>
        ${(entries ?? []).map((e) => `
          <div class="entry">
            <h2>${e.title || "Untitled"} ${e.mood ? `(${e.mood})` : ""}</h2>
            <div class="meta">${new Date(e.created_at).toLocaleDateString()}</div>
            <div class="content">${e.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
            ${e.tags && e.tags.length ? `<div class="tags">Tags: ${e.tags.join(", ")}</div>` : ""}
            ${e.is_milestone ? `<span class="milestone">🏆 ${e.milestone_label || "Milestone"}</span>` : ""}
          </div>
        `).join("")}
        <footer>Exported from Echo · Project Echo</footer>
        </body></html>
      `;

      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
      }
      toast({ title: t("profile.export.success") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
    setExportingPdf(false);
  };

  return (
    <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
      <p className="text-xs text-driftwood uppercase tracking-wide mb-2">{t("profile.export.title")}</p>
      <p className="text-sm text-driftwood mb-3">{t("profile.export.desc")}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={handleJsonExport} disabled={exporting} aria-label="Export all data as JSON">
          <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {exporting ? t("common.loading") : t("profile.export.button")}
        </Button>
        <Button variant="outline" size="sm" onClick={handlePdfExport} disabled={exportingPdf} aria-label="Export journal as PDF">
          <FileText className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {exportingPdf ? t("common.loading") : "PDF Journal"}
        </Button>
      </div>
    </div>
  );
};

export default DataExport;
