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
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id: string
        }
        Update: {
          created_at?: string
          id?: string
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
      complaint_upvotes: {
        Row: {
          complaint_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          complaint_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          complaint_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_upvotes_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "hostel_complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_complaint_replies: {
        Row: {
          author: string
          complaint_id: string
          created_at: string
          id: string
          message: string
          updated_at: string
        }
        Insert: {
          author: string
          complaint_id: string
          created_at?: string
          id?: string
          message: string
          updated_at?: string
        }
        Update: {
          author?: string
          complaint_id?: string
          created_at?: string
          id?: string
          message?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_replies_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_replies_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "hostel_complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_complaints: {
        Row: {
          attached_media: string[]
          author: string
          created_at: string
          description: string
          hostel_id: string
          id: string
          status: Database["public"]["Enums"]["Complaint Status"]
          title: string
          type: Database["public"]["Enums"]["Complaint Type"]
          updated_at: string
          upvotes: number | null
        }
        Insert: {
          attached_media: string[]
          author: string
          created_at?: string
          description: string
          hostel_id: string
          id?: string
          status?: Database["public"]["Enums"]["Complaint Status"]
          title: string
          type?: Database["public"]["Enums"]["Complaint Type"]
          updated_at?: string
          upvotes?: number | null
        }
        Update: {
          attached_media?: string[]
          author?: string
          created_at?: string
          description?: string
          hostel_id?: string
          id?: string
          status?: Database["public"]["Enums"]["Complaint Status"]
          title?: string
          type?: Database["public"]["Enums"]["Complaint Type"]
          updated_at?: string
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_fee_categories: {
        Row: {
          amount: string
          created_at: string
          hostel_id: string
          id: string
          title: string
        }
        Insert: {
          amount: string
          created_at?: string
          hostel_id: string
          id?: string
          title: string
        }
        Update: {
          amount?: string
          created_at?: string
          hostel_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_fee_categories_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
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
      hostel_reminder_logs: {
        Row: {
          created_at: string | null
          hostel_id: string
          id: string
          message: string | null
          reminder_type: string | null
          sent_at: string | null
          sent_by_user_id: string
          target_count: number | null
        }
        Insert: {
          created_at?: string | null
          hostel_id: string
          id?: string
          message?: string | null
          reminder_type?: string | null
          sent_at?: string | null
          sent_by_user_id: string
          target_count?: number | null
        }
        Update: {
          created_at?: string | null
          hostel_id?: string
          id?: string
          message?: string | null
          reminder_type?: string | null
          sent_at?: string | null
          sent_by_user_id?: string
          target_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hostel_reminder_logs_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_resident_fee_info: {
        Row: {
          created_at: string
          discount_amount: string | null
          fee_category_id: string
          id: string
          resident_id: string
        }
        Insert: {
          created_at?: string
          discount_amount?: string | null
          fee_category_id: string
          id?: string
          resident_id: string
        }
        Update: {
          created_at?: string
          discount_amount?: string | null
          fee_category_id?: string
          id?: string
          resident_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_resident_fee_info_fee_category_id_fkey"
            columns: ["fee_category_id"]
            isOneToOne: false
            referencedRelation: "hostel_fee_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_resident_fee_info_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: true
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_staff: {
        Row: {
          created_at: string
          id: string
          role_id: string
          staff_member_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role_id: string
          staff_member_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          staff_member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_staff_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "hostel_staff_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostel_staff_staff_member_id_fkey"
            columns: ["staff_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_staff_invites: {
        Row: {
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string
          role_id: string
        }
        Insert: {
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          role_id: string
        }
        Update: {
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hostel_staff_invites_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "hostel_staff_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_staff_roles: {
        Row: {
          created_at: string
          hostel_id: string
          id: string
          manage_complaints: boolean
          manage_fees: boolean
          manage_meals: boolean
          manage_residents: boolean
          title: string
          view_complaints: boolean
          view_fees: boolean
          view_meals: boolean
          view_residents: boolean
        }
        Insert: {
          created_at?: string
          hostel_id: string
          id?: string
          manage_complaints?: boolean
          manage_fees?: boolean
          manage_meals?: boolean
          manage_residents?: boolean
          title: string
          view_complaints?: boolean
          view_fees?: boolean
          view_meals?: boolean
          view_residents?: boolean
        }
        Update: {
          created_at?: string
          hostel_id?: string
          id?: string
          manage_complaints?: boolean
          manage_fees?: boolean
          manage_meals?: boolean
          manage_residents?: boolean
          title?: string
          view_complaints?: boolean
          view_fees?: boolean
          view_meals?: boolean
          view_residents?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "hostel_staff_roles_hostel_id_fkey"
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
          {
            foreignKeyName: "hostel_weekly_menu_hostel_meal_id_fkey"
            columns: ["hostel_meal_id"]
            isOneToOne: false
            referencedRelation: "meal_analytics"
            referencedColumns: ["meal_id"]
          },
        ]
      }
      hostels: {
        Row: {
          address: string
          admin_user_id: string | null
          available_rooms: number | null
          created_at: string
          hostel_name: string
          hostel_slug: string
          id: string
          total_rooms: number
        }
        Insert: {
          address: string
          admin_user_id?: string | null
          available_rooms?: number | null
          created_at?: string
          hostel_name: string
          hostel_slug: string
          id?: string
          total_rooms: number
        }
        Update: {
          address?: string
          admin_user_id?: string | null
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
      notifications: {
        Row: {
          body: string
          created_at: string | null
          id: string
          is_read: boolean
          metadata: Json | null
          title: string
          type: string
          url: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title: string
          type?: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          title?: string
          type?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
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
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      resident_fee_payments: {
        Row: {
          amount_paid: string
          created_at: string
          discount_amount: string | null
          id: string
          month_index: number
          paid_on: string
          resident_id: string
          total_amount: string
        }
        Insert: {
          amount_paid: string
          created_at?: string
          discount_amount?: string | null
          id?: string
          month_index: number
          paid_on: string
          resident_id: string
          total_amount: string
        }
        Update: {
          amount_paid?: string
          created_at?: string
          discount_amount?: string | null
          id?: string
          month_index?: number
          paid_on?: string
          resident_id?: string
          total_amount?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_fee_payments_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      resident_invites: {
        Row: {
          created_at: string
          family_phone_number: string | null
          first_name: string
          guardian_name: string | null
          hostel_id: string
          id: number
          joining_date: string | null
          last_name: string
          monthly_fee_amount: string | null
          phone: string
          room: string
        }
        Insert: {
          created_at?: string
          family_phone_number?: string | null
          first_name: string
          guardian_name?: string | null
          hostel_id: string
          id?: number
          joining_date?: string | null
          last_name: string
          monthly_fee_amount?: string | null
          phone: string
          room: string
        }
        Update: {
          created_at?: string
          family_phone_number?: string | null
          first_name?: string
          guardian_name?: string | null
          hostel_id?: string
          id?: number
          joining_date?: string | null
          last_name?: string
          monthly_fee_amount?: string | null
          phone?: string
          room?: string
        }
        Relationships: [
          {
            foreignKeyName: "resident_invites_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "resident_meal_overrides_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_analytics"
            referencedColumns: ["meal_id"]
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
          created_at: string
          family_phone_number: string | null
          guardian_name: string | null
          hostel_id: string
          id: string
          joining_date: string | null
          room: string
        }
        Insert: {
          created_at?: string
          family_phone_number?: string | null
          guardian_name?: string | null
          hostel_id: string
          id: string
          joining_date?: string | null
          room: string
        }
        Update: {
          created_at?: string
          family_phone_number?: string | null
          guardian_name?: string | null
          hostel_id?: string
          id?: string
          joining_date?: string | null
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
          {
            foreignKeyName: "residents_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      residents_metadata: {
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
            foreignKeyName: "residents_weekly_meal_status_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meal_analytics"
            referencedColumns: ["meal_id"]
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
      trigger_debug_log: {
        Row: {
          created_at: string | null
          id: number
          message: string | null
          phone: string | null
          resident_invite_found: boolean | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          message?: string | null
          phone?: string | null
          resident_invite_found?: boolean | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string | null
          phone?: string | null
          resident_invite_found?: boolean | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      meal_analytics: {
        Row: {
          hostel_id: string | null
          meal_id: string | null
          meal_name: string | null
          meal_served: boolean | null
          meal_weekdays: number[] | null
          status_deadline: number | null
          timing: string | null
          today: string | null
          today_opted_count: number | null
          today_weekday: number | null
          tomorrow: string | null
          tomorrow_opted_count: number | null
          tomorrow_weekday: number | null
          total_residents: number | null
          weekday: number | null
          weekly_opted_count: number | null
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
    }
    Functions: {
      authenticate_user: {
        Args: { phone_number: string; pin_text: string }
        Returns: {
          session_token: string
          user_data: Json
        }[]
      }
      can_view_profile: {
        Args: { profile_id: string; viewer_id: string }
        Returns: boolean
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
      get_user_hostel_id: { Args: { user_id: string }; Returns: string }
      hash_pin: { Args: { pin_text: string }; Returns: string }
      is_staff_of_hostel: { Args: { hostel_id: string }; Returns: boolean }
      residents_in_same_hostel: {
        Args: { target_id: string; viewer_id: string }
        Returns: boolean
      }
      set_config: {
        Args: { is_local?: boolean; new_value: string; setting_name: string }
        Returns: string
      }
      staff_can_view_profile: {
        Args: { profile_id: string; viewer_id: string }
        Returns: boolean
      }
      users_in_same_hostel: {
        Args: { user1: string; user2: string }
        Returns: boolean
      }
      validate_session: { Args: { token: string }; Returns: Json }
      verify_pin: {
        Args: { pin_hash: string; pin_text: string }
        Returns: boolean
      }
    }
    Enums: {
      "Complaint Status": "resolved" | "ongoing" | "pending"
      "Complaint Type": "private" | "public"
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
      "Complaint Status": ["resolved", "ongoing", "pending"],
      "Complaint Type": ["private", "public"],
    },
  },
} as const
