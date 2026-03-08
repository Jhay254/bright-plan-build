import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Trash2, AlertTriangle } from "lucide-react";

const AccountDeletion = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user || confirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;
      toast({ title: t("profile.deletion.success") });
      await signOut();
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
      setDeleting(false);
    }
  };

  return (
    <div className="bg-card rounded-echo-lg p-5 shadow-echo-1 border border-destructive/30">
      <p className="text-xs text-destructive uppercase tracking-wide mb-2">{t("profile.deletion.title")}</p>
      {!showConfirm ? (
        <>
          <p className="text-sm text-driftwood mb-3">{t("profile.deletion.desc")}</p>
          <Button variant="destructive" size="sm" onClick={() => setShowConfirm(true)}>
            <Trash2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t("profile.deletion.button")}
          </Button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-start gap-2 p-3 rounded-echo-md bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{t("profile.deletion.warning")}</p>
          </div>
          <p className="text-sm text-driftwood">{t("profile.deletion.typeDelete")}</p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="h-9 text-sm"
          />
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={confirmText !== "DELETE" || deleting}>
              {deleting ? t("common.loading") : t("profile.deletion.confirmButton")}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setShowConfirm(false); setConfirmText(""); }}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDeletion;
