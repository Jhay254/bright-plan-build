import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MessageCircle, BookOpen } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

const HomePage = () => {
  const { profile, role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (role === "volunteer") {
    return <Navigate to="/app/volunteer" replace />;
  }

  return (
    <div className="px-6 pt-8">
      <div className="mb-8">
        <p className="text-sm text-driftwood font-medium">{t("home.welcomeBack")}</p>
        <h1 className="font-heading text-2xl font-bold text-bark">
          {profile?.alias ?? "Friend"}
        </h1>
      </div>

      <div className="space-y-4">
        <div className="bg-dawn rounded-echo-lg p-6 shadow-echo-1">
          <h2 className="font-heading text-lg font-semibold text-bark mb-2">{t("home.howFeeling")}</h2>
          <p className="text-sm text-driftwood mb-4">{t("home.reachOut")}</p>
          <Button variant="hero" onClick={() => navigate("/app/cocoon")}>
            <MessageCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t("home.startSession")}
          </Button>
        </div>

        <div className="bg-card rounded-echo-lg p-6 shadow-echo-1 border border-border">
          <h2 className="font-heading text-lg font-semibold text-bark mb-2">{t("home.healingJournal")}</h2>
          <p className="text-sm text-driftwood mb-4">{t("home.journalDesc")}</p>
          <Button variant="outline" onClick={() => navigate("/app/journal")}>
            <BookOpen className="h-4 w-4 ltr:mr-2 rtl:ml-2" /> {t("home.openJournal")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
