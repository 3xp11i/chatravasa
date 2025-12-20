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
      admins: {
        Row: {
          avatar: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          first_name: string
          id: string
          last_name: string
          phone: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "admins_id_fkey1"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_meals: {
        Row: {
          created_at: string
          hostel_id: string | null
          id: string
          name: string
          status_deadline: number
          timing: string
          weekdays: number[]
        }
        Insert: {
          created_at?: string
          hostel_id?: string | null
          id?: string
          name: string
          status_deadline?: number
          timing: string
          weekdays?: number[]
        }
        Update: {
          created_at?: string
          hostel_id?: string | null
          id?: string
          name?: string
          status_deadline?: number
          timing?: string
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "hostel_meals_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_weekly_menu: {
        Row: {
          created_at: string
          food: string
          hostel_meal_id: string | null
          id: number
          weekdays: number[]
        }
        Insert: {
          created_at?: string
          food: string
          hostel_meal_id?: string | null
          id?: number
          weekdays: number[]
        }
        Update: {
          created_at?: string
          food?: string
          hostel_meal_id?: string | null
          id?: number
          weekdays?: number[]
        }
        Relationships: [
          {
            foreignKeyName: "hostel_weekly_menu_hostel_meal_id_fkey"
            columns: ["hostel_meal_id"]
            isOneToOne: false
            referencedRelation: "hostel_meals"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          address: string
          admin_user_id: string
          available_rooms: number | null
          created_at: string
          hostel_name: string
          hostel_slug: string
          id: string
          total_rooms: number
        }
        Insert: {
          address: string
          admin_user_id: string
          available_rooms?: number | null
          created_at?: string
          hostel_name: string
          hostel_slug: string
          id?: string
          total_rooms: number
        }
        Update: {
          address?: string
          admin_user_id?: string
          available_rooms?: number | null
          created_at?: string
          hostel_name?: string
          hostel_slug?: string
          id?: string
          total_rooms?: number
        }
        Relationships: [
          {
            foreignKeyName: "hostels_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admins"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          first_name: string
          id: string
          is_admin: boolean
          last_name: string
          phone: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          first_name: string
          id: string
          is_admin: boolean
          last_name: string
          phone: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          first_name?: string
          id?: string
          is_admin?: boolean
          last_name?: string
          phone?: string
        }
        Relationships: []
      }
      resident_meal_overrides: {
        Row: {
          created_at: string
          id: string
          is_opted: boolean
          meal_date: string
          meal_id: string
          resident_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_opted: boolean
          meal_date: string
          meal_id: string
          resident_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_opted?: boolean
          meal_date?: string
          meal_id?: string
          resident_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_meal_overrides_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "hostel_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resident_meal_overrides_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          avatar: string | null
          created_at: string
          family_phone_number: string | null
          father_name: string | null
          first_name: string
          hostel_id: string
          id: string
          joining_date: string | null
          last_name: string
          phone_number: string
          room: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          family_phone_number?: string | null
          father_name?: string | null
          first_name: string
          hostel_id: string
          id: string
          joining_date?: string | null
          last_name: string
          phone_number: string
          room: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          family_phone_number?: string | null
          father_name?: string | null
          first_name?: string
          hostel_id?: string
          id?: string
          joining_date?: string | null
          last_name?: string
          phone_number?: string
          room?: string
        }
        Relationships: [
          {
            foreignKeyName: "residents_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      residents_info: {
        Row: {
          created_at: string
          in_room: boolean
          resident_id: string
        }
        Insert: {
          created_at?: string
          in_room?: boolean
          resident_id: string
        }
        Update: {
          created_at?: string
          in_room?: boolean
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "residents_info_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: true
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents_weekly_meal_status: {
        Row: {
          created_at: string
          id: number
          is_opted_weekdays: number[]
          meal_id: string | null
          not_opted_weekdays: number[] | null
          resident_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_opted_weekdays?: number[]
          meal_id?: string | null
          not_opted_weekdays?: number[] | null
          resident_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_opted_weekdays?: number[]
          meal_id?: string | null
          not_opted_weekdays?: number[] | null
          resident_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_weekly_meal_status_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "hostel_meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residents_weekly_meal_status_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authenticate_user: {
        Args: { phone_number: string; pin_text: string }
        Returns: {
          session_token: string
          user_data: Json
        }[]
      }
      create_user_with_pin: {
        Args: {
          user_email?: string
          user_full_name?: string
          user_phone: string
          user_pin: string
          user_profile_picture_url?: string
          user_role?: string
          user_room_number?: string
        }
        Returns: Json
      }
      hash_pin: { Args: { pin_text: string }; Returns: string }
      set_config: {
        Args: { is_local?: boolean; new_value: string; setting_name: string }
        Returns: string
      }
      validate_session: { Args: { token: string }; Returns: Json }
      verify_pin: {
        Args: { pin_hash: string; pin_text: string }
        Returns: boolean
      }
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
    Enums: {},
  },
} as const
