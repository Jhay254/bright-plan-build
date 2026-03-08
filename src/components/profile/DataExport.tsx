import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";

const DataExport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("title, content, mood, tags, is_milestone, milestone_label, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const exportData = {
        exported_at: new Date().toISOString(),
        entry_count: entries?.length ?? 0,
        entries: entries ?? [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `echo-journal-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({ title: t("profile.export.success") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
    setExporting(false);
  };

  return (
    <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-border">
      <p className="text-xs text-driftwood uppercase tracking-wide mb-2">{t("profile.export.title")}</p>
      <p className="text-sm text-driftwood mb-3">{t("profile.export.desc")}</p>
      <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
        <Download className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
        {exporting ? t("common.loading") : t("profile.export.button")}
      </Button>
    </div>
  );
};

export default DataExport;
