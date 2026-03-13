import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useForumThread, useForumReplies, useCreateForumPost, useHideForumPost } from "@/hooks/use-forum";
import { detectCrisisLanguage } from "@/lib/safety";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, EyeOff, Eye, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuthProfile } from "@/contexts/AuthContext";

const MAX_REPLY = 1000;

interface ForumThreadProps {
  threadId: string;
  onBack: () => void;
}

const ForumThread = ({ threadId, onBack }: ForumThreadProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { role } = useAuthProfile();
  const { toast } = useToast();
  const [replyText, setReplyText] = useState("");

  const { data: thread, isLoading: threadLoading } = useForumThread(threadId);
  const { data: replies, isLoading: repliesLoading } = useForumReplies(threadId);
  const createPost = useCreateForumPost();
  const hidePost = useHideForumPost();

  const isModerator = role === "admin" || role === "volunteer";

  const handleReply = async () => {
    if (!user || !replyText.trim()) return;

    if (detectCrisisLanguage(replyText)) {
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
        category: thread?.category || "general",
        content: replyText.trim(),
        parentId: threadId,
      });
      setReplyText("");
      toast({ title: t("community.forum.replySent") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  const handleToggleHide = async (postId: string, currentlyHidden: boolean) => {
    if (!user) return;
    try {
      await hidePost.mutateAsync({
        postId,
        moderatorId: user.id,
        hidden: !currentlyHidden,
        reason: !currentlyHidden ? "Moderated by volunteer/admin" : undefined,
      });
      toast({ title: currentlyHidden ? t("community.forum.restored") : t("community.forum.hidden") });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  if (threadLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-echo-lg" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">{t("community.forum.threadNotFound")}</p>
        <Button variant="ghost" size="sm" onClick={onBack} className="mt-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> {t("common.back")}
      </Button>

      {/* Thread header */}
      <div className="bg-card rounded-echo-lg p-4 border border-border shadow-echo-1">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-[10px]">
            {t(`community.forum.categories.${thread.category}`)}
          </Badge>
          {thread.is_hidden && (
            <Badge variant="destructive" className="text-[10px]">
              {t("community.forum.hiddenLabel")}
            </Badge>
          )}
        </div>
        {thread.title && (
          <h2 className="text-base font-semibold text-foreground mb-1">{thread.title}</h2>
        )}
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{thread.content}</p>
        <div className="flex items-center justify-between mt-3">
          <p className="text-[10px] text-muted-foreground">
            {thread.author_alias || "Anonymous"} · {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
          </p>
          {isModerator && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              onClick={() => handleToggleHide(thread.id, thread.is_hidden)}
            >
              {thread.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {thread.is_hidden ? t("community.forum.restore") : t("community.forum.hide")}
            </Button>
          )}
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("community.forum.replies")} ({replies?.filter(r => !r.is_hidden).length ?? 0})
        </p>

        {repliesLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-echo-lg" />)}
          </div>
        ) : !replies?.length ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("community.forum.noReplies")}
          </p>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              className={`bg-card rounded-echo-md p-3 border ${
                reply.is_hidden
                  ? "border-dashed border-muted-foreground/30 bg-muted/40"
                  : "border-border"
              }`}
            >
              {reply.is_hidden && !isModerator ? null : (
                <>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground">
                      {reply.author_alias || "Anonymous"} · {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </p>
                    {isModerator && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] gap-1 h-6 px-2"
                        onClick={() => handleToggleHide(reply.id, reply.is_hidden)}
                      >
                        {reply.is_hidden ? <Eye className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                        {reply.is_hidden ? t("community.forum.restore") : t("community.forum.hide")}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Reply form */}
      <div className="bg-card rounded-echo-lg p-4 border border-border shadow-echo-1">
        <Textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value.slice(0, MAX_REPLY))}
          placeholder={t("community.forum.replyPlaceholder")}
          className="resize-none text-sm min-h-[60px]"
          maxLength={MAX_REPLY}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{replyText.length}/{MAX_REPLY}</span>
          <Button
            size="sm"
            onClick={handleReply}
            disabled={!replyText.trim() || createPost.isPending}
          >
            <Send className="h-3.5 w-3.5 ltr:mr-1.5 rtl:ml-1.5" />
            {createPost.isPending ? t("common.loading") : t("community.forum.reply")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForumThread;
