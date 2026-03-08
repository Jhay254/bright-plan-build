export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cocoon_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          language: string
          preferences: string | null
          seeker_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"]
          topic: string
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          volunteer_id: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          language?: string
          preferences?: string | null
          seeker_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          topic: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          volunteer_id?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          language?: string
          preferences?: string | null
          seeker_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          topic?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          volunteer_id?: string | null
        }
        Relationships: []
      }
      community_resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          emoji: string | null
          id: string
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          emoji?: string | null
          id?: string
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      cpd_entries: {
        Row: {
          category: string
          certificate_url: string | null
          completed_at: string
          created_at: string
          description: string | null
          hours: number
          id: string
          title: string
          user_id: string
        }
        Insert: {
          category?: string
          certificate_url?: string | null
          completed_at?: string
          created_at?: string
          description?: string | null
          hours: number
          id?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          certificate_url?: string | null
          completed_at?: string
          created_at?: string
          description?: string | null
          hours?: number
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          is_milestone: boolean
          milestone_label: string | null
          mood: Database["public"]["Enums"]["journal_mood"] | null
          tags: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_milestone?: boolean
          milestone_label?: string | null
          mood?: Database["public"]["Enums"]["journal_mood"] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_milestone?: boolean
          milestone_label?: string | null
          mood?: Database["public"]["Enums"]["journal_mood"] | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      peer_encouragements: {
        Row: {
          content: string
          created_at: string
          id: string
          is_visible: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_visible?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          alias: string
          avatar_seed: string
          consent_given_at: string | null
          created_at: string
          cultural_context: string | null
          healing_goals: string[] | null
          id: string
          is_anonymous: boolean
          language: string
          onboarding_complete: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          alias: string
          avatar_seed?: string
          consent_given_at?: string | null
          created_at?: string
          cultural_context?: string | null
          healing_goals?: string[] | null
          id?: string
          is_anonymous?: boolean
          language?: string
          onboarding_complete?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          alias?: string
          avatar_seed?: string
          consent_given_at?: string | null
          created_at?: string
          cultural_context?: string | null
          healing_goals?: string[] | null
          id?: string
          is_anonymous?: boolean
          language?: string
          onboarding_complete?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      session_feedback: {
        Row: {
          created_at: string
          emotional_rating: number
          felt_heard: boolean | null
          felt_safe: boolean | null
          id: string
          reflection: string | null
          role: Database["public"]["Enums"]["app_role"]
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emotional_rating: number
          felt_heard?: boolean | null
          felt_safe?: boolean | null
          id?: string
          reflection?: string | null
          role: Database["public"]["Enums"]["app_role"]
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emotional_rating?: number
          felt_heard?: boolean | null
          felt_safe?: boolean | null
          id?: string
          reflection?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_feedback_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cocoon_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_system: boolean
          sender_id: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_system?: boolean
          sender_id: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_system?: boolean
          sender_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cocoon_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          module_key: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          module_key: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          module_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteer_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_hour: number
          id: string
          start_hour: number
          user_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_hour: number
          id?: string
          start_hour: number
          user_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_hour?: number
          id?: string
          start_hour?: number
          user_id?: string
        }
        Relationships: []
      }
      volunteer_profiles: {
        Row: {
          background: string | null
          created_at: string
          id: string
          is_approved: boolean
          languages: string[] | null
          motivation: string | null
          skills_endorsed: string[] | null
          specialisations: string[] | null
          total_hours: number
          total_sessions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          background?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          languages?: string[] | null
          motivation?: string | null
          skills_endorsed?: string[] | null
          specialisations?: string[] | null
          total_hours?: number
          total_sessions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          background?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          languages?: string[] | null
          motivation?: string | null
          skills_endorsed?: string[] | null
          specialisations?: string[] | null
          total_hours?: number
          total_sessions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_get_stats: { Args: never; Returns: Json }
      admin_set_user_role: {
        Args: {
          _new_role: Database["public"]["Enums"]["app_role"]
          _target_user_id: string
        }
        Returns: boolean
      }
      admin_set_volunteer_approval: {
        Args: { _approved: boolean; _volunteer_user_id: string }
        Returns: boolean
      }
      close_stale_sessions: { Args: never; Returns: number }
      delete_user_account: { Args: never; Returns: boolean }
      generate_alias: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_volunteer_score: {
        Args: {
          _session_language: string
          _session_topic: string
          _volunteer_id: string
        }
        Returns: number
      }
      purge_old_message_content: { Args: never; Returns: number }
      transition_session: {
        Args: {
          _new_status: Database["public"]["Enums"]["session_status"]
          _session_id: string
        }
        Returns: boolean
      }
      volunteer_accept_session: {
        Args: { _session_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "seeker" | "volunteer" | "admin"
      journal_mood:
        | "joyful"
        | "calm"
        | "hopeful"
        | "neutral"
        | "anxious"
        | "sad"
        | "angry"
        | "overwhelmed"
      session_status:
        | "requested"
        | "matched"
        | "active"
        | "wrap_up"
        | "closed"
        | "cancelled"
      urgency_level: "low" | "medium" | "high" | "crisis"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["seeker", "volunteer", "admin"],
      journal_mood: [
        "joyful",
        "calm",
        "hopeful",
        "neutral",
        "anxious",
        "sad",
        "angry",
        "overwhelmed",
      ],
      session_status: [
        "requested",
        "matched",
        "active",
        "wrap_up",
        "closed",
        "cancelled",
      ],
      urgency_level: ["low", "medium", "high", "crisis"],
    },
  },
} as const
