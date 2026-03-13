import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const FORUM_CATEGORIES = [
  "grief",
  "anxiety",
  "trauma-recovery",
  "stress",
  "relationships",
  "self-esteem",
  "resilience",
  "general",
] as const;

export type ForumCategory = (typeof FORUM_CATEGORIES)[number];

export interface ForumPost {
  id: string;
  category: string;
  title: string | null;
  content: string;
  parent_id: string | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  author_alias: string | null;
  author_avatar_seed: string | null;
  user_id: string;
}

export function useForumThreads(category?: string) {
  return useQuery({
    queryKey: ["forum-threads", category],
    queryFn: async () => {
      let q = (supabase as any)
        .from("forum_posts_anonymous")
        .select("*")
        .is("parent_id", null)
        .eq("is_hidden", false)
        .order("created_at", { ascending: false })
        .limit(50);
      if (category && category !== "all") {
        q = q.eq("category", category);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ForumPost[];
    },
  });
}

export function useForumReplies(threadId: string) {
  return useQuery({
    queryKey: ["forum-replies", threadId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("forum_posts_anonymous")
        .select("*")
        .eq("parent_id", threadId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ForumPost[];
    },
    enabled: !!threadId,
  });
}

export function useForumThread(threadId: string) {
  return useQuery({
    queryKey: ["forum-thread", threadId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("forum_posts_anonymous")
        .select("*")
        .eq("id", threadId)
        .single();
      if (error) throw error;
      return data as ForumPost;
    },
    enabled: !!threadId,
  });
}

export function useCreateForumPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      category,
      title,
      content,
      parentId,
    }: {
      userId: string;
      category: string;
      title?: string;
      content: string;
      parentId?: string;
    }) => {
      const { error } = await (supabase as any).from("forum_posts").insert({
        user_id: userId,
        category,
        title: title || null,
        content: content.slice(0, 2000),
        parent_id: parentId || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum-threads"] });
      qc.invalidateQueries({ queryKey: ["forum-replies"] });
    },
  });
}

export function useHideForumPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      postId,
      moderatorId,
      reason,
      hidden,
    }: {
      postId: string;
      moderatorId: string;
      reason?: string;
      hidden: boolean;
    }) => {
      const { error } = await (supabase as any)
        .from("forum_posts")
        .update({
          is_hidden: hidden,
          hidden_by: hidden ? moderatorId : null,
          hidden_reason: hidden ? reason || null : null,
        })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forum-threads"] });
      qc.invalidateQueries({ queryKey: ["forum-replies"] });
      qc.invalidateQueries({ queryKey: ["admin-forum-posts"] });
    },
  });
}

/** Admin: fetch all posts including hidden */
export function useAdminForumPosts() {
  return useQuery({
    queryKey: ["admin-forum-posts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("forum_posts_anonymous")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as ForumPost[];
    },
  });
}

/** Count replies for a thread */
export function useReplyCount(threadId: string) {
  return useQuery({
    queryKey: ["forum-reply-count", threadId],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from("forum_posts")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", threadId)
        .eq("is_hidden", false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!threadId,
  });
}
