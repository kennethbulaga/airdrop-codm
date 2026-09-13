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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          category: string
          contact_info: string | null
          created_at: string
          id: string
          message: string
          user_id: string | null
        }
        Insert: {
          category: string
          contact_info?: string | null
          created_at?: string
          id?: string
          message: string
          user_id?: string | null
        }
        Update: {
          category?: string
          contact_info?: string | null
          created_at?: string
          id?: string
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      preset_reports: {
        Row: {
          created_at: string
          id: string
          preset_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preset_id: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preset_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preset_reports_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "presets"
            referencedColumns: ["id"]
          },
        ]
      }
      preset_votes: {
        Row: {
          created_at: string
          preset_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          preset_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          preset_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preset_votes_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "presets"
            referencedColumns: ["id"]
          },
        ]
      }
      presets: {
        Row: {
          category: string
          code: string
          created_at: string
          creator_avatar_url: string | null
          creator_name: string
          description: string | null
          device_name: string | null
          device_type: string
          fps_target: string | null
          grip: string | null
          gyro: boolean | null
          id: string
          image_url: string | null
          is_hidden: boolean
          is_verified: boolean
          layout_highlight: string | null
          mode: string
          playstyle: string | null
          report_count: number
          season: string
          social_handle: string | null
          social_platform: string | null
          social_url: string | null
          youtube_url: string | null
          tiktok_url: string | null
          facebook_url: string | null
          specs: Json | null
          team_name: string | null
          tier: string | null
          graphic_quality: string | null
          updated_at: string
          upvotes: number
          user_id: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          creator_avatar_url?: string | null
          creator_name: string
          description?: string | null
          device_name?: string | null
          device_type: string
          fps_target?: string | null
          grip?: string | null
          gyro?: boolean | null
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          is_verified?: boolean
          layout_highlight?: string | null
          mode?: string
          playstyle?: string | null
          report_count?: number
          season?: string
          social_handle?: string | null
          social_platform?: string | null
          social_url?: string | null
          youtube_url?: string | null
          tiktok_url?: string | null
          facebook_url?: string | null
          specs?: Json | null
          team_name?: string | null
          tier?: string | null
          graphic_quality?: string | null
          updated_at?: string
          upvotes?: number
          user_id?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          creator_avatar_url?: string | null
          creator_name?: string
          description?: string | null
          device_name?: string | null
          device_type?: string
          fps_target?: string | null
          grip?: string | null
          gyro?: boolean | null
          id?: string
          image_url?: string | null
          is_hidden?: boolean
          is_verified?: boolean
          layout_highlight?: string | null
          mode?: string
          playstyle?: string | null
          report_count?: number
          season?: string
          social_handle?: string | null
          social_platform?: string | null
          social_url?: string | null
          youtube_url?: string | null
          tiktok_url?: string | null
          facebook_url?: string | null
          specs?: Json | null
          team_name?: string | null
          tier?: string | null
          graphic_quality?: string | null
          updated_at?: string
          upvotes?: number
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          clan_tag: string | null
          created_at: string
          email: string | null
          full_name: string | null
          has_completed_onboarding: boolean
          id: string
          social_handle: string | null
          social_platform: string | null
          social_url: string | null
          youtube_url: string | null
          tiktok_url: string | null
          facebook_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          clan_tag?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_completed_onboarding?: boolean
          id: string
          social_handle?: string | null
          social_platform?: string | null
          social_url?: string | null
          youtube_url?: string | null
          tiktok_url?: string | null
          facebook_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          clan_tag?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_completed_onboarding?: boolean
          id?: string
          social_handle?: string | null
          social_platform?: string | null
          social_url?: string | null
          youtube_url?: string | null
          tiktok_url?: string | null
          facebook_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      report_preset: {
        Args: { p_preset_id: string; p_reason?: string }
        Returns: Json
      }
      toggle_preset_vote: { Args: { p_preset_id: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
