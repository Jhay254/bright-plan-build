const CommunityPage = () => {
  // Using dynamic import to avoid build issues — lightweight component
  const { useTranslation } = require("react-i18next");
  const { t } = useTranslation();

  return (
    <div className="px-6 pt-8">
      <h1 className="font-heading text-2xl font-bold text-bark mb-2">{t("community.title")}</h1>
      <p className="text-driftwood text-sm">{t("community.comingSoon")}</p>
    </div>
  );
};

export default CommunityPage;
