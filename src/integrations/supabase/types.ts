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
      ca_sources: {
        Row: {
          active: boolean
          category: string
          created_at: string
          feed_url: string
          id: string
          last_error: string | null
          last_fetched_at: string | null
          source_name: string
          source_url: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          feed_url: string
          id?: string
          last_error?: string | null
          last_fetched_at?: string | null
          source_name: string
          source_url?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          feed_url?: string
          id?: string
          last_error?: string | null
          last_fetched_at?: string | null
          source_name?: string
          source_url?: string
          updated_at?: string
        }
        Relationships: []
      }
      current_affairs: {
        Row: {
          category: string
          content: string
          content_hash: string
          created_at: string
          id: string
          image_url: string | null
          last_error: string | null
          published_at: string
          question_count: number
          source: string
          source_url: string
          status: string
          subject: string
          subtopic: string
          summary: string
          tags: string[]
          title: string
          topic: string
          updated_at: string
          upsc_relevance: number
        }
        Insert: {
          category?: string
          content?: string
          content_hash: string
          created_at?: string
          id?: string
          image_url?: string | null
          last_error?: string | null
          published_at?: string
          question_count?: number
          source?: string
          source_url: string
          status?: string
          subject?: string
          subtopic?: string
          summary?: string
          tags?: string[]
          title: string
          topic?: string
          updated_at?: string
          upsc_relevance?: number
        }
        Update: {
          category?: string
          content?: string
          content_hash?: string
          created_at?: string
          id?: string
          image_url?: string | null
          last_error?: string | null
          published_at?: string
          question_count?: number
          source?: string
          source_url?: string
          status?: string
          subject?: string
          subtopic?: string
          summary?: string
          tags?: string[]
          title?: string
          topic?: string
          updated_at?: string
          upsc_relevance?: number
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string
          created_by: string | null
          current_affair_id: string | null
          difficulty: string
          exam: string
          explanation: string
          id: string
          language: string
          marks: number
          negative_marks: number
          options: Json
          question: string
          question_key: string | null
          question_source: string
          question_type: string
          solving_seconds: number
          source_type: string
          source_url: string | null
          status: string
          subject: string
          subtopic: string
          tags: string[]
          topic: string
          topic_id: string
          updated_at: string
          year: number | null
        }
        Insert: {
          correct_answer: number
          created_at?: string
          created_by?: string | null
          current_affair_id?: string | null
          difficulty?: string
          exam?: string
          explanation?: string
          id?: string
          language?: string
          marks?: number
          negative_marks?: number
          options: Json
          question: string
          question_key?: string | null
          question_source?: string
          question_type?: string
          solving_seconds?: number
          source_type?: string
          source_url?: string | null
          status?: string
          subject: string
          subtopic?: string
          tags?: string[]
          topic?: string
          topic_id?: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          correct_answer?: number
          created_at?: string
          created_by?: string | null
          current_affair_id?: string | null
          difficulty?: string
          exam?: string
          explanation?: string
          id?: string
          language?: string
          marks?: number
          negative_marks?: number
          options?: Json
          question?: string
          question_key?: string | null
          question_source?: string
          question_type?: string
          solving_seconds?: number
          source_type?: string
          source_url?: string | null
          status?: string
          subject?: string
          subtopic?: string
          tags?: string[]
          topic?: string
          topic_id?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_current_affair_id_fkey"
            columns: ["current_affair_id"]
            isOneToOne: false
            referencedRelation: "current_affairs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          additional_feedback: string | null
          anonymous_id: string
          created_at: string
          custom_response: string | null
          id: string
          selected_options: string[]
        }
        Insert: {
          additional_feedback?: string | null
          anonymous_id: string
          created_at?: string
          custom_response?: string | null
          id?: string
          selected_options: string[]
        }
        Update: {
          additional_feedback?: string | null
          anonymous_id?: string
          created_at?: string
          custom_response?: string | null
          id?: string
          selected_options?: string[]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_matching_questions: {
        Args: {
          _difficulties?: string[]
          _exam?: string
          _language?: string
          _subjects?: string[]
          _topic_ids?: string[]
          _types?: string[]
        }
        Returns: number
      }
      current_affairs_pipeline_stats: {
        Args: never
        Returns: {
          status: string
          total: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      pick_current_affairs_questions: {
        Args: {
          _difficulties?: string[]
          _exclude?: string[]
          _limit: number
          _since?: string
          _subjects?: string[]
        }
        Returns: {
          correct_answer: number
          created_at: string
          created_by: string | null
          current_affair_id: string | null
          difficulty: string
          exam: string
          explanation: string
          id: string
          language: string
          marks: number
          negative_marks: number
          options: Json
          question: string
          question_key: string | null
          question_source: string
          question_type: string
          solving_seconds: number
          source_type: string
          source_url: string | null
          status: string
          subject: string
          subtopic: string
          tags: string[]
          topic: string
          topic_id: string
          updated_at: string
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "questions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      pick_random_questions: {
        Args: {
          _difficulties?: string[]
          _exam?: string
          _exclude?: string[]
          _language?: string
          _limit: number
          _subjects?: string[]
          _topic_ids?: string[]
          _types?: string[]
        }
        Returns: {
          correct_answer: number
          created_at: string
          created_by: string | null
          current_affair_id: string | null
          difficulty: string
          exam: string
          explanation: string
          id: string
          language: string
          marks: number
          negative_marks: number
          options: Json
          question: string
          question_key: string | null
          question_source: string
          question_type: string
          solving_seconds: number
          source_type: string
          source_url: string | null
          status: string
          subject: string
          subtopic: string
          tags: string[]
          topic: string
          topic_id: string
          updated_at: string
          year: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "questions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      question_bank_stats: {
        Args: never
        Returns: {
          difficulty: string
          subject: string
          total: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
