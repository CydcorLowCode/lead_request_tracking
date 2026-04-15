export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Align with DB check constraint on profiles */
export type LrtProfileRole = "territory_team" | "owner";

export type Database = {
  public: {
    Tables: {
      lrt_campaigns: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_active: boolean;
          config: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_active?: boolean;
          config?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          is_active?: boolean;
          config?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      lrt_profiles: {
        Row: {
          id: string;
          auth_user_id: string;
          email: string;
          full_name: string | null;
          role: LrtProfileRole;
          icl_unified_code: string | null;
          dealer_code: string | null;
          legal_corp_name: string | null;
          office_name: string | null;
          phone: string | null;
          sf_contact_id: string | null;
          sf_synced_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          email: string;
          full_name?: string | null;
          role: LrtProfileRole;
          icl_unified_code?: string | null;
          dealer_code?: string | null;
          legal_corp_name?: string | null;
          office_name?: string | null;
          phone?: string | null;
          sf_contact_id?: string | null;
          sf_synced_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          email?: string;
          full_name?: string | null;
          role?: LrtProfileRole;
          icl_unified_code?: string | null;
          dealer_code?: string | null;
          legal_corp_name?: string | null;
          office_name?: string | null;
          phone?: string | null;
          sf_contact_id?: string | null;
          sf_synced_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      lrt_user_campaigns: {
        Row: {
          id: string;
          user_id: string;
          campaign_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          campaign_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          campaign_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lrt_user_campaigns_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "lrt_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lrt_user_campaigns_campaign_id_fkey";
            columns: ["campaign_id"];
            isOneToOne: false;
            referencedRelation: "lrt_campaigns";
            referencedColumns: ["id"];
          },
        ];
      };
      lrt_lead_requests: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          campaign_id: string;
          owner_id: string;
          submitted_by: string;
          submitted_on_behalf: boolean;
          lead_type: string;
          area_type: string;
          lead_area_requested: string;
          lead_area_requested_2: string | null;
          lead_area_requested_3: string | null;
          lead_area_requested_4: string | null;
          lead_area_requested_5: string | null;
          date_needed_by: string | null;
          headcount: number | null;
          notes: string | null;
          is_reserve: boolean;
          dealer_code: string | null;
          dma: string | null;
          office: string | null;
          status: string;
          att_confirmation_number: string | null;
          att_submitted_at: string | null;
          att_response_at: string | null;
          approved_zip_codes: string | null;
          denied_zip_codes: string | null;
          internal_notes: string | null;
          notes_for_icl: string | null;
          sf_visibility_date: string | null;
          decline_date: string | null;
          sla_due_at: string | null;
          sla_status: string;
          form_data: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          campaign_id: string;
          owner_id: string;
          submitted_by: string;
          submitted_on_behalf?: boolean;
          lead_type: string;
          area_type: string;
          lead_area_requested: string;
          lead_area_requested_2?: string | null;
          lead_area_requested_3?: string | null;
          lead_area_requested_4?: string | null;
          lead_area_requested_5?: string | null;
          date_needed_by?: string | null;
          headcount?: number | null;
          notes?: string | null;
          is_reserve?: boolean;
          dealer_code?: string | null;
          dma?: string | null;
          office?: string | null;
          status?: string;
          att_confirmation_number?: string | null;
          att_submitted_at?: string | null;
          att_response_at?: string | null;
          approved_zip_codes?: string | null;
          denied_zip_codes?: string | null;
          internal_notes?: string | null;
          notes_for_icl?: string | null;
          sf_visibility_date?: string | null;
          decline_date?: string | null;
          sla_due_at?: string | null;
          sla_status?: string;
          form_data?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          campaign_id?: string;
          owner_id?: string;
          submitted_by?: string;
          submitted_on_behalf?: boolean;
          lead_type?: string;
          area_type?: string;
          lead_area_requested?: string;
          lead_area_requested_2?: string | null;
          lead_area_requested_3?: string | null;
          lead_area_requested_4?: string | null;
          lead_area_requested_5?: string | null;
          date_needed_by?: string | null;
          headcount?: number | null;
          notes?: string | null;
          is_reserve?: boolean;
          dealer_code?: string | null;
          dma?: string | null;
          office?: string | null;
          status?: string;
          att_confirmation_number?: string | null;
          att_submitted_at?: string | null;
          att_response_at?: string | null;
          approved_zip_codes?: string | null;
          denied_zip_codes?: string | null;
          internal_notes?: string | null;
          notes_for_icl?: string | null;
          sf_visibility_date?: string | null;
          decline_date?: string | null;
          sla_due_at?: string | null;
          sla_status?: string;
          form_data?: Json;
        };
        Relationships: [];
      };
      lrt_sla_configs: {
        Row: {
          id: string;
          campaign_id: string;
          lead_type: string;
          sla_hours: number;
          warning_hours: number;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          lead_type: string;
          sla_hours: number;
          warning_hours: number;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          lead_type?: string;
          sla_hours?: number;
          warning_hours?: number;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      lrt_audit_log: {
        Row: {
          id: string;
          request_id: string;
          changed_by: string;
          changed_at: string;
          field_name: string | null;
          old_value: string | null;
          new_value: string | null;
        };
        Insert: {
          id?: string;
          request_id: string;
          changed_by: string;
          changed_at?: string;
          field_name?: string | null;
          old_value?: string | null;
          new_value?: string | null;
        };
        Update: {
          id?: string;
          request_id?: string;
          changed_by?: string;
          changed_at?: string;
          field_name?: string | null;
          old_value?: string | null;
          new_value?: string | null;
        };
        Relationships: [];
      };
      lrt_dmas: {
        Row: {
          id: string;
          campaign_id: string;
          dma_name: string;
          market: string | null;
          state: string | null;
          is_warning: boolean;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          dma_name: string;
          market?: string | null;
          state?: string | null;
          is_warning?: boolean;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          dma_name?: string;
          market?: string | null;
          state?: string | null;
          is_warning?: boolean;
        };
        Relationships: [];
      };
      lrt_no_coverage_zips: {
        Row: {
          id: string;
          campaign_id: string;
          zip_code: string;
          city: string | null;
          state: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          zip_code: string;
          city?: string | null;
          state?: string | null;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          zip_code?: string;
          city?: string | null;
          state?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      lrt_is_territory_team: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      lrt_append_audit_log: {
        Args: {
          p_request_id: string;
          p_field_name?: string | null;
          p_old_value?: string | null;
          p_new_value?: string | null;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
