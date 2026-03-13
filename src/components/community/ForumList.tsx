import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useForumThreads, useCreateForumPost, FORUM_CATEGORIES, type ForumCategory } from "@/hooks/use-forum";
import { detectCrisisLanguage } from "@/lib/safety";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MessageSquarePlus, MessageCircle, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ForumThread from "./ForumThread";

const MAX_CONTENT = 2000;

const ForumList = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showNewThread, setShowNewThread] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<string>("general");
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);

  const { data: threads, isLoading, isError } = useForumThreads(selectedCategory);
  const createPost = useCreateForumPost();

  const handleCreateThread = async () => {
    if (!user || !newContent.trim()) return;

    if (detectCrisisLanguage(newContent) || detectCrisisLanguage(newTitle)) {
      toast({
        title: t("community.forum.safetyTitle"),
        description: t("community.forum.safetyDesc"),
        variant: "destructive",
      });
      return;
    }

    try {
      await createPost.mutateAsync({
        userId: user.id,
        category: newCategory,
        title: newTitle.trim() || undefined,
        content: newContent.trim(),
      });
      setNewTitle("");
      setNewContent("");
      setShowNewThread(false);
      toast({ title: t("community.forum.threadCreated") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  if (openThreadId) {
    return <ForumThread threadId={openThreadId} onBack={() => setOpenThreadId(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setSelectedCategory("all")}
        >
          {t("community.forum.allTopics")}
        </Badge>
        {FORUM_CATEGORIES.map((cat) => (
          <Badge
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(cat)}
          >
            {t(`community.forum.categories.${cat}`)}
          </Badge>
        ))}
      </div>

      {/* New thread button / form */}
      {!showNewThread ? (
        <Button size="sm" className="gap-1.5" onClick={() => setShowNewThread(true)}>
          <MessageSquarePlus className="h-4 w-4" />
          {t("community.forum.newThread")}
        </Button>
      ) : (
        <div className="bg-card rounded-echo-lg p-4 border border-border shadow-echo-1 space-y-3">
          <p className="text-sm font-medium text-foreground">{t("community.forum.startThread")}</p>
          <div className="flex gap-2 flex-wrap">
            {FORUM_CATEGORIES.map((cat) => (
              <Badge
                key={cat}
                variant={newCategory === cat ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setNewCategory(cat)}
              >
                {t(`community.forum.categories.${cat}`)}
              </Badge>
            ))}
          </div>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value.slice(0, 150))}
            placeholder={t("community.forum.titlePlaceholder")}
            maxLength={150}
          />
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value.slice(0, MAX_CONTENT))}
            placeholder={t("community.forum.contentPlaceholder")}
            className="resize-none text-sm min-h-[80px]"
            maxLength={MAX_CONTENT}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{newContent.length}/{MAX_CONTENT}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowNewThread(false)}>
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleCreateThread}
                disabled={!newContent.trim() || createPost.isPending}
              >
                {createPost.isPending ? t("common.loading") : t("community.forum.post")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Thread list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-echo-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive text-center py-6">
          {t("common.error")}
        </p>
      ) : !threads?.length ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t("community.forum.noThreads")}
        </p>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              className="w-full text-left bg-card rounded-echo-lg p-4 border border-border shadow-echo-1 hover:border-primary/30 transition-colors"
              onClick={() => setOpenThreadId(thread.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {t(`community.forum.categories.${thread.category}`)}
                    </Badge>
                  </div>
                  {thread.title && (
                    <p className="text-sm font-medium text-foreground truncate">{thread.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {thread.content}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>{thread.author_alias || "Anonymous"}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <MessageCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumList;
