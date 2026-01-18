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
      caregiver_coupons: {
        Row: {
          caregiver_id: string
          coupon_code: string
          coupon_description: string | null
          coupon_title: string
          coupon_type: string
          earned_at: string
          expires_at: string | null
          hearts_required: number
          id: string
          is_redeemed: boolean
          redeemed_at: string | null
        }
        Insert: {
          caregiver_id: string
          coupon_code: string
          coupon_description?: string | null
          coupon_title: string
          coupon_type?: string
          earned_at?: string
          expires_at?: string | null
          hearts_required?: number
          id?: string
          is_redeemed?: boolean
          redeemed_at?: string | null
        }
        Update: {
          caregiver_id?: string
          coupon_code?: string
          coupon_description?: string | null
          coupon_title?: string
          coupon_type?: string
          earned_at?: string
          expires_at?: string | null
          hearts_required?: number
          id?: string
          is_redeemed?: boolean
          redeemed_at?: string | null
        }
        Relationships: []
      }
      caregiver_logs: {
        Row: {
          caregiver_id: string
          content: string
          created_at: string
          elderly_user_id: string
          emotion_detected: string | null
          id: string
          is_read: boolean | null
          log_type: string
          severity: string | null
          title: string
        }
        Insert: {
          caregiver_id: string
          content: string
          created_at?: string
          elderly_user_id: string
          emotion_detected?: string | null
          id?: string
          is_read?: boolean | null
          log_type: string
          severity?: string | null
          title: string
        }
        Update: {
          caregiver_id?: string
          content?: string
          created_at?: string
          elderly_user_id?: string
          emotion_detected?: string | null
          id?: string
          is_read?: boolean | null
          log_type?: string
          severity?: string | null
          title?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          content: string
          created_at: string
          emotion_tag: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          emotion_tag?: string | null
          id?: string
          role: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          emotion_tag?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      hearts: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id?: string
          id?: string
          to_user_id?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          to_user_id?: string
        }
        Relationships: []
      }
      mission_completions: {
        Row: {
          completed_at: string
          id: string
          mission_type: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          mission_type: string
          user_id?: string
        }
        Update: {
          completed_at?: string
          id?: string
          mission_type?: string
          user_id?: string
        }
        Relationships: []
      }
      patient_profiles: {
        Row: {
          allergies: string[] | null
          chronic_diseases: string[] | null
          created_at: string
          current_medications: string[] | null
          emergency_contact: string | null
          health_status_summary: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          chronic_diseases?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          emergency_contact?: string | null
          health_status_summary?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          chronic_diseases?: string[] | null
          created_at?: string
          current_medications?: string[] | null
          emergency_contact?: string | null
          health_status_summary?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          caregiver_id: string | null
          created_at: string
          display_name: string
          id: string
          last_activity_at: string | null
          linked_caregiver_id: string | null
          pin_code: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          caregiver_id?: string | null
          created_at?: string
          display_name: string
          id?: string
          last_activity_at?: string | null
          linked_caregiver_id?: string | null
          pin_code?: string | null
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          caregiver_id?: string | null
          created_at?: string
          display_name?: string
          id?: string
          last_activity_at?: string | null
          linked_caregiver_id?: string | null
          pin_code?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_type: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_type"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      insert_caregiver_log: {
        Args: {
          p_caregiver_id: string
          p_content: string
          p_elderly_user_id: string
          p_emotion_detected?: string
          p_log_type: string
          p_severity?: string
          p_title: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      user_type: "elderly" | "caregiver"
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
      app_role: ["admin", "user"],
      user_type: ["elderly", "caregiver"],
    },
  },
} as const
