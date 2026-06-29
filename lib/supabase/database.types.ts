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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      birthday_entries: {
        Row: {
          birth_day: number
          birth_month: number
          birth_year: number | null
          created_at: string
          created_by: string
          description: string
          family_id: string | null
          id: string
          person_name: string
          updated_at: string
        }
        Insert: {
          birth_day: number
          birth_month: number
          birth_year?: number | null
          created_at?: string
          created_by: string
          description?: string
          family_id?: string | null
          id?: string
          person_name: string
          updated_at?: string
        }
        Update: {
          birth_day?: number
          birth_month?: number
          birth_year?: number | null
          created_at?: string
          created_by?: string
          description?: string
          family_id?: string | null
          id?: string
          person_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "birthday_entries_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_expenses: {
        Row: {
          amount: number
          budget_id: string
          category: string
          created_at: string
          created_by: string
          description: string
          entry_type: string
          expense_date: string
          id: string
          payment_reminder_enabled: boolean
          recurrence: string
          recurrence_end_date: string | null
          recurrence_interval_days: number | null
          reminder_sent_keys: string[]
          updated_at: string
        }
        Insert: {
          amount: number
          budget_id: string
          category: string
          created_at?: string
          created_by: string
          description?: string
          entry_type?: string
          expense_date: string
          id?: string
          payment_reminder_enabled?: boolean
          recurrence?: string
          recurrence_end_date?: string | null
          recurrence_interval_days?: number | null
          reminder_sent_keys?: string[]
          updated_at?: string
        }
        Update: {
          amount?: number
          budget_id?: string
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          entry_type?: string
          expense_date?: string
          id?: string
          payment_reminder_enabled?: boolean
          recurrence?: string
          recurrence_end_date?: string | null
          recurrence_interval_days?: number | null
          reminder_sent_keys?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_members: {
        Row: {
          budget_id: string
          member_id: string
        }
        Insert: {
          budget_id: string
          member_id: string
        }
        Update: {
          budget_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_members_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string
          created_by: string
          family_id: string | null
          id: string
          is_hidden: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_id?: string | null
          id?: string
          is_hidden?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_id?: string | null
          id?: string
          is_hidden?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      chore_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          completed_dates: string[]
          created_at: string
          created_by: string
          due_date: string | null
          family_id: string | null
          icon_emoji: string | null
          id: string
          notes: string
          recurrence: string
          recurrence_duration: string | null
          recurrence_end_date: string | null
          recurrence_interval_days: number | null
          recurrence_start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_dates?: string[]
          created_at?: string
          created_by: string
          due_date?: string | null
          family_id?: string | null
          icon_emoji?: string | null
          id?: string
          notes?: string
          recurrence?: string
          recurrence_duration?: string | null
          recurrence_end_date?: string | null
          recurrence_interval_days?: number | null
          recurrence_start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          completed_dates?: string[]
          created_at?: string
          created_by?: string
          due_date?: string | null
          family_id?: string | null
          icon_emoji?: string | null
          id?: string
          notes?: string
          recurrence?: string
          recurrence_duration?: string | null
          recurrence_end_date?: string | null
          recurrence_interval_days?: number | null
          recurrence_start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chore_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chore_tasks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      family_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          family_id: string
          id: string
          invited_by: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          family_id: string
          id?: string
          invited_by: string
          status?: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          family_id?: string
          id?: string
          invited_by?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_invitations_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_ideas: {
        Row: {
          content: string
          created_at: string
          created_by: string
          family_id: string | null
          id: string
          link_url: string | null
          recipient_member_id: string | null
          recipient_name: string
          recipient_type: string
          updated_at: string
          visible_to_member_ids: string[]
        }
        Insert: {
          content?: string
          created_at?: string
          created_by: string
          family_id?: string | null
          id?: string
          link_url?: string | null
          recipient_member_id?: string | null
          recipient_name: string
          recipient_type: string
          updated_at?: string
          visible_to_member_ids?: string[]
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          family_id?: string | null
          id?: string
          link_url?: string | null
          recipient_member_id?: string | null
          recipient_name?: string
          recipient_type?: string
          updated_at?: string
          visible_to_member_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "gift_ideas_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_ideas_recipient_member_id_fkey"
            columns: ["recipient_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_items: {
        Row: {
          availability: string
          created_at: string
          created_by: string
          expiry_date: string | null
          family_id: string | null
          form_type: string
          id: string
          location: string
          name: string
          notes: string
          quantity: string
          taken_by: string | null
          updated_at: string
        }
        Insert: {
          availability?: string
          created_at?: string
          created_by: string
          expiry_date?: string | null
          family_id?: string | null
          form_type: string
          id?: string
          location?: string
          name: string
          notes?: string
          quantity?: string
          taken_by?: string | null
          updated_at?: string
        }
        Update: {
          availability?: string
          created_at?: string
          created_by?: string
          expiry_date?: string | null
          family_id?: string | null
          form_type?: string
          id?: string
          location?: string
          name?: string
          notes?: string
          quantity?: string
          taken_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      note_categories: {
        Row: {
          created_at: string
          created_by: string
          family_id: string | null
          icon_emoji: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_id?: string | null
          icon_emoji?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_id?: string | null
          icon_emoji?: string | null
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      note_attachments: {
        Row: {
          byte_size: number
          created_at: string
          created_by: string
          file_name: string
          id: string
          mime_type: string
          note_id: string
          storage_path: string
        }
        Insert: {
          byte_size: number
          created_at?: string
          created_by: string
          file_name: string
          id?: string
          mime_type: string
          note_id: string
          storage_path: string
        }
        Update: {
          byte_size?: number
          created_at?: string
          created_by?: string
          file_name?: string
          id?: string
          mime_type?: string
          note_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          category_id: string | null
          content: string
          content_format: string
          created_at: string
          created_by: string
          family_id: string | null
          id: string
          is_pinned: boolean
          title: string
          updated_at: string
          visible_to_member_ids: string[]
        }
        Insert: {
          category_id?: string | null
          content?: string
          content_format?: string
          created_at?: string
          created_by: string
          family_id?: string | null
          id?: string
          is_pinned?: boolean
          title: string
          updated_at?: string
          visible_to_member_ids?: string[]
        }
        Update: {
          category_id?: string | null
          content?: string
          content_format?: string
          created_at?: string
          created_by?: string
          family_id?: string | null
          id?: string
          is_pinned?: boolean
          title?: string
          updated_at?: string
          visible_to_member_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "notes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "note_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          payload: Json
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_module_preferences: {
        Row: {
          email_digest_enabled: boolean
          in_app_enabled: boolean
          module_id: string
          push_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          email_digest_enabled?: boolean
          in_app_enabled?: boolean
          module_id: string
          push_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          email_digest_enabled?: boolean
          in_app_enabled?: boolean
          module_id?: string
          push_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_module_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pet_care_items: {
        Row: {
          care_type: string
          created_at: string
          created_by: string
          family_id: string | null
          id: string
          last_done_at: string | null
          name: string
          next_due_date: string | null
          notes: string
          pet_id: string
          quantity: string
          stock_status: string | null
          updated_at: string
        }
        Insert: {
          care_type: string
          created_at?: string
          created_by: string
          family_id?: string | null
          id?: string
          last_done_at?: string | null
          name: string
          next_due_date?: string | null
          notes?: string
          pet_id: string
          quantity?: string
          stock_status?: string | null
          updated_at?: string
        }
        Update: {
          care_type?: string
          created_at?: string
          created_by?: string
          family_id?: string | null
          id?: string
          last_done_at?: string | null
          name?: string
          next_due_date?: string | null
          notes?: string
          pet_id?: string
          quantity?: string
          stock_status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pet_care_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pet_care_items_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          created_at: string
          created_by: string
          family_id: string | null
          id: string
          name: string
          notes: string
          species: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_id?: string | null
          id?: string
          name: string
          notes?: string
          species: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_id?: string | null
          id?: string
          name?: string
          notes?: string
          species?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_mode: string
          avatar_color: string
          created_at: string
          dashboard_overview_layout: Json
          family_id: string | null
          family_role: string | null
          first_name: string
          id: string
          last_name: string
          nimbus_companion_enabled: boolean
          nimbus_companion_quiet: boolean
          onboarding_completed: boolean
          preferred_lang: string
          push_notifications_enabled: boolean
          email_digest_enabled: boolean
          notification_quiet_hours_enabled: boolean
          notification_quiet_start: string
          notification_quiet_end: string
          weekly_digest_enabled: boolean
          updated_at: string
        }
        Insert: {
          account_mode?: string
          avatar_color?: string
          created_at?: string
          dashboard_overview_layout?: Json
          family_id?: string | null
          family_role?: string | null
          first_name?: string
          id: string
          last_name?: string
          nimbus_companion_enabled?: boolean
          nimbus_companion_quiet?: boolean
          onboarding_completed?: boolean
          preferred_lang?: string
          push_notifications_enabled?: boolean
          email_digest_enabled?: boolean
          notification_quiet_hours_enabled?: boolean
          notification_quiet_start?: string
          notification_quiet_end?: string
          weekly_digest_enabled?: boolean
          updated_at?: string
        }
        Update: {
          account_mode?: string
          avatar_color?: string
          created_at?: string
          dashboard_overview_layout?: Json
          family_id?: string | null
          family_role?: string | null
          first_name?: string
          id?: string
          last_name?: string
          nimbus_companion_enabled?: boolean
          nimbus_companion_quiet?: boolean
          onboarding_completed?: boolean
          preferred_lang?: string
          push_notifications_enabled?: boolean
          email_digest_enabled?: boolean
          notification_quiet_hours_enabled?: boolean
          notification_quiet_start?: string
          notification_quiet_end?: string
          weekly_digest_enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_places: {
        Row: {
          address: string
          comment: string
          created_at: string
          created_by: string
          family_id: string | null
          id: string
          name: string
          notes: string
          rating: number | null
          updated_at: string
          venue_type: string
          visit_status: string
          visited_at: string | null
        }
        Insert: {
          address: string
          comment?: string
          created_at?: string
          created_by: string
          family_id?: string | null
          id?: string
          name: string
          notes?: string
          rating?: number | null
          updated_at?: string
          venue_type: string
          visit_status?: string
          visited_at?: string | null
        }
        Update: {
          address?: string
          comment?: string
          created_at?: string
          created_by?: string
          family_id?: string | null
          id?: string
          name?: string
          notes?: string
          rating?: number | null
          updated_at?: string
          venue_type?: string
          visit_status?: string
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_places_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_entries: {
        Row: {
          created_at: string
          created_by: string
          description: string
          entry_date: string
          entry_end_date: string | null
          entry_type: string
          family_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string
          entry_date: string
          entry_end_date?: string | null
          entry_type: string
          family_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          entry_date?: string
          entry_end_date?: string | null
          entry_type?: string
          family_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_entries_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_items: {
        Row: {
          category_id: string | null
          checked: boolean
          content: string
          created_at: string
          created_by: string
          id: string
          list_id: string
          quantity: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          checked?: boolean
          content: string
          created_at?: string
          created_by: string
          id?: string
          list_id: string
          quantity?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          checked?: boolean
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          list_id?: string
          quantity?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "shopping_list_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_categories: {
        Row: {
          created_at: string
          created_by: string | null
          family_id: string | null
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          family_id?: string | null
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          created_by: string
          family_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_lists_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlist_items: {
        Row: {
          created_at: string
          created_by: string
          family_id: string | null
          id: string
          media_type: string
          notes: string
          status: string
          streaming_platforms: string[]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          family_id?: string | null
          id?: string
          media_type: string
          notes?: string
          status?: string
          streaming_platforms?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          family_id?: string | null
          id?: string
          media_type?: string
          notes?: string
          status?: string
          streaming_platforms?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_family_invitation: {
        Args: { p_token: string; p_user_id: string }
        Returns: string
      }
      create_family_notifications: {
        Args: {
          p_body: string
          p_payload?: Json
          p_recipient_ids: string[]
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      create_system_notifications: {
        Args: {
          p_body: string
          p_payload?: Json
          p_recipient_ids: string[]
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      current_user_family_id: { Args: never; Returns: string }
      ensure_family_invite_code: {
        Args: { p_family_id: string }
        Returns: string
      }
      generate_family_invite_code: { Args: never; Returns: string }
      lookup_family_by_invite_code: {
        Args: { p_code: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      lookup_family_invitation: {
        Args: { p_token: string }
        Returns: {
          email: string
          family_id: string
          family_name: string
        }[]
      }
      normalize_family_invite_code: {
        Args: { p_code: string }
        Returns: string
      }
      update_family_member_role: {
        Args: { p_role: string; p_target_user_id: string }
        Returns: undefined
      }
      leave_family: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      remove_family_member: {
        Args: { p_target_user_id: string }
        Returns: undefined
      }
      transfer_family_ownership: {
        Args: { p_new_founder_id: string }
        Returns: undefined
      }
      user_can_access_budget: {
        Args: { p_budget_id: string }
        Returns: boolean
      }
      user_can_access_shopping_list: {
        Args: { p_list_id: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
