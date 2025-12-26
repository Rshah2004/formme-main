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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string | null
          design_id: string | null
          file_id: string
          file_url: string
          id: string
          message_id: string | null
          techpack_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          design_id?: string | null
          file_id: string
          file_url: string
          id?: string
          message_id?: string | null
          techpack_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          design_id?: string | null
          file_id?: string
          file_url?: string
          id?: string
          message_id?: string | null
          techpack_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_techpack_id_fkey"
            columns: ["techpack_id"]
            isOneToOne: false
            referencedRelation: "techpacks"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          design_id: string
          id: string
          manufacturer_id: string
        }
        Insert: {
          created_at?: string | null
          design_id: string
          id?: string
          manufacturer_id: string
        }
        Update: {
          created_at?: string | null
          design_id?: string
          id?: string
          manufacturer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      design_specs: {
        Row: {
          artwork_url: string | null
          attachments: Json | null
          construction_notes: string | null
          created_at: string | null
          design_id: string
          drawing_image_url: string | null
          drawing_vector_data: Json | null
          fabric_type: string | null
          gsm: number | null
          id: string
          measurements: Json | null
          print_type: string | null
          updated_at: string | null
        }
        Insert: {
          artwork_url?: string | null
          attachments?: Json | null
          construction_notes?: string | null
          created_at?: string | null
          design_id: string
          drawing_image_url?: string | null
          drawing_vector_data?: Json | null
          fabric_type?: string | null
          gsm?: number | null
          id?: string
          measurements?: Json | null
          print_type?: string | null
          updated_at?: string | null
        }
        Update: {
          artwork_url?: string | null
          attachments?: Json | null
          construction_notes?: string | null
          created_at?: string | null
          design_id?: string
          drawing_image_url?: string | null
          drawing_vector_data?: Json | null
          fabric_type?: string | null
          gsm?: number | null
          id?: string
          measurements?: Json | null
          print_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_specs_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: true
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      designs: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          design_file_url: string | null
          id: string
          name: string
          status: string | null
          tech_pack_url: string | null
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          design_file_url?: string | null
          id?: string
          name: string
          status?: string | null
          tech_pack_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          design_file_url?: string | null
          id?: string
          name?: string
          status?: string | null
          tech_pack_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      manufacturer_matches: {
        Row: {
          created_at: string | null
          design_id: string
          id: string
          manufacturer_id: string
          score: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          design_id: string
          id?: string
          manufacturer_id: string
          score?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          design_id?: string
          id?: string
          manufacturer_id?: string
          score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "manufacturer_matches_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manufacturer_matches_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
        ]
      }
      manufacturers: {
        Row: {
          categories: string[] | null
          certifications: string[] | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          lead_time_days: number | null
          location: string | null
          max_capacity: number | null
          min_order_quantity: number | null
          name: string
          price_range: string | null
          rating: number | null
          specialties: string[] | null
          sustainability_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          categories?: string[] | null
          certifications?: string[] | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          location?: string | null
          max_capacity?: number | null
          min_order_quantity?: number | null
          name: string
          price_range?: string | null
          rating?: number | null
          specialties?: string[] | null
          sustainability_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          categories?: string[] | null
          certifications?: string[] | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lead_time_days?: number | null
          location?: string | null
          max_capacity?: number | null
          min_order_quantity?: number | null
          name?: string
          price_range?: string | null
          rating?: number | null
          specialties?: string[] | null
          sustainability_score?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: string[] | null
          chat_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          order_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          chat_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          order_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          chat_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          order_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channels: Database["public"]["Enums"]["notification_channel"][] | null
          created_at: string | null
          id: string
          manufacturer_responses: boolean | null
          order_updates: boolean | null
          sample_approvals: boolean | null
          shipping_updates: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channels?:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          created_at?: string | null
          id?: string
          manufacturer_responses?: boolean | null
          order_updates?: boolean | null
          sample_approvals?: boolean | null
          shipping_updates?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channels?:
            | Database["public"]["Enums"]["notification_channel"][]
            | null
          created_at?: string | null
          id?: string
          manufacturer_responses?: boolean | null
          order_updates?: boolean | null
          sample_approvals?: boolean | null
          shipping_updates?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          color_fastness: string | null
          created_at: string | null
          design_id: string
          designer_id: string
          fabric_type: string | null
          gsm: string | null
          id: string
          lab_dip_photos: string[] | null
          lead_time_days: number | null
          manufacturer_id: string | null
          notes: string | null
          preferred_location: string | null
          price: number | null
          production_completion_date: string | null
          production_params_approved: boolean | null
          production_params_submitted_at: string | null
          production_start_date: string | null
          production_timeline_data: Json | null
          qc_approved: boolean | null
          qc_notes: string | null
          qc_photos_l: string | null
          qc_photos_m: string | null
          qc_photos_s: string | null
          qc_photos_xl: string | null
          qc_result: string | null
          qc_submitted_at: string | null
          quantity: number | null
          sample_approved: boolean | null
          sample_submitted_at: string | null
          shipping_address: string | null
          shrinkage: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          sustainability_priority: string | null
          tech_pack_checklist: Json | null
          tech_pack_data: Json | null
          tech_pack_feasibility_confirmed_at: string | null
          tech_pack_feasibility_notes: string | null
          tech_pack_feasible: boolean | null
          techpack_id: string | null
          updated_at: string | null
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          color_fastness?: string | null
          created_at?: string | null
          design_id: string
          designer_id: string
          fabric_type?: string | null
          gsm?: string | null
          id?: string
          lab_dip_photos?: string[] | null
          lead_time_days?: number | null
          manufacturer_id?: string | null
          notes?: string | null
          preferred_location?: string | null
          price?: number | null
          production_completion_date?: string | null
          production_params_approved?: boolean | null
          production_params_submitted_at?: string | null
          production_start_date?: string | null
          production_timeline_data?: Json | null
          qc_approved?: boolean | null
          qc_notes?: string | null
          qc_photos_l?: string | null
          qc_photos_m?: string | null
          qc_photos_s?: string | null
          qc_photos_xl?: string | null
          qc_result?: string | null
          qc_submitted_at?: string | null
          quantity?: number | null
          sample_approved?: boolean | null
          sample_submitted_at?: string | null
          shipping_address?: string | null
          shrinkage?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          sustainability_priority?: string | null
          tech_pack_checklist?: Json | null
          tech_pack_data?: Json | null
          tech_pack_feasibility_confirmed_at?: string | null
          tech_pack_feasibility_notes?: string | null
          tech_pack_feasible?: boolean | null
          techpack_id?: string | null
          updated_at?: string | null
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          color_fastness?: string | null
          created_at?: string | null
          design_id?: string
          designer_id?: string
          fabric_type?: string | null
          gsm?: string | null
          id?: string
          lab_dip_photos?: string[] | null
          lead_time_days?: number | null
          manufacturer_id?: string | null
          notes?: string | null
          preferred_location?: string | null
          price?: number | null
          production_completion_date?: string | null
          production_params_approved?: boolean | null
          production_params_submitted_at?: string | null
          production_start_date?: string | null
          production_timeline_data?: Json | null
          qc_approved?: boolean | null
          qc_notes?: string | null
          qc_photos_l?: string | null
          qc_photos_m?: string | null
          qc_photos_s?: string | null
          qc_photos_xl?: string | null
          qc_result?: string | null
          qc_submitted_at?: string | null
          quantity?: number | null
          sample_approved?: boolean | null
          sample_submitted_at?: string | null
          shipping_address?: string | null
          shrinkage?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          sustainability_priority?: string | null
          tech_pack_checklist?: Json | null
          tech_pack_data?: Json | null
          tech_pack_feasibility_confirmed_at?: string | null
          tech_pack_feasibility_notes?: string | null
          tech_pack_feasible?: boolean | null
          techpack_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_manufacturer_id_fkey"
            columns: ["manufacturer_id"]
            isOneToOne: false
            referencedRelation: "manufacturers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_techpack_id_fkey"
            columns: ["techpack_id"]
            isOneToOne: false
            referencedRelation: "techpacks"
            referencedColumns: ["id"]
          },
        ]
      }
      production_updates: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_updates_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          capabilities: Json | null
          categories: Json | null
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          lead_time: number | null
          location: string | null
          moq: number | null
          phone: string | null
          rating: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          capabilities?: Json | null
          categories?: Json | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          lead_time?: number | null
          location?: string | null
          moq?: number | null
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          capabilities?: Json | null
          categories?: Json | null
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          lead_time?: number | null
          location?: string | null
          moq?: number | null
          phone?: string | null
          rating?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      techpacks: {
        Row: {
          created_at: string | null
          design_id: string
          generated_by: string | null
          id: string
          pdf_file_id: string | null
          pdf_url: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          design_id: string
          generated_by?: string | null
          id?: string
          pdf_file_id?: string | null
          pdf_url?: string | null
          version?: number
        }
        Update: {
          created_at?: string | null
          design_id?: string
          generated_by?: string | null
          id?: string
          pdf_file_id?: string | null
          pdf_url?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "techpacks_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "designer" | "manufacturer"
      notification_channel: "email" | "sms" | "in_app"
      order_status:
        | "draft"
        | "tech_pack_pending"
        | "sent_to_manufacturer"
        | "manufacturer_review"
        | "production_approval"
        | "sample_development"
        | "quality_check"
        | "shipping"
        | "delivered"
        | "cancelled"
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
      app_role: ["designer", "manufacturer"],
      notification_channel: ["email", "sms", "in_app"],
      order_status: [
        "draft",
        "tech_pack_pending",
        "sent_to_manufacturer",
        "manufacturer_review",
        "production_approval",
        "sample_development",
        "quality_check",
        "shipping",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const
