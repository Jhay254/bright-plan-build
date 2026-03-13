import { useAdminForumPosts, useHideForumPost, type ForumPost } from "@/hooks/use-forum";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const ForumModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: posts = [], isLoading } = useAdminForumPosts();
  const hidePost = useHideForumPost();

  const handleToggle = async (post: ForumPost) => {
    if (!user) return;
    try {
      await hidePost.mutateAsync({
        postId: post.id,
        moderatorId: user.id,
        hidden: !post.is_hidden,
        reason: !post.is_hidden ? "Admin moderation" : undefined,
      });
      toast({ title: post.is_hidden ? "Post restored" : "Post hidden" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.length === 0 && (
        <p className="text-sm text-muted-foreground">No forum posts yet.</p>
      )}
      {posts.map((p) => (
        <div
          key={p.id}
          className={`flex items-start justify-between gap-4 rounded-echo-md border p-4 ${
            p.is_hidden
              ? "bg-muted/40 border-dashed border-muted-foreground/30"
              : "bg-card border-border"
          }`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-[10px]">{p.category}</Badge>
              {p.parent_id && (
                <Badge variant="outline" className="text-[10px]">Reply</Badge>
              )}
            </div>
            {p.title && (
              <p className="text-sm font-medium text-foreground">{p.title}</p>
            )}
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.content}</p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {p.author_alias || "Anonymous"} · {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Label htmlFor={`vis-${p.id}`} className="text-xs text-muted-foreground">
              {p.is_hidden ? "Hidden" : "Visible"}
            </Label>
            <Switch
              id={`vis-${p.id}`}
              checked={!p.is_hidden}
              onCheckedChange={() => handleToggle(p)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ForumModeration;
