import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePeerEncouragements, usePostEncouragement } from "@/hooks/use-community";
import { detectCrisisLanguage } from "@/lib/safety";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Heart, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const MAX_LENGTH = 280;

const EncouragementWall = () => {
  const { user } = useAuth();
  const { data: posts, isLoading } = usePeerEncouragements();
  const postMutation = usePostEncouragement();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    if (!user || !text.trim()) return;
    const trimmed = text.trim().slice(0, MAX_LENGTH);

    if (detectCrisisLanguage(trimmed)) {
      toast({
        title: "We care about your safety",
        description: "If you're in crisis, please reach out to one of the resources above. This wall is for encouragements only.",
        variant: "destructive",
      });
      return;
    }

    try {
      await postMutation.mutateAsync({ userId: user.id, content: trimmed });
      setText("");
      toast({ title: "Thank you 💚", description: "Your encouragement has been posted." });
    } catch (err: any) {
      toast({ title: t("common.error"), description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Post form */}
      <div className="bg-card rounded-echo-lg p-4 border border-border shadow-echo-1">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Share an encouragement</p>
        </div>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          placeholder="You're doing great. Keep going. 💚"
          className="resize-none text-sm min-h-[60px]"
          maxLength={MAX_LENGTH}
          aria-label="Write an encouragement"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">{text.length}/{MAX_LENGTH}</span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!text.trim() || postMutation.isPending}
            aria-label="Post encouragement"
          >
            <Send className="h-3.5 w-3.5 ltr:mr-1.5 rtl:ml-1.5" />
            {postMutation.isPending ? t("common.loading") : "Post"}
          </Button>
        </div>
      </div>

      {/* Wall */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 rounded-echo-lg" />
          ))}
        </div>
      ) : !posts?.length ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          Be the first to share an encouragement 💚
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-card rounded-echo-lg p-4 border border-border shadow-echo-1"
            >
              <p className="text-sm text-foreground leading-relaxed">{post.content}</p>
              <p className="text-[10px] text-muted-foreground mt-2">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EncouragementWall;
