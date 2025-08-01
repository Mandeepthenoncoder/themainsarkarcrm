export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_flags: {
        Row: {
          created_at: string
          date_added: string
          description: string
          flagged_by_user_id: string
          id: string
          is_resolved: boolean | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["flag_severity_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_added?: string
          description: string
          flagged_by_user_id: string
          id?: string
          is_resolved?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["flag_severity_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_added?: string
          description?: string
          flagged_by_user_id?: string
          id?: string
          is_resolved?: boolean | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["flag_severity_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_flags_flagged_by_user_id_fkey"
            columns: ["flagged_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_log: {
        Row: {
          action_type: string
          details: Json | null
          id: number
          related_entity_id: string | null
          related_entity_type: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action_type: string
          details?: Json | null
          id?: number
          related_entity_id?: string | null
          related_entity_type?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action_type?: string
          details?: Json | null
          id?: number
          related_entity_id?: string | null
          related_entity_type?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_showrooms: {
        Row: {
          announcement_id: string
          showroom_id: string
        }
        Insert: {
          announcement_id: string
          showroom_id: string
        }
        Update: {
          announcement_id?: string
          showroom_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_showrooms_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_showrooms_showroom_id_fkey"
            columns: ["showroom_id"]
            isOneToOne: false
            referencedRelation: "showrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          publish_date: string | null
          status: Database["public"]["Enums"]["announcement_status_enum"]
          target_audience_role:
            | Database["public"]["Enums"]["announcement_target_role_enum"]
            | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          publish_date?: string | null
          status?: Database["public"]["Enums"]["announcement_status_enum"]
          target_audience_role?:
            | Database["public"]["Enums"]["announcement_target_role_enum"]
            | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          publish_date?: string | null
          status?: Database["public"]["Enums"]["announcement_status_enum"]
          target_audience_role?:
            | Database["public"]["Enums"]["announcement_target_role_enum"]
            | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_datetime: string
          created_at: string
          created_by_user_id: string
          customer_id: string
          duration_minutes: number | null
          id: string
          internal_notes: string | null
          manager_id: string | null
          notes: string | null
          salesperson_id: string | null
          service_type: string
          showroom_id: string
          status: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at: string
        }
        Insert: {
          appointment_datetime: string
          created_at?: string
          created_by_user_id: string
          customer_id: string
          duration_minutes?: number | null
          id?: string
          internal_notes?: string | null
          manager_id?: string | null
          notes?: string | null
          salesperson_id?: string | null
          service_type: string
          showroom_id: string
          status?: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at?: string
        }
        Update: {
          appointment_datetime?: string
          created_at?: string
          created_by_user_id?: string
          customer_id?: string
          duration_minutes?: number | null
          id?: string
          internal_notes?: string | null
          manager_id?: string | null
          notes?: string | null
          salesperson_id?: string | null
          service_type?: string
          showroom_id?: string
          status?: Database["public"]["Enums"]["appointment_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_showroom_id_fkey"
            columns: ["showroom_id"]
            isOneToOne: false
            referencedRelation: "showrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_state: string | null
          address_street: string | null
          address_zip: string | null
          age_of_end_user: string | null
          anniversary_date: string | null
          assigned_salesperson_id: string | null
          assigned_showroom_id: string
          avatar_url: string | null
          birth_date: string | null
          call_logs: Json | null
          catchment_area: string | null
          community: string | null
          created_at: string
          customer_preferences: Json | null
          date_added: string
          email: string | null
          follow_up_date: string | null
          full_name: string
          id: string
          interest_categories_json: Json | null
          interest_level:
            | Database["public"]["Enums"]["interest_level_enum"]
            | null
          last_contacted_date: string | null
          lead_source: string | null
          lead_status: Database["public"]["Enums"]["lead_status_enum"]
          manager_lead_status_override:
            | Database["public"]["Enums"]["manager_lead_override_enum"]
            | null
          manager_notes: string | null
          monthly_saving_scheme_status: string | null
          mother_tongue: string | null
          notes: string | null
          phone_number: string | null
          purchase_amount: number | null
          reason_for_visit: string | null
          updated_at: string
          visit_logs: Json | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          age_of_end_user?: string | null
          anniversary_date?: string | null
          assigned_salesperson_id?: string | null
          assigned_showroom_id: string
          avatar_url?: string | null
          birth_date?: string | null
          call_logs?: Json | null
          catchment_area?: string | null
          community?: string | null
          created_at?: string
          customer_preferences?: Json | null
          date_added?: string
          email?: string | null
          follow_up_date?: string | null
          full_name: string
          id?: string
          interest_categories_json?: Json | null
          interest_level?:
            | Database["public"]["Enums"]["interest_level_enum"]
            | null
          last_contacted_date?: string | null
          lead_source?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status_enum"]
          manager_lead_status_override?:
            | Database["public"]["Enums"]["manager_lead_override_enum"]
            | null
          manager_notes?: string | null
          monthly_saving_scheme_status?: string | null
          mother_tongue?: string | null
          notes?: string | null
          phone_number?: string | null
          purchase_amount?: number | null
          reason_for_visit?: string | null
          updated_at?: string
          visit_logs?: Json | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zip?: string | null
          age_of_end_user?: string | null
          anniversary_date?: string | null
          assigned_salesperson_id?: string | null
          assigned_showroom_id?: string
          avatar_url?: string | null
          birth_date?: string | null
          call_logs?: Json | null
          catchment_area?: string | null
          community?: string | null
          created_at?: string
          customer_preferences?: Json | null
          date_added?: string
          email?: string | null
          follow_up_date?: string | null
          full_name?: string
          id?: string
          interest_categories_json?: Json | null
          interest_level?:
            | Database["public"]["Enums"]["interest_level_enum"]
            | null
          last_contacted_date?: string | null
          lead_source?: string | null
          lead_status?: Database["public"]["Enums"]["lead_status_enum"]
          manager_lead_status_override?:
            | Database["public"]["Enums"]["manager_lead_override_enum"]
            | null
          manager_notes?: string | null
          monthly_saving_scheme_status?: string | null
          mother_tongue?: string | null
          notes?: string | null
          phone_number?: string | null
          purchase_amount?: number | null
          reason_for_visit?: string | null
          updated_at?: string
          visit_logs?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_salesperson_id_fkey"
            columns: ["assigned_salesperson_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_assigned_showroom_id_fkey"
            columns: ["assigned_showroom_id"]
            isOneToOne: false
            referencedRelation: "showrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      escalations: {
        Row: {
          assigned_to_manager_id: string | null
          created_at: string
          customer_id: string
          id: string
          issue_description: string
          issue_title: string
          priority: Database["public"]["Enums"]["escalation_priority_enum"]
          reported_by_user_id: string
          resolution_details: string | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["escalation_status_enum"]
          updated_at: string
        }
        Insert: {
          assigned_to_manager_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          issue_description: string
          issue_title: string
          priority?: Database["public"]["Enums"]["escalation_priority_enum"]
          reported_by_user_id: string
          resolution_details?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["escalation_status_enum"]
          updated_at?: string
        }
        Update: {
          assigned_to_manager_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          issue_description?: string
          issue_title?: string
          priority?: Database["public"]["Enums"]["escalation_priority_enum"]
          reported_by_user_id?: string
          resolution_details?: string | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["escalation_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalations_assigned_to_manager_id_fkey"
            columns: ["assigned_to_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalations_reported_by_user_id_fkey"
            columns: ["reported_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          assignee_id: string
          created_at: string
          created_by_manager_id: string
          current_value_numeric: number | null
          current_value_text: string | null
          description: string | null
          end_date: string
          goal_type: Database["public"]["Enums"]["goal_type_enum"]
          id: string
          start_date: string
          status: Database["public"]["Enums"]["goal_status_enum"]
          target_metric: string
          target_value_numeric: number | null
          target_value_text: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id: string
          created_at?: string
          created_by_manager_id: string
          current_value_numeric?: number | null
          current_value_text?: string | null
          description?: string | null
          end_date: string
          goal_type: Database["public"]["Enums"]["goal_type_enum"]
          id?: string
          start_date: string
          status?: Database["public"]["Enums"]["goal_status_enum"]
          target_metric: string
          target_value_numeric?: number | null
          target_value_text?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string
          created_at?: string
          created_by_manager_id?: string
          current_value_numeric?: number | null
          current_value_text?: string | null
          description?: string | null
          end_date?: string
          goal_type?: Database["public"]["Enums"]["goal_type_enum"]
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["goal_status_enum"]
          target_metric?: string
          target_value_numeric?: number | null
          target_value_text?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_created_by_manager_id_fkey"
            columns: ["created_by_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          assigned_showroom_id: string | null
          avatar_url: string | null
          created_at: string
          date_hired: string | null
          email: string | null
          employee_id: string | null
          full_name: string
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          status: Database["public"]["Enums"]["user_status_enum"]
          supervising_manager_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_showroom_id?: string | null
          avatar_url?: string | null
          created_at?: string
          date_hired?: string | null
          email?: string | null
          employee_id?: string | null
          full_name: string
          id: string
          phone_number?: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          status?: Database["public"]["Enums"]["user_status_enum"]
          supervising_manager_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_showroom_id?: string | null
          avatar_url?: string | null
          created_at?: string
          date_hired?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          status?: Database["public"]["Enums"]["user_status_enum"]
          supervising_manager_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_assigned_showroom"
            columns: ["assigned_showroom_id"]
            isOneToOne: false
            referencedRelation: "showrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_supervising_manager_id_fkey"
            columns: ["supervising_manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_transactions: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          notes: string | null
          salesperson_id: string
          showroom_id: string
          total_amount: number
          transaction_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          notes?: string | null
          salesperson_id: string
          showroom_id: string
          total_amount: number
          transaction_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          notes?: string | null
          salesperson_id?: string
          showroom_id?: string
          total_amount?: number
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_transactions_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_transactions_showroom_id_fkey"
            columns: ["showroom_id"]
            isOneToOne: false
            referencedRelation: "showrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      showrooms: {
        Row: {
          city: string | null
          created_at: string
          date_established: string | null
          email_address: string | null
          id: string
          location_address: string | null
          manager_id: string | null
          name: string
          operating_hours: Json | null
          phone_number: string | null
          state: string | null
          status: Database["public"]["Enums"]["showroom_status_enum"]
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          date_established?: string | null
          email_address?: string | null
          id?: string
          location_address?: string | null
          manager_id?: string | null
          name: string
          operating_hours?: Json | null
          phone_number?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["showroom_status_enum"]
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          date_established?: string | null
          email_address?: string | null
          id?: string
          location_address?: string | null
          manager_id?: string | null
          name?: string
          operating_hours?: Json | null
          phone_number?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["showroom_status_enum"]
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "showrooms_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          data_type: string
          description: string | null
          is_public: boolean | null
          key: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          data_type: string
          description?: string | null
          is_public?: boolean | null
          key: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          data_type?: string
          description?: string | null
          is_public?: boolean | null
          key?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          appointment_id: string | null
          assigned_by_user_id: string | null
          assigned_to_user_id: string
          completion_date: string | null
          created_at: string
          customer_id: string | null
          description: string | null
          due_date: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["task_priority_enum"]
          status: Database["public"]["Enums"]["task_status_enum"]
          title: string
          updated_at: string
        }
        Insert: {
          appointment_id?: string | null
          assigned_by_user_id?: string | null
          assigned_to_user_id: string
          completion_date?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_date: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority_enum"]
          status?: Database["public"]["Enums"]["task_status_enum"]
          title: string
          updated_at?: string
        }
        Update: {
          appointment_id?: string | null
          assigned_by_user_id?: string | null
          assigned_to_user_id?: string
          completion_date?: string | null
          created_at?: string
          customer_id?: string | null
          description?: string | null
          due_date?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["task_priority_enum"]
          status?: Database["public"]["Enums"]["task_status_enum"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_by_user_id_fkey"
            columns: ["assigned_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_user_id_fkey"
            columns: ["assigned_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_items: {
        Row: {
          created_at: string
          id: string
          product_name: string
          product_sku: string | null
          quantity: number
          total_price: number
          transaction_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_name: string
          product_sku?: string | null
          quantity?: number
          total_price: number
          transaction_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total_price?: number
          transaction_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "sales_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_assigned_showroom_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_my_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_manager_of_showroom: {
        Args: { user_id_to_check: string; showroom_id_to_check: string }
        Returns: boolean
      }
    }
    Enums: {
      announcement_status_enum: "Draft" | "Published" | "Archived"
      announcement_target_role_enum: "All" | "Admin" | "Manager" | "Salesperson"
      appointment_status_enum:
        | "Scheduled"
        | "Confirmed"
        | "Completed"
        | "Cancelled"
        | "Rescheduled"
        | "No Show"
      escalation_priority_enum: "High" | "Medium" | "Low"
      escalation_status_enum:
        | "Open"
        | "In Progress"
        | "Pending Customer"
        | "Resolved"
        | "Closed"
      flag_severity_enum: "low" | "medium" | "high"
      goal_status_enum:
        | "Active"
        | "Achieved"
        | "Partially Achieved"
        | "Not Achieved"
        | "Cancelled"
      goal_type_enum: "Showroom" | "ManagerTeam" | "SalespersonIndividual"
      interest_level_enum: "High" | "Medium" | "Low" | "None"
      lead_status_enum:
        | "New Lead"
        | "Contacted"
        | "Qualified"
        | "Proposal Sent"
        | "Negotiation"
        | "Closed Won"
        | "Closed Lost"
      manager_lead_override_enum: "Hot" | "Warm" | "Cold"
      showroom_status_enum: "active" | "inactive" | "under_renovation"
      task_priority_enum: "High" | "Medium" | "Low"
      task_status_enum: "To Do" | "In Progress" | "Completed" | "Blocked"
      user_role_enum: "admin" | "manager" | "salesperson"
      user_status_enum: "active" | "inactive" | "pending_approval"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_status_enum: ["Draft", "Published", "Archived"],
      announcement_target_role_enum: ["All", "Admin", "Manager", "Salesperson"],
      appointment_status_enum: [
        "Scheduled",
        "Confirmed",
        "Completed",
        "Cancelled",
        "Rescheduled",
        "No Show",
      ],
      escalation_priority_enum: ["High", "Medium", "Low"],
      escalation_status_enum: [
        "Open",
        "In Progress",
        "Pending Customer",
        "Resolved",
        "Closed",
      ],
      flag_severity_enum: ["low", "medium", "high"],
      goal_status_enum: [
        "Active",
        "Achieved",
        "Partially Achieved",
        "Not Achieved",
        "Cancelled",
      ],
      goal_type_enum: ["Showroom", "ManagerTeam", "SalespersonIndividual"],
      interest_level_enum: ["High", "Medium", "Low", "None"],
      lead_status_enum: [
        "New Lead",
        "Contacted",
        "Qualified",
        "Proposal Sent",
        "Negotiation",
        "Closed Won",
        "Closed Lost",
      ],
      manager_lead_override_enum: ["Hot", "Warm", "Cold"],
      showroom_status_enum: ["active", "inactive", "under_renovation"],
      task_priority_enum: ["High", "Medium", "Low"],
      task_status_enum: ["To Do", "In Progress", "Completed", "Blocked"],
      user_role_enum: ["admin", "manager", "salesperson"],
      user_status_enum: ["active", "inactive", "pending_approval"],
    },
  },
} as const
