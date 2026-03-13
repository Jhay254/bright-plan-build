import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import ResourceBoard from "@/components/community/ResourceBoard";
import EncouragementWall from "@/components/community/EncouragementWall";
import ForumList from "@/components/community/ForumList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Heart, MessageSquare } from "lucide-react";

const CommunityPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Community — Echo</title>
        <meta name="description" content="Anonymous peer forums, mental health resources, and encouragements from the Echo community." />
      </Helmet>
      <div className="px-6 pt-8 pb-24 max-w-2xl mx-auto">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-1">{t("community.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {t("community.subtitle")}
        </p>

        <Tabs defaultValue="forums">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="forums" className="flex-1 gap-1.5" aria-label={t("community.forumsTab")}>
              <MessageSquare className="h-4 w-4" /> {t("community.forumsTab")}
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex-1 gap-1.5" aria-label={t("community.resourcesTab")}>
              <BookOpen className="h-4 w-4" /> {t("community.resourcesTab")}
            </TabsTrigger>
            <TabsTrigger value="encouragements" className="flex-1 gap-1.5" aria-label={t("community.encouragementsTab")}>
              <Heart className="h-4 w-4" /> {t("community.encouragementsTab")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="forums">
            <ForumList />
          </TabsContent>
          <TabsContent value="resources">
            <ResourceBoard />
          </TabsContent>
          <TabsContent value="encouragements">
            <EncouragementWall />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default CommunityPage;
