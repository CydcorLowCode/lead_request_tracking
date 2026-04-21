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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      aci: {
        Row: {
          bill_pulled_text: string | null
          breadcrumb_text: string | null
          bubble_id: string
          campaign_assignment_uuid: string | null
          campaign_id_text: string | null
          child_lead_id_custom_child_lead: string | null
          child_lead_id1_text: string | null
          child_lead_name_custom_child_lead: string | null
          child_lead_uuid: string | null
          client_custom_aci_v2: string | null
          client_option_campaigns: string | null
          created_at: string | null
          created_by: string | null
          credit_check_boolean: boolean | null
          date_date: number | null
          icl_custom_icl: string | null
          icl_uuid: string | null
          id: string
          input_6_text: string | null
          input_7_text: string | null
          loop_count_number: number | null
          modified_at: string | null
          negative_dispo2_option_negative_dispo2: string | null
          negative_disposition_option_negative_dispositions: string | null
          new_door_boolean: boolean | null
          ni_contact_boolean: boolean | null
          not_qualified_boolean: boolean | null
          not_qualified_option_negative_dispo2: string | null
          order_number: number | null
          order_uuid: string | null
          outcome_option_outcome: string | null
          parent_lead_custom_parent_lead: string | null
          parent_lead_id_text: string | null
          parent_lead_uuid: string | null
          point_of_dispo_geographic_address: Json | null
          point_of_disposition_distance_from_lead_number: number | null
          program_record_custom_program_record: string | null
          program_record_uuid: string | null
          related_campaign_assignment_custom_campaign_assignment: string | null
          related_order_custom_orders: string | null
          related_route_stop: string | null
          rep_email_text: string | null
          rep_name_text: string | null
          row_id_text: string | null
          sales_rep_email_text: string | null
          sales_rep_user: string | null
          sales_rep_uuid: string | null
          stage_option_stage: string | null
          territory_custom_territory: string | null
          territory_id_custom_territory: string | null
          territory_uuid: string | null
        }
        Insert: {
          bill_pulled_text?: string | null
          breadcrumb_text?: string | null
          bubble_id: string
          campaign_assignment_uuid?: string | null
          campaign_id_text?: string | null
          child_lead_id_custom_child_lead?: string | null
          child_lead_id1_text?: string | null
          child_lead_name_custom_child_lead?: string | null
          child_lead_uuid?: string | null
          client_custom_aci_v2?: string | null
          client_option_campaigns?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_check_boolean?: boolean | null
          date_date?: number | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          input_6_text?: string | null
          input_7_text?: string | null
          loop_count_number?: number | null
          modified_at?: string | null
          negative_dispo2_option_negative_dispo2?: string | null
          negative_disposition_option_negative_dispositions?: string | null
          new_door_boolean?: boolean | null
          ni_contact_boolean?: boolean | null
          not_qualified_boolean?: boolean | null
          not_qualified_option_negative_dispo2?: string | null
          order_number?: number | null
          order_uuid?: string | null
          outcome_option_outcome?: string | null
          parent_lead_custom_parent_lead?: string | null
          parent_lead_id_text?: string | null
          parent_lead_uuid?: string | null
          point_of_dispo_geographic_address?: Json | null
          point_of_disposition_distance_from_lead_number?: number | null
          program_record_custom_program_record?: string | null
          program_record_uuid?: string | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_order_custom_orders?: string | null
          related_route_stop?: string | null
          rep_email_text?: string | null
          rep_name_text?: string | null
          row_id_text?: string | null
          sales_rep_email_text?: string | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          stage_option_stage?: string | null
          territory_custom_territory?: string | null
          territory_id_custom_territory?: string | null
          territory_uuid?: string | null
        }
        Update: {
          bill_pulled_text?: string | null
          breadcrumb_text?: string | null
          bubble_id?: string
          campaign_assignment_uuid?: string | null
          campaign_id_text?: string | null
          child_lead_id_custom_child_lead?: string | null
          child_lead_id1_text?: string | null
          child_lead_name_custom_child_lead?: string | null
          child_lead_uuid?: string | null
          client_custom_aci_v2?: string | null
          client_option_campaigns?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_check_boolean?: boolean | null
          date_date?: number | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          input_6_text?: string | null
          input_7_text?: string | null
          loop_count_number?: number | null
          modified_at?: string | null
          negative_dispo2_option_negative_dispo2?: string | null
          negative_disposition_option_negative_dispositions?: string | null
          new_door_boolean?: boolean | null
          ni_contact_boolean?: boolean | null
          not_qualified_boolean?: boolean | null
          not_qualified_option_negative_dispo2?: string | null
          order_number?: number | null
          order_uuid?: string | null
          outcome_option_outcome?: string | null
          parent_lead_custom_parent_lead?: string | null
          parent_lead_id_text?: string | null
          parent_lead_uuid?: string | null
          point_of_dispo_geographic_address?: Json | null
          point_of_disposition_distance_from_lead_number?: number | null
          program_record_custom_program_record?: string | null
          program_record_uuid?: string | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_order_custom_orders?: string | null
          related_route_stop?: string | null
          rep_email_text?: string | null
          rep_name_text?: string | null
          row_id_text?: string | null
          sales_rep_email_text?: string | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          stage_option_stage?: string | null
          territory_custom_territory?: string | null
          territory_id_custom_territory?: string | null
          territory_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_aci_campaign_assignment"
            columns: ["campaign_assignment_uuid"]
            isOneToOne: false
            referencedRelation: "campaign_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aci_child_lead"
            columns: ["child_lead_uuid"]
            isOneToOne: false
            referencedRelation: "child_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aci_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aci_order"
            columns: ["order_uuid"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aci_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aci_program_record"
            columns: ["program_record_uuid"]
            isOneToOne: false
            referencedRelation: "program_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aci_sales_rep"
            columns: ["sales_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_aci_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          bubble_id: string
          created_at: string | null
          created_by: string | null
          id: string
          instructions_text: string | null
          modified_at: string | null
          name_text: string | null
          status_text: string | null
        }
        Insert: {
          bubble_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          instructions_text?: string | null
          modified_at?: string | null
          name_text?: string | null
          status_text?: string | null
        }
        Update: {
          bubble_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          instructions_text?: string | null
          modified_at?: string | null
          name_text?: string | null
          status_text?: string | null
        }
        Relationships: []
      }
      buildings: {
        Row: {
          bubble_id: string
          building_name_text: string | null
          created_at: string | null
          created_by: string | null
          id: string
          mdu_uuid: string | null
          modified_at: string | null
          related_floors_list: string[] | null
          related_mdu_custom_mdu: string | null
          related_parent_leads_list: string[] | null
        }
        Insert: {
          bubble_id: string
          building_name_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mdu_uuid?: string | null
          modified_at?: string | null
          related_floors_list?: string[] | null
          related_mdu_custom_mdu?: string | null
          related_parent_leads_list?: string[] | null
        }
        Update: {
          bubble_id?: string
          building_name_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mdu_uuid?: string | null
          modified_at?: string | null
          related_floors_list?: string[] | null
          related_mdu_custom_mdu?: string | null
          related_parent_leads_list?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_buildings_mdu"
            columns: ["mdu_uuid"]
            isOneToOne: false
            referencedRelation: "mdus"
            referencedColumns: ["id"]
          },
        ]
      }
      business_leads: {
        Row: {
          address: string | null
          address_info_std: Json | null
          business_status: string | null
          category_ids: Json | null
          city: string | null
          country: string | null
          dnv_date: string | null
          do_not_visit: boolean | null
          geom: unknown
          geom_3857: unknown
          google_place_id: string | null
          id: string | null
          ignore: boolean | null
          ignore_reason: string | null
          last_scrubbed_date: string | null
          latitude: number | null
          lead_type: string | null
          longitude: number | null
          name: string | null
          permanently_deleted: boolean | null
          postal_code: string | null
          state: string | null
          street: string | null
          street_number: number | null
        }
        Insert: {
          address?: string | null
          address_info_std?: Json | null
          business_status?: string | null
          category_ids?: Json | null
          city?: string | null
          country?: string | null
          dnv_date?: string | null
          do_not_visit?: boolean | null
          geom?: unknown
          geom_3857?: unknown
          google_place_id?: string | null
          id?: string | null
          ignore?: boolean | null
          ignore_reason?: string | null
          last_scrubbed_date?: string | null
          latitude?: number | null
          lead_type?: string | null
          longitude?: number | null
          name?: string | null
          permanently_deleted?: boolean | null
          postal_code?: string | null
          state?: string | null
          street?: string | null
          street_number?: number | null
        }
        Update: {
          address?: string | null
          address_info_std?: Json | null
          business_status?: string | null
          category_ids?: Json | null
          city?: string | null
          country?: string | null
          dnv_date?: string | null
          do_not_visit?: boolean | null
          geom?: unknown
          geom_3857?: unknown
          google_place_id?: string | null
          id?: string | null
          ignore?: boolean | null
          ignore_reason?: string | null
          last_scrubbed_date?: string | null
          latitude?: number | null
          lead_type?: string | null
          longitude?: number | null
          name?: string | null
          permanently_deleted?: boolean | null
          postal_code?: string | null
          state?: string | null
          street?: string | null
          street_number?: number | null
        }
        Relationships: []
      }
      business_leads_postal_summary: {
        Row: {
          last_updated: string | null
          lead_count: number | null
          postal_code: string
        }
        Insert: {
          last_updated?: string | null
          lead_count?: number | null
          postal_code: string
        }
        Update: {
          last_updated?: string | null
          lead_count?: number | null
          postal_code?: string
        }
        Relationships: []
      }
      business_restrictions: {
        Row: {
          created_at: string | null
          external_unified_id: string | null
          google_place_id: string
          id: string
          parent_lead_bubble_id: string | null
          program_record_bubble_id: string | null
          reason: string | null
          restricted_by_program: string
          restricted_from_program: string
          restriction_end: string
          restriction_start: string
        }
        Insert: {
          created_at?: string | null
          external_unified_id?: string | null
          google_place_id: string
          id?: string
          parent_lead_bubble_id?: string | null
          program_record_bubble_id?: string | null
          reason?: string | null
          restricted_by_program: string
          restricted_from_program: string
          restriction_end: string
          restriction_start: string
        }
        Update: {
          created_at?: string | null
          external_unified_id?: string | null
          google_place_id?: string
          id?: string
          parent_lead_bubble_id?: string | null
          program_record_bubble_id?: string | null
          reason?: string | null
          restricted_by_program?: string
          restricted_from_program?: string
          restriction_end?: string
          restriction_start?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          appointment_date: number | null
          attendee_type_text: string | null
          bubble_id: string
          campaign_assignment_uuid: string | null
          child_lead_uuid: string | null
          created_at: string | null
          created_by: string | null
          date__time_date: number | null
          date_date: number | null
          event_name_text: string | null
          event_notes_text: string | null
          event_type_option_calendar_event_type: string | null
          full_address_geographic_address: Json | null
          icl_uuid: string | null
          id: string
          latitude_number: number | null
          list_of_calendar_events_list: string[] | null
          longitude_number: number | null
          modified_at: string | null
          parent_lead_uuid: string | null
          related_campaign_assignment_custom_campaign_assignment: string | null
          related_child_lead_custom_child_lead: string | null
          related_icl_custom_icl: string | null
          related_parent_lead_custom_parent_lead: string | null
          related_territory_custom_territory: string | null
          related_user_user: string | null
          row_id_text: string | null
          status_option_status: string | null
          territory_uuid: string | null
          user_uuid: string | null
        }
        Insert: {
          appointment_date?: number | null
          attendee_type_text?: string | null
          bubble_id: string
          campaign_assignment_uuid?: string | null
          child_lead_uuid?: string | null
          created_at?: string | null
          created_by?: string | null
          date__time_date?: number | null
          date_date?: number | null
          event_name_text?: string | null
          event_notes_text?: string | null
          event_type_option_calendar_event_type?: string | null
          full_address_geographic_address?: Json | null
          icl_uuid?: string | null
          id?: string
          latitude_number?: number | null
          list_of_calendar_events_list?: string[] | null
          longitude_number?: number | null
          modified_at?: string | null
          parent_lead_uuid?: string | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_child_lead_custom_child_lead?: string | null
          related_icl_custom_icl?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          related_territory_custom_territory?: string | null
          related_user_user?: string | null
          row_id_text?: string | null
          status_option_status?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Update: {
          appointment_date?: number | null
          attendee_type_text?: string | null
          bubble_id?: string
          campaign_assignment_uuid?: string | null
          child_lead_uuid?: string | null
          created_at?: string | null
          created_by?: string | null
          date__time_date?: number | null
          date_date?: number | null
          event_name_text?: string | null
          event_notes_text?: string | null
          event_type_option_calendar_event_type?: string | null
          full_address_geographic_address?: Json | null
          icl_uuid?: string | null
          id?: string
          latitude_number?: number | null
          list_of_calendar_events_list?: string[] | null
          longitude_number?: number | null
          modified_at?: string | null
          parent_lead_uuid?: string | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_child_lead_custom_child_lead?: string | null
          related_icl_custom_icl?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          related_territory_custom_territory?: string | null
          related_user_user?: string | null
          row_id_text?: string | null
          status_option_status?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ce_campaign_assignment"
            columns: ["campaign_assignment_uuid"]
            isOneToOne: false
            referencedRelation: "campaign_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ce_child_lead"
            columns: ["child_lead_uuid"]
            isOneToOne: false
            referencedRelation: "child_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ce_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ce_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ce_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ce_user"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_assignments: {
        Row: {
          agent_code_text: string | null
          bubble_id: string
          campaign_option_campaigns: string | null
          ciaa_id__sf__text: string | null
          created_at: string | null
          created_by: string | null
          end_date_date: number | null
          icl_uuid: string | null
          id: string
          modified_at: string | null
          related_icl_custom_icl: string | null
          related_territory_custom_territory: string | null
          related_user_user: string | null
          rep_function_option_rep_function: string | null
          start_date_date: number | null
          status_option_status: string | null
          territory_uuid: string | null
          user_uuid: string | null
        }
        Insert: {
          agent_code_text?: string | null
          bubble_id: string
          campaign_option_campaigns?: string | null
          ciaa_id__sf__text?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date_date?: number | null
          icl_uuid?: string | null
          id?: string
          modified_at?: string | null
          related_icl_custom_icl?: string | null
          related_territory_custom_territory?: string | null
          related_user_user?: string | null
          rep_function_option_rep_function?: string | null
          start_date_date?: number | null
          status_option_status?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Update: {
          agent_code_text?: string | null
          bubble_id?: string
          campaign_option_campaigns?: string | null
          ciaa_id__sf__text?: string | null
          created_at?: string | null
          created_by?: string | null
          end_date_date?: number | null
          icl_uuid?: string | null
          id?: string
          modified_at?: string | null
          related_icl_custom_icl?: string | null
          related_territory_custom_territory?: string | null
          related_user_user?: string | null
          rep_function_option_rep_function?: string | null
          start_date_date?: number | null
          status_option_status?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ca_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ca_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ca_user"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_csv_config: {
        Row: {
          campaign: string
          created_at: string | null
          display_label: string
          field_group: string | null
          field_key: string
          id: string
          is_active: boolean
          notes: string | null
          sort_order: number
          source_table: string
          updated_at: string | null
        }
        Insert: {
          campaign: string
          created_at?: string | null
          display_label: string
          field_group?: string | null
          field_key: string
          id?: string
          is_active?: boolean
          notes?: string | null
          sort_order?: number
          source_table?: string
          updated_at?: string | null
        }
        Update: {
          campaign?: string
          created_at?: string | null
          display_label?: string
          field_group?: string | null
          field_key?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          sort_order?: number
          source_table?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_info: {
        Row: {
          address_label_text: string | null
          bubble_id: string
          client_option_campaigns: string | null
          configuration_flags: Json | null
          created_at: string | null
          created_by: string | null
          default_order_creation_type_text: string | null
          id: string
          modified_at: string | null
          notes_label_text: string | null
          order_attributes: Json | null
          order_id_label_text: string | null
          order_type_text: string | null
          product_categories_list: string[] | null
          related_product_catalog_list: string[] | null
          sales_date_label_text: string | null
          status_option_status: string | null
        }
        Insert: {
          address_label_text?: string | null
          bubble_id: string
          client_option_campaigns?: string | null
          configuration_flags?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_order_creation_type_text?: string | null
          id?: string
          modified_at?: string | null
          notes_label_text?: string | null
          order_attributes?: Json | null
          order_id_label_text?: string | null
          order_type_text?: string | null
          product_categories_list?: string[] | null
          related_product_catalog_list?: string[] | null
          sales_date_label_text?: string | null
          status_option_status?: string | null
        }
        Update: {
          address_label_text?: string | null
          bubble_id?: string
          client_option_campaigns?: string | null
          configuration_flags?: Json | null
          created_at?: string | null
          created_by?: string | null
          default_order_creation_type_text?: string | null
          id?: string
          modified_at?: string | null
          notes_label_text?: string | null
          order_attributes?: Json | null
          order_id_label_text?: string | null
          order_type_text?: string | null
          product_categories_list?: string[] | null
          related_product_catalog_list?: string[] | null
          sales_date_label_text?: string | null
          status_option_status?: string | null
        }
        Relationships: []
      }
      campaign_name_aliases: {
        Row: {
          alias: string
          canonical_name: string
          created_at: string | null
          id: string
        }
        Insert: {
          alias: string
          canonical_name: string
          created_at?: string | null
          id?: string
        }
        Update: {
          alias?: string
          canonical_name?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      campaign_unified_codes: {
        Row: {
          campaign: string
          country: string
          id: string
          sf_campaign_id: string
        }
        Insert: {
          campaign: string
          country?: string
          id?: string
          sf_campaign_id: string
        }
        Update: {
          campaign?: string
          country?: string
          id?: string
          sf_campaign_id?: string
        }
        Relationships: []
      }
      child_leads: {
        Row: {
          bubble_id: string
          business_name_custom_parent_lead: string | null
          business_name_text: string | null
          business_notes_custom_parent_lead: string | null
          business_type__manual__text: string | null
          business_types_list_text: string[] | null
          child_lead_id1_text: string | null
          contact_name_text: string | null
          contact_number_text: string | null
          created_at: string | null
          created_by: string | null
          dm_type_option_dm_type: string | null
          email_text: string | null
          furthest_stage_option_stage: string | null
          id: string
          is_dm_boolean: boolean | null
          last_activity_date: number | null
          loop_count_at_creation_number: number | null
          loop_count_number: number | null
          modified_at: string | null
          name_text: string | null
          notes_text: string | null
          parent_lead_custom_parent_lead: string | null
          parent_lead_id_custom_parent_lead: string | null
          parent_lead_uuid: string | null
          related_aci_list_custom_aci_v2: string[] | null
          related_calendar_events_list_custom_calendar_event: string[] | null
          related_notes1_list_custom_notes: string[] | null
          related_orders_list_custom_orders: string[] | null
          related_program_records_list_custom_program_record: string[] | null
          row_id_text: string | null
          status_option_status: string | null
        }
        Insert: {
          bubble_id: string
          business_name_custom_parent_lead?: string | null
          business_name_text?: string | null
          business_notes_custom_parent_lead?: string | null
          business_type__manual__text?: string | null
          business_types_list_text?: string[] | null
          child_lead_id1_text?: string | null
          contact_name_text?: string | null
          contact_number_text?: string | null
          created_at?: string | null
          created_by?: string | null
          dm_type_option_dm_type?: string | null
          email_text?: string | null
          furthest_stage_option_stage?: string | null
          id?: string
          is_dm_boolean?: boolean | null
          last_activity_date?: number | null
          loop_count_at_creation_number?: number | null
          loop_count_number?: number | null
          modified_at?: string | null
          name_text?: string | null
          notes_text?: string | null
          parent_lead_custom_parent_lead?: string | null
          parent_lead_id_custom_parent_lead?: string | null
          parent_lead_uuid?: string | null
          related_aci_list_custom_aci_v2?: string[] | null
          related_calendar_events_list_custom_calendar_event?: string[] | null
          related_notes1_list_custom_notes?: string[] | null
          related_orders_list_custom_orders?: string[] | null
          related_program_records_list_custom_program_record?: string[] | null
          row_id_text?: string | null
          status_option_status?: string | null
        }
        Update: {
          bubble_id?: string
          business_name_custom_parent_lead?: string | null
          business_name_text?: string | null
          business_notes_custom_parent_lead?: string | null
          business_type__manual__text?: string | null
          business_types_list_text?: string[] | null
          child_lead_id1_text?: string | null
          contact_name_text?: string | null
          contact_number_text?: string | null
          created_at?: string | null
          created_by?: string | null
          dm_type_option_dm_type?: string | null
          email_text?: string | null
          furthest_stage_option_stage?: string | null
          id?: string
          is_dm_boolean?: boolean | null
          last_activity_date?: number | null
          loop_count_at_creation_number?: number | null
          loop_count_number?: number | null
          modified_at?: string | null
          name_text?: string | null
          notes_text?: string | null
          parent_lead_custom_parent_lead?: string | null
          parent_lead_id_custom_parent_lead?: string | null
          parent_lead_uuid?: string | null
          related_aci_list_custom_aci_v2?: string[] | null
          related_calendar_events_list_custom_calendar_event?: string[] | null
          related_notes1_list_custom_notes?: string[] | null
          related_orders_list_custom_orders?: string[] | null
          related_program_records_list_custom_program_record?: string[] | null
          row_id_text?: string | null
          status_option_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cl_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      collateral_logs: {
        Row: {
          bubble_id: string
          collateral_accessed_list: string[] | null
          created_at: string | null
          created_by: string | null
          date_date: number | null
          id: string
          modified_at: string | null
          parent_lead_uuid: string | null
          related_parent_lead_custom_parent_lead: string | null
          rep_user: string | null
          rep_uuid: string | null
          within_log_visit_flow_boolean: boolean | null
        }
        Insert: {
          bubble_id: string
          collateral_accessed_list?: string[] | null
          created_at?: string | null
          created_by?: string | null
          date_date?: number | null
          id?: string
          modified_at?: string | null
          parent_lead_uuid?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          rep_user?: string | null
          rep_uuid?: string | null
          within_log_visit_flow_boolean?: boolean | null
        }
        Update: {
          bubble_id?: string
          collateral_accessed_list?: string[] | null
          created_at?: string | null
          created_by?: string | null
          date_date?: number | null
          id?: string
          modified_at?: string | null
          parent_lead_uuid?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          rep_user?: string | null
          rep_uuid?: string | null
          within_log_visit_flow_boolean?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_collateral_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_collateral_rep"
            columns: ["rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_relationships: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string
          program_a: string
          program_b: string
          restriction_days: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          program_a: string
          program_b: string
          restriction_days?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string
          program_a?: string
          program_b?: string
          restriction_days?: number | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          bubble_id: string
          contacted_dates_list: number[] | null
          created_at: string | null
          created_by: string | null
          created_by_text: string | null
          days_of_week_list: string[] | null
          email_text: string | null
          icl_uuid: string | null
          id: string
          last_contact_date_date: number | null
          last_name_text: string | null
          modified_at: string | null
          name__full__text: string | null
          name_text: string | null
          notes_list: string[] | null
          opt_in_date_date: number | null
          opted_in_boolean: boolean | null
          originating_icl_custom_icl: string | null
          outcome_option_referral_outcome: string | null
          phone_call_count_number: number | null
          phone1_number: number | null
          program_text: string | null
          referral_date_date: number | null
          related_notes_list: string[] | null
          requested_contact_time_text: string | null
          sales_rep_user: string | null
          sales_rep_uuid: string | null
          status_option_status: string | null
          time_zone_text: string | null
        }
        Insert: {
          bubble_id: string
          contacted_dates_list?: number[] | null
          created_at?: string | null
          created_by?: string | null
          created_by_text?: string | null
          days_of_week_list?: string[] | null
          email_text?: string | null
          icl_uuid?: string | null
          id?: string
          last_contact_date_date?: number | null
          last_name_text?: string | null
          modified_at?: string | null
          name__full__text?: string | null
          name_text?: string | null
          notes_list?: string[] | null
          opt_in_date_date?: number | null
          opted_in_boolean?: boolean | null
          originating_icl_custom_icl?: string | null
          outcome_option_referral_outcome?: string | null
          phone_call_count_number?: number | null
          phone1_number?: number | null
          program_text?: string | null
          referral_date_date?: number | null
          related_notes_list?: string[] | null
          requested_contact_time_text?: string | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          status_option_status?: string | null
          time_zone_text?: string | null
        }
        Update: {
          bubble_id?: string
          contacted_dates_list?: number[] | null
          created_at?: string | null
          created_by?: string | null
          created_by_text?: string | null
          days_of_week_list?: string[] | null
          email_text?: string | null
          icl_uuid?: string | null
          id?: string
          last_contact_date_date?: number | null
          last_name_text?: string | null
          modified_at?: string | null
          name__full__text?: string | null
          name_text?: string | null
          notes_list?: string[] | null
          opt_in_date_date?: number | null
          opted_in_boolean?: boolean | null
          originating_icl_custom_icl?: string | null
          outcome_option_referral_outcome?: string | null
          phone_call_count_number?: number | null
          phone1_number?: number | null
          program_text?: string | null
          referral_date_date?: number | null
          related_notes_list?: string[] | null
          requested_contact_time_text?: string | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          status_option_status?: string | null
          time_zone_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_contacts_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_contacts_sales_rep"
            columns: ["sales_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      csv_generation_log: {
        Row: {
          campaign: string
          completed_at: string | null
          email_sent_to: string[] | null
          error_message: string | null
          id: string
          lookback_days: number
          metadata: Json | null
          order_count: number
          run_date: string
          started_at: string | null
          status: string
          storage_path: string | null
          storage_url: string | null
        }
        Insert: {
          campaign: string
          completed_at?: string | null
          email_sent_to?: string[] | null
          error_message?: string | null
          id?: string
          lookback_days?: number
          metadata?: Json | null
          order_count?: number
          run_date?: string
          started_at?: string | null
          status?: string
          storage_path?: string | null
          storage_url?: string | null
        }
        Update: {
          campaign?: string
          completed_at?: string | null
          email_sent_to?: string[] | null
          error_message?: string | null
          id?: string
          lookback_days?: number
          metadata?: Json | null
          order_count?: number
          run_date?: string
          started_at?: string | null
          status?: string
          storage_path?: string | null
          storage_url?: string | null
        }
        Relationships: []
      }
      days: {
        Row: {
          bubble_id: string
          created_at: string | null
          created_by: string | null
          date_date: number | null
          date_only1_date: number | null
          id: string
          modified_at: string | null
          related_day: string | null
        }
        Insert: {
          bubble_id: string
          created_at?: string | null
          created_by?: string | null
          date_date?: number | null
          date_only1_date?: number | null
          id?: string
          modified_at?: string | null
          related_day?: string | null
        }
        Update: {
          bubble_id?: string
          created_at?: string | null
          created_by?: string | null
          date_date?: number | null
          date_only1_date?: number | null
          id?: string
          modified_at?: string | null
          related_day?: string | null
        }
        Relationships: []
      }
      floors: {
        Row: {
          bubble_id: string
          building_uuid: string | null
          created_at: string | null
          created_by: string | null
          floor___option_floor: string | null
          id: string
          mdu_uuid: string | null
          modified_at: string | null
          name_text: string | null
          related_building_custom_building: string | null
          related_mdu_custom_mdu: string | null
          related_parent_lead_list: string[] | null
        }
        Insert: {
          bubble_id: string
          building_uuid?: string | null
          created_at?: string | null
          created_by?: string | null
          floor___option_floor?: string | null
          id?: string
          mdu_uuid?: string | null
          modified_at?: string | null
          name_text?: string | null
          related_building_custom_building?: string | null
          related_mdu_custom_mdu?: string | null
          related_parent_lead_list?: string[] | null
        }
        Update: {
          bubble_id?: string
          building_uuid?: string | null
          created_at?: string | null
          created_by?: string | null
          floor___option_floor?: string | null
          id?: string
          mdu_uuid?: string | null
          modified_at?: string | null
          name_text?: string | null
          related_building_custom_building?: string | null
          related_mdu_custom_mdu?: string | null
          related_parent_lead_list?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_floors_building"
            columns: ["building_uuid"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_floors_mdu"
            columns: ["mdu_uuid"]
            isOneToOne: false
            referencedRelation: "mdus"
            referencedColumns: ["id"]
          },
        ]
      }
      icls: {
        Row: {
          bubble_id: string
          ciaa_id_text: string | null
          city_text: string | null
          country_text: string | null
          created_at: string | null
          created_by: string | null
          full_address_geographic_address: Json | null
          icl_code_text: string | null
          icl_name_text: string | null
          icl_owner_name_text: string | null
          icl_user: string | null
          id: string
          latitude_number: number | null
          longitude_number: number | null
          modified_at: string | null
          queueuserid__salesforce__text: string | null
          referral_icls_list: string[] | null
          referral_programs_list: string[] | null
          referral_reps_list: string[] | null
          related_territories_list: string[] | null
          sf_account_id_text: string | null
          state_text: string | null
          status_option_status: string | null
          zip_code_number: number | null
        }
        Insert: {
          bubble_id: string
          ciaa_id_text?: string | null
          city_text?: string | null
          country_text?: string | null
          created_at?: string | null
          created_by?: string | null
          full_address_geographic_address?: Json | null
          icl_code_text?: string | null
          icl_name_text?: string | null
          icl_owner_name_text?: string | null
          icl_user?: string | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          modified_at?: string | null
          queueuserid__salesforce__text?: string | null
          referral_icls_list?: string[] | null
          referral_programs_list?: string[] | null
          referral_reps_list?: string[] | null
          related_territories_list?: string[] | null
          sf_account_id_text?: string | null
          state_text?: string | null
          status_option_status?: string | null
          zip_code_number?: number | null
        }
        Update: {
          bubble_id?: string
          ciaa_id_text?: string | null
          city_text?: string | null
          country_text?: string | null
          created_at?: string | null
          created_by?: string | null
          full_address_geographic_address?: Json | null
          icl_code_text?: string | null
          icl_name_text?: string | null
          icl_owner_name_text?: string | null
          icl_user?: string | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          modified_at?: string | null
          queueuserid__salesforce__text?: string | null
          referral_icls_list?: string[] | null
          referral_programs_list?: string[] | null
          referral_reps_list?: string[] | null
          related_territories_list?: string[] | null
          sf_account_id_text?: string | null
          state_text?: string | null
          status_option_status?: string | null
          zip_code_number?: number | null
        }
        Relationships: []
      }
      lookup_address_types: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_apps: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_calendar_event_types: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_campaigns: {
        Row: {
          campaign_code: string | null
          campaign_industry: string | null
          campaign_status: string | null
          campaign_type: string | null
          campaign_unified_code: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          launch_date: string | null
          salesforce_id: string | null
          sort_order: number | null
          updated_at: string | null
          value: string
        }
        Insert: {
          campaign_code?: string | null
          campaign_industry?: string | null
          campaign_status?: string | null
          campaign_type?: string | null
          campaign_unified_code?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          salesforce_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          value: string
        }
        Update: {
          campaign_code?: string | null
          campaign_industry?: string | null
          campaign_status?: string | null
          campaign_type?: string | null
          campaign_unified_code?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          launch_date?: string | null
          salesforce_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      lookup_current_providers: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_customer_types: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_dm_types: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_interested_products: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_lead_attributes: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_map_icons: {
        Row: {
          created_at: string | null
          display_name: string
          icon_url: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_negative_dispo2: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_negative_dispositions: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_outcomes: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_product_categories: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_rep_functions: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_roles: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_sources: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_stages: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_status: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_territory_status: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lookup_user_status: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          is_active: boolean | null
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          value?: string
        }
        Relationships: []
      }
      lrt_audit_log: {
        Row: {
          changed_at: string
          changed_by: string
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          request_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          request_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lrt_audit_log_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "lrt_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lrt_audit_log_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "lrt_lead_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      lrt_campaigns: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      lrt_dmas: {
        Row: {
          campaign_id: string
          dma_name: string
          id: string
          is_warning: boolean
          market: string | null
          state: string | null
        }
        Insert: {
          campaign_id: string
          dma_name: string
          id?: string
          is_warning?: boolean
          market?: string | null
          state?: string | null
        }
        Update: {
          campaign_id?: string
          dma_name?: string
          id?: string
          is_warning?: boolean
          market?: string | null
          state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lrt_dmas_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "lrt_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      lrt_lead_requests: {
        Row: {
          approved_zip_codes: string | null
          area_type: string
          att_confirmation_number: string | null
          att_response_at: string | null
          att_submitted_at: string | null
          campaign_id: string
          created_at: string
          date_needed_by: string | null
          dealer_code: string | null
          decline_date: string | null
          denied_zip_codes: string | null
          dma: string | null
          form_data: Json
          headcount: number | null
          id: string
          internal_notes: string | null
          is_reserve: boolean
          lead_area_requested: string
          lead_area_requested_2: string | null
          lead_area_requested_3: string | null
          lead_area_requested_4: string | null
          lead_area_requested_5: string | null
          lead_type: string
          notes: string | null
          notes_for_icl: string | null
          office: string | null
          owner_id: string
          sf_visibility_date: string | null
          sla_due_at: string | null
          sla_status: string
          status: string
          submitted_by: string
          submitted_on_behalf: boolean
          updated_at: string
        }
        Insert: {
          approved_zip_codes?: string | null
          area_type: string
          att_confirmation_number?: string | null
          att_response_at?: string | null
          att_submitted_at?: string | null
          campaign_id: string
          created_at?: string
          date_needed_by?: string | null
          dealer_code?: string | null
          decline_date?: string | null
          denied_zip_codes?: string | null
          dma?: string | null
          form_data?: Json
          headcount?: number | null
          id?: string
          internal_notes?: string | null
          is_reserve?: boolean
          lead_area_requested: string
          lead_area_requested_2?: string | null
          lead_area_requested_3?: string | null
          lead_area_requested_4?: string | null
          lead_area_requested_5?: string | null
          lead_type: string
          notes?: string | null
          notes_for_icl?: string | null
          office?: string | null
          owner_id: string
          sf_visibility_date?: string | null
          sla_due_at?: string | null
          sla_status?: string
          status?: string
          submitted_by: string
          submitted_on_behalf?: boolean
          updated_at?: string
        }
        Update: {
          approved_zip_codes?: string | null
          area_type?: string
          att_confirmation_number?: string | null
          att_response_at?: string | null
          att_submitted_at?: string | null
          campaign_id?: string
          created_at?: string
          date_needed_by?: string | null
          dealer_code?: string | null
          decline_date?: string | null
          denied_zip_codes?: string | null
          dma?: string | null
          form_data?: Json
          headcount?: number | null
          id?: string
          internal_notes?: string | null
          is_reserve?: boolean
          lead_area_requested?: string
          lead_area_requested_2?: string | null
          lead_area_requested_3?: string | null
          lead_area_requested_4?: string | null
          lead_area_requested_5?: string | null
          lead_type?: string
          notes?: string | null
          notes_for_icl?: string | null
          office?: string | null
          owner_id?: string
          sf_visibility_date?: string | null
          sla_due_at?: string | null
          sla_status?: string
          status?: string
          submitted_by?: string
          submitted_on_behalf?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lrt_lead_requests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "lrt_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lrt_lead_requests_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "lrt_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lrt_lead_requests_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "lrt_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lrt_no_coverage_zips: {
        Row: {
          campaign_id: string
          city: string | null
          id: string
          state: string | null
          zip_code: string
        }
        Insert: {
          campaign_id: string
          city?: string | null
          id?: string
          state?: string | null
          zip_code: string
        }
        Update: {
          campaign_id?: string
          city?: string | null
          id?: string
          state?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "lrt_no_coverage_zips_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "lrt_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      lrt_profiles: {
        Row: {
          auth_user_id: string | null
          created_at: string
          dealer_code: string | null
          email: string
          full_name: string | null
          icl_unified_code: string | null
          id: string
          is_active: boolean
          legal_corp_name: string | null
          office_name: string | null
          phone: string | null
          role: string
          sf_contact_id: string | null
          sf_synced_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          dealer_code?: string | null
          email: string
          full_name?: string | null
          icl_unified_code?: string | null
          id?: string
          is_active?: boolean
          legal_corp_name?: string | null
          office_name?: string | null
          phone?: string | null
          role: string
          sf_contact_id?: string | null
          sf_synced_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          dealer_code?: string | null
          email?: string
          full_name?: string | null
          icl_unified_code?: string | null
          id?: string
          is_active?: boolean
          legal_corp_name?: string | null
          office_name?: string | null
          phone?: string | null
          role?: string
          sf_contact_id?: string | null
          sf_synced_at?: string | null
        }
        Relationships: []
      }
      lrt_sla_configs: {
        Row: {
          campaign_id: string
          id: string
          lead_type: string
          sla_hours: number
          updated_at: string
          updated_by: string | null
          warning_hours: number
        }
        Insert: {
          campaign_id: string
          id?: string
          lead_type: string
          sla_hours: number
          updated_at?: string
          updated_by?: string | null
          warning_hours: number
        }
        Update: {
          campaign_id?: string
          id?: string
          lead_type?: string
          sla_hours?: number
          updated_at?: string
          updated_by?: string | null
          warning_hours?: number
        }
        Relationships: [
          {
            foreignKeyName: "lrt_sla_configs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "lrt_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lrt_sla_configs_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "lrt_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lrt_user_campaigns: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lrt_user_campaigns_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "lrt_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lrt_user_campaigns_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "lrt_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mdus: {
        Row: {
          bubble_id: string
          bulk_processed_boolean: boolean | null
          city_text: string | null
          complex_name_text: string | null
          contact_name_text: string | null
          created_at: string | null
          created_by: string | null
          created_method_text: string | null
          full_address_text_text: string | null
          id: string
          latitude_number: number | null
          longitude_number: number | null
          modified_at: string | null
          property_type_option_property_type: string | null
          related_buildings_list: string[] | null
          related_floors_list: string[] | null
          related_parent_leads_list: string[] | null
          related_territory_custom_territory: string | null
          state_province_text: string | null
          status_option_status: string | null
          street___text: string | null
          street_name_text: string | null
          territory_uuid: string | null
          zip_postal_code_text: string | null
        }
        Insert: {
          bubble_id: string
          bulk_processed_boolean?: boolean | null
          city_text?: string | null
          complex_name_text?: string | null
          contact_name_text?: string | null
          created_at?: string | null
          created_by?: string | null
          created_method_text?: string | null
          full_address_text_text?: string | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          modified_at?: string | null
          property_type_option_property_type?: string | null
          related_buildings_list?: string[] | null
          related_floors_list?: string[] | null
          related_parent_leads_list?: string[] | null
          related_territory_custom_territory?: string | null
          state_province_text?: string | null
          status_option_status?: string | null
          street___text?: string | null
          street_name_text?: string | null
          territory_uuid?: string | null
          zip_postal_code_text?: string | null
        }
        Update: {
          bubble_id?: string
          bulk_processed_boolean?: boolean | null
          city_text?: string | null
          complex_name_text?: string | null
          contact_name_text?: string | null
          created_at?: string | null
          created_by?: string | null
          created_method_text?: string | null
          full_address_text_text?: string | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          modified_at?: string | null
          property_type_option_property_type?: string | null
          related_buildings_list?: string[] | null
          related_floors_list?: string[] | null
          related_parent_leads_list?: string[] | null
          related_territory_custom_territory?: string | null
          state_province_text?: string | null
          status_option_status?: string | null
          street___text?: string | null
          street_name_text?: string | null
          territory_uuid?: string | null
          zip_postal_code_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_mdus_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_runs: {
        Row: {
          bubble_table: string
          completed_at: string | null
          duration_seconds: number | null
          error_message: string | null
          id: string
          rows_migrated: number | null
          started_at: string | null
          status: string | null
          table_name: string
        }
        Insert: {
          bubble_table: string
          completed_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          rows_migrated?: number | null
          started_at?: string | null
          status?: string | null
          table_name: string
        }
        Update: {
          bubble_table?: string
          completed_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          rows_migrated?: number | null
          started_at?: string | null
          status?: string | null
          table_name?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          bubble_id: string
          child_lead_uuid: string | null
          contact_uuid: string | null
          content_text: string | null
          created_at: string | null
          created_by: string | null
          created_by__text__text: string | null
          id: string
          modified_at: string | null
          order_id_text: string | null
          order_uuid: string | null
          parent_lead_uuid: string | null
          photo_file: string | null
          photo_image: string | null
          related_child_lead_custom_child_lead: string | null
          related_order_custom_orders: string | null
          related_parent_lead_custom_parent_lead: string | null
          related_referral_custom_contact: string | null
          related_sales_agent_statistic_custom_sales_agent_statistics:
            | string
            | null
          related_territory_custom_territory: string | null
          row_id_text: string | null
          seen_by_list: string[] | null
          seen_by_text: string[] | null
          status_option_status: string | null
          territory_uuid: string | null
          title_text: string | null
        }
        Insert: {
          bubble_id: string
          child_lead_uuid?: string | null
          contact_uuid?: string | null
          content_text?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by__text__text?: string | null
          id?: string
          modified_at?: string | null
          order_id_text?: string | null
          order_uuid?: string | null
          parent_lead_uuid?: string | null
          photo_file?: string | null
          photo_image?: string | null
          related_child_lead_custom_child_lead?: string | null
          related_order_custom_orders?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          related_referral_custom_contact?: string | null
          related_sales_agent_statistic_custom_sales_agent_statistics?:
            | string
            | null
          related_territory_custom_territory?: string | null
          row_id_text?: string | null
          seen_by_list?: string[] | null
          seen_by_text?: string[] | null
          status_option_status?: string | null
          territory_uuid?: string | null
          title_text?: string | null
        }
        Update: {
          bubble_id?: string
          child_lead_uuid?: string | null
          contact_uuid?: string | null
          content_text?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by__text__text?: string | null
          id?: string
          modified_at?: string | null
          order_id_text?: string | null
          order_uuid?: string | null
          parent_lead_uuid?: string | null
          photo_file?: string | null
          photo_image?: string | null
          related_child_lead_custom_child_lead?: string | null
          related_order_custom_orders?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          related_referral_custom_contact?: string | null
          related_sales_agent_statistic_custom_sales_agent_statistics?:
            | string
            | null
          related_territory_custom_territory?: string | null
          row_id_text?: string | null
          seen_by_list?: string[] | null
          seen_by_text?: string[] | null
          status_option_status?: string | null
          territory_uuid?: string | null
          title_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_notes_child_lead"
            columns: ["child_lead_uuid"]
            isOneToOne: false
            referencedRelation: "child_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notes_contact"
            columns: ["contact_uuid"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notes_order"
            columns: ["order_uuid"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notes_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notes_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          account_id_text: string | null
          ai_challenge___accepted_boolean: boolean | null
          ai_challenge_text: string | null
          ai_notes_feedback_text: string | null
          ai_review_initialized_date: number | null
          ai_shell_boolean: boolean | null
          api_response_text: string | null
          appointment_booked_by_user: string | null
          assigned_icl_custom_icl: string | null
          assigned_icl_uuid: string | null
          assigned_rep_user: string | null
          assigned_rep_uuid: string | null
          attachment_image: string | null
          backend_notes_text: string | null
          billing_address_geographic_address: Json | null
          btn_number: number | null
          bubble_id: string
          business_name_text: string | null
          campaign_assignment_uuid: string | null
          campaign_option_campaigns: string | null
          cc_request_number: number | null
          change_log_list_text: string[] | null
          child_lead_id_custom_child_lead: string | null
          child_lead_uuid: string | null
          city_text: string | null
          contains_ars_text: string | null
          created_at: string | null
          created_by: string | null
          credit_class_text: string | null
          credit_requests_list: number[] | null
          customer_first_name_text: string | null
          customer_last_name_text: string | null
          customer_survey_link_text: string | null
          customer_type_option_customer_type: string | null
          customer_type_text: string | null
          data_layer_text: string | null
          date_cancelled_date: number | null
          display_name_text: string | null
          dwelling_type_text: string | null
          email_text: string | null
          equipment_financed_boolean: boolean | null
          existing_product_text: string | null
          external_account_number_text: string | null
          external_id_text: string | null
          external_product_code_text: string | null
          external_product_name_text: string | null
          external_secondary_order_id_text: string | null
          external_uid_text: string | null
          external_wireless_order_id_text: string | null
          full_address_geographic_address: Json | null
          icl_custom_icl: string | null
          icl_uuid: string | null
          id: string
          install_date_date: number | null
          installation_date_date: number | null
          json_response_text: string | null
          last_salesforce_sync_date: number | null
          line_ported_boolean: boolean | null
          loyalty_program_text: string | null
          modified_at: string | null
          mtn_text: string | null
          number_of_lines_number: number | null
          opt_in_boolean: boolean | null
          order_attribute__text: string | null
          order_attribute_2_text: string | null
          order_attribute_3_text: string | null
          order_attribute_4_text: string | null
          order_attribute_5_text: string | null
          order_custom_orders: string | null
          order_id_text: string | null
          order_lookup_id_text: string | null
          order_reference_number_text: string | null
          order_type_text: string | null
          originating_order_custom_orders: string | null
          originating_order_date_date: number | null
          originating_rep_user: string | null
          originating_rep_uuid: string | null
          package_info_text: string | null
          parent_lead_custom_parent_lead: string | null
          parent_lead_id_custom_parent_lead: string | null
          parent_lead_uuid: string | null
          periodic_usage_number: number | null
          phone_number__cbr__number: number | null
          phone_number_text: string | null
          prepaid_text: string | null
          product_1_text: string | null
          product_2_text: string | null
          product_3_text: string | null
          product_attribute_1_text: string | null
          product_attribute_2_text: string | null
          product_plan_name_text: string | null
          program_record_custom_program_record: string | null
          program_record_uuid: string | null
          psu_sold_number: number | null
          quantity_number: number | null
          queueuserid__salesforce__text: string | null
          related_aci_list_custom_aci_v2: string[] | null
          related_campaign_assignment_custom_campaign_assignment: string | null
          related_campaign_order_config: string | null
          related_notes_list_custom_notes: string[] | null
          related_products_list_custom_product: string[] | null
          related_program_record_custom_program_record: string | null
          related_retail_stores_custom_retail_stores: string | null
          related_survey_custom_surveys: string | null
          rep_campaign_assignment_custom_campaign_assignment: string | null
          retail_store_uuid: string | null
          row_id__glide__text: string | null
          row_id_text: string | null
          sales_date_date: number | null
          sales_rep_user: string | null
          sales_rep_uuid: string | null
          salesforce_external_reference_number_text: string | null
          salesforce_id_text: string | null
          secondary_order_id_1_text: string | null
          secondary_order_id_2_text: string | null
          secondary_order_id_3_text: string | null
          secondary_order_id_4_text: string | null
          source_option_apps: string | null
          source_option_source: string | null
          state_text: string | null
          status_option_status: string | null
          survey_id_text: string | null
          survey_link_text: string | null
          survey_qr_image: string | null
          survey_rating_number: number | null
          survey_uuid: string | null
          territory_custom_territory: string | null
          territory_id_custom_territory: string | null
          territory_uuid: string | null
          tier_level_text: string | null
          valid_email_text: string | null
          validate_email_response_text: string | null
          verification_type_text: string | null
          wireless_ban_text: string | null
          zip_code_number: number | null
        }
        Insert: {
          account_id_text?: string | null
          ai_challenge___accepted_boolean?: boolean | null
          ai_challenge_text?: string | null
          ai_notes_feedback_text?: string | null
          ai_review_initialized_date?: number | null
          ai_shell_boolean?: boolean | null
          api_response_text?: string | null
          appointment_booked_by_user?: string | null
          assigned_icl_custom_icl?: string | null
          assigned_icl_uuid?: string | null
          assigned_rep_user?: string | null
          assigned_rep_uuid?: string | null
          attachment_image?: string | null
          backend_notes_text?: string | null
          billing_address_geographic_address?: Json | null
          btn_number?: number | null
          bubble_id: string
          business_name_text?: string | null
          campaign_assignment_uuid?: string | null
          campaign_option_campaigns?: string | null
          cc_request_number?: number | null
          change_log_list_text?: string[] | null
          child_lead_id_custom_child_lead?: string | null
          child_lead_uuid?: string | null
          city_text?: string | null
          contains_ars_text?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_class_text?: string | null
          credit_requests_list?: number[] | null
          customer_first_name_text?: string | null
          customer_last_name_text?: string | null
          customer_survey_link_text?: string | null
          customer_type_option_customer_type?: string | null
          customer_type_text?: string | null
          data_layer_text?: string | null
          date_cancelled_date?: number | null
          display_name_text?: string | null
          dwelling_type_text?: string | null
          email_text?: string | null
          equipment_financed_boolean?: boolean | null
          existing_product_text?: string | null
          external_account_number_text?: string | null
          external_id_text?: string | null
          external_product_code_text?: string | null
          external_product_name_text?: string | null
          external_secondary_order_id_text?: string | null
          external_uid_text?: string | null
          external_wireless_order_id_text?: string | null
          full_address_geographic_address?: Json | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          install_date_date?: number | null
          installation_date_date?: number | null
          json_response_text?: string | null
          last_salesforce_sync_date?: number | null
          line_ported_boolean?: boolean | null
          loyalty_program_text?: string | null
          modified_at?: string | null
          mtn_text?: string | null
          number_of_lines_number?: number | null
          opt_in_boolean?: boolean | null
          order_attribute__text?: string | null
          order_attribute_2_text?: string | null
          order_attribute_3_text?: string | null
          order_attribute_4_text?: string | null
          order_attribute_5_text?: string | null
          order_custom_orders?: string | null
          order_id_text?: string | null
          order_lookup_id_text?: string | null
          order_reference_number_text?: string | null
          order_type_text?: string | null
          originating_order_custom_orders?: string | null
          originating_order_date_date?: number | null
          originating_rep_user?: string | null
          originating_rep_uuid?: string | null
          package_info_text?: string | null
          parent_lead_custom_parent_lead?: string | null
          parent_lead_id_custom_parent_lead?: string | null
          parent_lead_uuid?: string | null
          periodic_usage_number?: number | null
          phone_number__cbr__number?: number | null
          phone_number_text?: string | null
          prepaid_text?: string | null
          product_1_text?: string | null
          product_2_text?: string | null
          product_3_text?: string | null
          product_attribute_1_text?: string | null
          product_attribute_2_text?: string | null
          product_plan_name_text?: string | null
          program_record_custom_program_record?: string | null
          program_record_uuid?: string | null
          psu_sold_number?: number | null
          quantity_number?: number | null
          queueuserid__salesforce__text?: string | null
          related_aci_list_custom_aci_v2?: string[] | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_campaign_order_config?: string | null
          related_notes_list_custom_notes?: string[] | null
          related_products_list_custom_product?: string[] | null
          related_program_record_custom_program_record?: string | null
          related_retail_stores_custom_retail_stores?: string | null
          related_survey_custom_surveys?: string | null
          rep_campaign_assignment_custom_campaign_assignment?: string | null
          retail_store_uuid?: string | null
          row_id__glide__text?: string | null
          row_id_text?: string | null
          sales_date_date?: number | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          salesforce_external_reference_number_text?: string | null
          salesforce_id_text?: string | null
          secondary_order_id_1_text?: string | null
          secondary_order_id_2_text?: string | null
          secondary_order_id_3_text?: string | null
          secondary_order_id_4_text?: string | null
          source_option_apps?: string | null
          source_option_source?: string | null
          state_text?: string | null
          status_option_status?: string | null
          survey_id_text?: string | null
          survey_link_text?: string | null
          survey_qr_image?: string | null
          survey_rating_number?: number | null
          survey_uuid?: string | null
          territory_custom_territory?: string | null
          territory_id_custom_territory?: string | null
          territory_uuid?: string | null
          tier_level_text?: string | null
          valid_email_text?: string | null
          validate_email_response_text?: string | null
          verification_type_text?: string | null
          wireless_ban_text?: string | null
          zip_code_number?: number | null
        }
        Update: {
          account_id_text?: string | null
          ai_challenge___accepted_boolean?: boolean | null
          ai_challenge_text?: string | null
          ai_notes_feedback_text?: string | null
          ai_review_initialized_date?: number | null
          ai_shell_boolean?: boolean | null
          api_response_text?: string | null
          appointment_booked_by_user?: string | null
          assigned_icl_custom_icl?: string | null
          assigned_icl_uuid?: string | null
          assigned_rep_user?: string | null
          assigned_rep_uuid?: string | null
          attachment_image?: string | null
          backend_notes_text?: string | null
          billing_address_geographic_address?: Json | null
          btn_number?: number | null
          bubble_id?: string
          business_name_text?: string | null
          campaign_assignment_uuid?: string | null
          campaign_option_campaigns?: string | null
          cc_request_number?: number | null
          change_log_list_text?: string[] | null
          child_lead_id_custom_child_lead?: string | null
          child_lead_uuid?: string | null
          city_text?: string | null
          contains_ars_text?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_class_text?: string | null
          credit_requests_list?: number[] | null
          customer_first_name_text?: string | null
          customer_last_name_text?: string | null
          customer_survey_link_text?: string | null
          customer_type_option_customer_type?: string | null
          customer_type_text?: string | null
          data_layer_text?: string | null
          date_cancelled_date?: number | null
          display_name_text?: string | null
          dwelling_type_text?: string | null
          email_text?: string | null
          equipment_financed_boolean?: boolean | null
          existing_product_text?: string | null
          external_account_number_text?: string | null
          external_id_text?: string | null
          external_product_code_text?: string | null
          external_product_name_text?: string | null
          external_secondary_order_id_text?: string | null
          external_uid_text?: string | null
          external_wireless_order_id_text?: string | null
          full_address_geographic_address?: Json | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          install_date_date?: number | null
          installation_date_date?: number | null
          json_response_text?: string | null
          last_salesforce_sync_date?: number | null
          line_ported_boolean?: boolean | null
          loyalty_program_text?: string | null
          modified_at?: string | null
          mtn_text?: string | null
          number_of_lines_number?: number | null
          opt_in_boolean?: boolean | null
          order_attribute__text?: string | null
          order_attribute_2_text?: string | null
          order_attribute_3_text?: string | null
          order_attribute_4_text?: string | null
          order_attribute_5_text?: string | null
          order_custom_orders?: string | null
          order_id_text?: string | null
          order_lookup_id_text?: string | null
          order_reference_number_text?: string | null
          order_type_text?: string | null
          originating_order_custom_orders?: string | null
          originating_order_date_date?: number | null
          originating_rep_user?: string | null
          originating_rep_uuid?: string | null
          package_info_text?: string | null
          parent_lead_custom_parent_lead?: string | null
          parent_lead_id_custom_parent_lead?: string | null
          parent_lead_uuid?: string | null
          periodic_usage_number?: number | null
          phone_number__cbr__number?: number | null
          phone_number_text?: string | null
          prepaid_text?: string | null
          product_1_text?: string | null
          product_2_text?: string | null
          product_3_text?: string | null
          product_attribute_1_text?: string | null
          product_attribute_2_text?: string | null
          product_plan_name_text?: string | null
          program_record_custom_program_record?: string | null
          program_record_uuid?: string | null
          psu_sold_number?: number | null
          quantity_number?: number | null
          queueuserid__salesforce__text?: string | null
          related_aci_list_custom_aci_v2?: string[] | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_campaign_order_config?: string | null
          related_notes_list_custom_notes?: string[] | null
          related_products_list_custom_product?: string[] | null
          related_program_record_custom_program_record?: string | null
          related_retail_stores_custom_retail_stores?: string | null
          related_survey_custom_surveys?: string | null
          rep_campaign_assignment_custom_campaign_assignment?: string | null
          retail_store_uuid?: string | null
          row_id__glide__text?: string | null
          row_id_text?: string | null
          sales_date_date?: number | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          salesforce_external_reference_number_text?: string | null
          salesforce_id_text?: string | null
          secondary_order_id_1_text?: string | null
          secondary_order_id_2_text?: string | null
          secondary_order_id_3_text?: string | null
          secondary_order_id_4_text?: string | null
          source_option_apps?: string | null
          source_option_source?: string | null
          state_text?: string | null
          status_option_status?: string | null
          survey_id_text?: string | null
          survey_link_text?: string | null
          survey_qr_image?: string | null
          survey_rating_number?: number | null
          survey_uuid?: string | null
          territory_custom_territory?: string | null
          territory_id_custom_territory?: string | null
          territory_uuid?: string | null
          tier_level_text?: string | null
          valid_email_text?: string | null
          validate_email_response_text?: string | null
          verification_type_text?: string | null
          wireless_ban_text?: string | null
          zip_code_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_assigned_rep"
            columns: ["assigned_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_campaign_assignment"
            columns: ["campaign_assignment_uuid"]
            isOneToOne: false
            referencedRelation: "campaign_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_child_lead"
            columns: ["child_lead_uuid"]
            isOneToOne: false
            referencedRelation: "child_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_retail_store"
            columns: ["retail_store_uuid"]
            isOneToOne: false
            referencedRelation: "retail_stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_sales_rep"
            columns: ["sales_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_survey"
            columns: ["survey_uuid"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_leads: {
        Row: {
          activity_dates_list_date: number[] | null
          address_line_2_text: string | null
          address_type_option_address_type: string | null
          address_type_option_address_type0: string | null
          address_type_text: string | null
          ai_summary_of_business_text: string | null
          ai_summary_text: string | null
          appointment_date_date: number | null
          assigned_rep_uuid: string | null
          assigned_rep1_user: string | null
          bubble_id: string
          building_number_name_text: string | null
          building_uuid: string | null
          business_hours_text: string | null
          business_type__manual__text: string | null
          business_types_list_text: string[] | null
          child_leads_list_custom_child_lead: string[] | null
          city_text: string | null
          country_text: string | null
          created_at: string | null
          created_by: string | null
          created_method_text: string | null
          decision_maker_text: string | null
          default_icon__never_update__image: string | null
          dm_email_text: string | null
          dm_phone_text: string | null
          edit_calendar_boolean: boolean | null
          employee_count_number: number | null
          external_unified_id_text: string | null
          floor_uuid: string | null
          full_address__text__text: string | null
          full_address_geographic_address: Json | null
          furthest_stage_option_stage: string | null
          gatekeeper_name_text: string | null
          google_place_id_text: string | null
          google_places_business_status_text: string | null
          icl_code__glide__text: string | null
          icl_custom_icl: string | null
          icl_uuid: string | null
          icon_image: string | null
          id: string
          last_activity_date: number | null
          latitude_number: number | null
          lead_attributes_list_option_lead_attributes: string[] | null
          lead_source_text: string | null
          longitude_number: number | null
          loop_count__all_time__number: number | null
          loop_count_number: number | null
          loop_list_date: number[] | null
          manager_approval_boolean: boolean | null
          map_pin_option_map_icons: string | null
          mdu_uuid: string | null
          mighty_link_text: string | null
          modified_at: string | null
          name_text: string | null
          notes_text: string | null
          permenentaly_closed__boolean: boolean | null
          raw_google_data_text: string | null
          related_aci_list_custom_aci_v2: string[] | null
          related_building_custom_building: string | null
          related_calendar_events_list_custom_calendar_event: string[] | null
          related_floor_custom_floor: string | null
          related_mdu_custom_mdu: string | null
          related_notes_list_custom_notes: string[] | null
          related_orders_list_custom_orders: string[] | null
          related_program_records_list_custom_program_record: string[] | null
          related_route_stops_list_custom_route_stop: string[] | null
          reloop_date1_date: number | null
          route_order_list_text: string[] | null
          route_order_temp_number: number | null
          routes_lead_is_in_list_custom_route: string[] | null
          routestopuid_number: number | null
          row_id_text: string | null
          standardization_address_type_text: string | null
          standardization_quality_text: string | null
          standardization_response_list_text: string[] | null
          state_text: string | null
          status_option_status: string | null
          street___number: number | null
          street_name_text: string | null
          territory_id__glide__text: string | null
          territory_id_custom_territory: string | null
          territory_uuid: string | null
          territory1_custom_territory: string | null
          zip_code__text__text: string | null
          zip_code_number: number | null
        }
        Insert: {
          activity_dates_list_date?: number[] | null
          address_line_2_text?: string | null
          address_type_option_address_type?: string | null
          address_type_option_address_type0?: string | null
          address_type_text?: string | null
          ai_summary_of_business_text?: string | null
          ai_summary_text?: string | null
          appointment_date_date?: number | null
          assigned_rep_uuid?: string | null
          assigned_rep1_user?: string | null
          bubble_id: string
          building_number_name_text?: string | null
          building_uuid?: string | null
          business_hours_text?: string | null
          business_type__manual__text?: string | null
          business_types_list_text?: string[] | null
          child_leads_list_custom_child_lead?: string[] | null
          city_text?: string | null
          country_text?: string | null
          created_at?: string | null
          created_by?: string | null
          created_method_text?: string | null
          decision_maker_text?: string | null
          default_icon__never_update__image?: string | null
          dm_email_text?: string | null
          dm_phone_text?: string | null
          edit_calendar_boolean?: boolean | null
          employee_count_number?: number | null
          external_unified_id_text?: string | null
          floor_uuid?: string | null
          full_address__text__text?: string | null
          full_address_geographic_address?: Json | null
          furthest_stage_option_stage?: string | null
          gatekeeper_name_text?: string | null
          google_place_id_text?: string | null
          google_places_business_status_text?: string | null
          icl_code__glide__text?: string | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          icon_image?: string | null
          id?: string
          last_activity_date?: number | null
          latitude_number?: number | null
          lead_attributes_list_option_lead_attributes?: string[] | null
          lead_source_text?: string | null
          longitude_number?: number | null
          loop_count__all_time__number?: number | null
          loop_count_number?: number | null
          loop_list_date?: number[] | null
          manager_approval_boolean?: boolean | null
          map_pin_option_map_icons?: string | null
          mdu_uuid?: string | null
          mighty_link_text?: string | null
          modified_at?: string | null
          name_text?: string | null
          notes_text?: string | null
          permenentaly_closed__boolean?: boolean | null
          raw_google_data_text?: string | null
          related_aci_list_custom_aci_v2?: string[] | null
          related_building_custom_building?: string | null
          related_calendar_events_list_custom_calendar_event?: string[] | null
          related_floor_custom_floor?: string | null
          related_mdu_custom_mdu?: string | null
          related_notes_list_custom_notes?: string[] | null
          related_orders_list_custom_orders?: string[] | null
          related_program_records_list_custom_program_record?: string[] | null
          related_route_stops_list_custom_route_stop?: string[] | null
          reloop_date1_date?: number | null
          route_order_list_text?: string[] | null
          route_order_temp_number?: number | null
          routes_lead_is_in_list_custom_route?: string[] | null
          routestopuid_number?: number | null
          row_id_text?: string | null
          standardization_address_type_text?: string | null
          standardization_quality_text?: string | null
          standardization_response_list_text?: string[] | null
          state_text?: string | null
          status_option_status?: string | null
          street___number?: number | null
          street_name_text?: string | null
          territory_id__glide__text?: string | null
          territory_id_custom_territory?: string | null
          territory_uuid?: string | null
          territory1_custom_territory?: string | null
          zip_code__text__text?: string | null
          zip_code_number?: number | null
        }
        Update: {
          activity_dates_list_date?: number[] | null
          address_line_2_text?: string | null
          address_type_option_address_type?: string | null
          address_type_option_address_type0?: string | null
          address_type_text?: string | null
          ai_summary_of_business_text?: string | null
          ai_summary_text?: string | null
          appointment_date_date?: number | null
          assigned_rep_uuid?: string | null
          assigned_rep1_user?: string | null
          bubble_id?: string
          building_number_name_text?: string | null
          building_uuid?: string | null
          business_hours_text?: string | null
          business_type__manual__text?: string | null
          business_types_list_text?: string[] | null
          child_leads_list_custom_child_lead?: string[] | null
          city_text?: string | null
          country_text?: string | null
          created_at?: string | null
          created_by?: string | null
          created_method_text?: string | null
          decision_maker_text?: string | null
          default_icon__never_update__image?: string | null
          dm_email_text?: string | null
          dm_phone_text?: string | null
          edit_calendar_boolean?: boolean | null
          employee_count_number?: number | null
          external_unified_id_text?: string | null
          floor_uuid?: string | null
          full_address__text__text?: string | null
          full_address_geographic_address?: Json | null
          furthest_stage_option_stage?: string | null
          gatekeeper_name_text?: string | null
          google_place_id_text?: string | null
          google_places_business_status_text?: string | null
          icl_code__glide__text?: string | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          icon_image?: string | null
          id?: string
          last_activity_date?: number | null
          latitude_number?: number | null
          lead_attributes_list_option_lead_attributes?: string[] | null
          lead_source_text?: string | null
          longitude_number?: number | null
          loop_count__all_time__number?: number | null
          loop_count_number?: number | null
          loop_list_date?: number[] | null
          manager_approval_boolean?: boolean | null
          map_pin_option_map_icons?: string | null
          mdu_uuid?: string | null
          mighty_link_text?: string | null
          modified_at?: string | null
          name_text?: string | null
          notes_text?: string | null
          permenentaly_closed__boolean?: boolean | null
          raw_google_data_text?: string | null
          related_aci_list_custom_aci_v2?: string[] | null
          related_building_custom_building?: string | null
          related_calendar_events_list_custom_calendar_event?: string[] | null
          related_floor_custom_floor?: string | null
          related_mdu_custom_mdu?: string | null
          related_notes_list_custom_notes?: string[] | null
          related_orders_list_custom_orders?: string[] | null
          related_program_records_list_custom_program_record?: string[] | null
          related_route_stops_list_custom_route_stop?: string[] | null
          reloop_date1_date?: number | null
          route_order_list_text?: string[] | null
          route_order_temp_number?: number | null
          routes_lead_is_in_list_custom_route?: string[] | null
          routestopuid_number?: number | null
          row_id_text?: string | null
          standardization_address_type_text?: string | null
          standardization_quality_text?: string | null
          standardization_response_list_text?: string[] | null
          state_text?: string | null
          status_option_status?: string | null
          street___number?: number | null
          street_name_text?: string | null
          territory_id__glide__text?: string | null
          territory_id_custom_territory?: string | null
          territory_uuid?: string | null
          territory1_custom_territory?: string | null
          zip_code__text__text?: string | null
          zip_code_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pl_assigned_rep"
            columns: ["assigned_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pl_building"
            columns: ["building_uuid"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pl_floor"
            columns: ["floor_uuid"]
            isOneToOne: false
            referencedRelation: "floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pl_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pl_mdu"
            columns: ["mdu_uuid"]
            isOneToOne: false
            referencedRelation: "mdus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pl_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
        ]
      }
      postal_codes: {
        Row: {
          bbox: unknown
          centroid: unknown
          country: string | null
          geom: unknown
          lead_count: number | null
          postal_code: string
          state: string | null
        }
        Insert: {
          bbox?: unknown
          centroid?: unknown
          country?: string | null
          geom?: unknown
          lead_count?: number | null
          postal_code: string
          state?: string | null
        }
        Update: {
          bbox?: unknown
          centroid?: unknown
          country?: string | null
          geom?: unknown
          lead_count?: number | null
          postal_code?: string
          state?: string | null
        }
        Relationships: []
      }
      product_catalog: {
        Row: {
          bubble_id: string
          campaign_info_uuid: string | null
          campaign_option_campaigns: string | null
          created_at: string | null
          created_by: string | null
          external_product_code_text: string | null
          generic_product_name_option: string | null
          id: string
          modified_at: string | null
          product_attribute1_label_text: string | null
          product_attribute2_label_text: string | null
          product_catalog_status_option: string | null
          product_category_uuid: string | null
          product_category1_custom_product_category: string | null
          product_config: Json | null
          product_input_show_boolean: boolean | null
          product_name_text: string | null
          related_order_config_custom_campaign_info: string | null
          sf_id_text: string | null
        }
        Insert: {
          bubble_id: string
          campaign_info_uuid?: string | null
          campaign_option_campaigns?: string | null
          created_at?: string | null
          created_by?: string | null
          external_product_code_text?: string | null
          generic_product_name_option?: string | null
          id?: string
          modified_at?: string | null
          product_attribute1_label_text?: string | null
          product_attribute2_label_text?: string | null
          product_catalog_status_option?: string | null
          product_category_uuid?: string | null
          product_category1_custom_product_category?: string | null
          product_config?: Json | null
          product_input_show_boolean?: boolean | null
          product_name_text?: string | null
          related_order_config_custom_campaign_info?: string | null
          sf_id_text?: string | null
        }
        Update: {
          bubble_id?: string
          campaign_info_uuid?: string | null
          campaign_option_campaigns?: string | null
          created_at?: string | null
          created_by?: string | null
          external_product_code_text?: string | null
          generic_product_name_option?: string | null
          id?: string
          modified_at?: string | null
          product_attribute1_label_text?: string | null
          product_attribute2_label_text?: string | null
          product_catalog_status_option?: string | null
          product_category_uuid?: string | null
          product_category1_custom_product_category?: string | null
          product_config?: Json | null
          product_input_show_boolean?: boolean | null
          product_name_text?: string | null
          related_order_config_custom_campaign_info?: string | null
          sf_id_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pc_campaign_info"
            columns: ["campaign_info_uuid"]
            isOneToOne: false
            referencedRelation: "campaign_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pc_category"
            columns: ["product_category_uuid"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          bubble_id: string
          campaign_option_campaigns: string | null
          category_icon_image: string | null
          category_text: string | null
          created_at: string | null
          created_by: string | null
          financed_equipment_required_boolean: boolean | null
          id: string
          modified_at: string | null
          mtn_max_length_number: number | null
          mtn_required_boolean: boolean | null
          port_required_boolean: boolean | null
          prevent_duplicate_products__same_boolean: boolean | null
          prevent_duplicate_products_boolean: boolean | null
          related_products_list: string[] | null
        }
        Insert: {
          bubble_id: string
          campaign_option_campaigns?: string | null
          category_icon_image?: string | null
          category_text?: string | null
          created_at?: string | null
          created_by?: string | null
          financed_equipment_required_boolean?: boolean | null
          id?: string
          modified_at?: string | null
          mtn_max_length_number?: number | null
          mtn_required_boolean?: boolean | null
          port_required_boolean?: boolean | null
          prevent_duplicate_products__same_boolean?: boolean | null
          prevent_duplicate_products_boolean?: boolean | null
          related_products_list?: string[] | null
        }
        Update: {
          bubble_id?: string
          campaign_option_campaigns?: string | null
          category_icon_image?: string | null
          category_text?: string | null
          created_at?: string | null
          created_by?: string | null
          financed_equipment_required_boolean?: boolean | null
          id?: string
          modified_at?: string | null
          mtn_max_length_number?: number | null
          mtn_required_boolean?: boolean | null
          port_required_boolean?: boolean | null
          prevent_duplicate_products__same_boolean?: boolean | null
          prevent_duplicate_products_boolean?: boolean | null
          related_products_list?: string[] | null
        }
        Relationships: []
      }
      products: {
        Row: {
          bubble_id: string
          child_lead_uuid: string | null
          created_at: string | null
          created_by: string | null
          current_provider_list_option_current_providers: string[] | null
          current_providers_list_option_current_providers: string[] | null
          display_name_text: string | null
          existing_product_text: string | null
          external_product_code_text: string | null
          external_product_name_text: string | null
          id: string
          interested_products_list_option_interested_products: string[] | null
          modified_at: string | null
          order_uuid: string | null
          parent_lead_uuid: string | null
          periodic_usage_number: number | null
          primary_language_text: string | null
          product_1_text: string | null
          product_2_text: string | null
          product_3_text: string | null
          product_attribute_1_text: string | null
          product_attribute_2_text: string | null
          product_plan_name_text: string | null
          psu_sold_number: number | null
          quantity_number: number | null
          related_child_lead_custom_child_lead: string | null
          related_order_custom_orders: string | null
          related_parent_lead_custom_parent_lead: string | null
          related_product_custom_product_catalog: string | null
          row_id_text: string | null
          term_of_contract_number: number | null
          term_option_terms: string | null
        }
        Insert: {
          bubble_id: string
          child_lead_uuid?: string | null
          created_at?: string | null
          created_by?: string | null
          current_provider_list_option_current_providers?: string[] | null
          current_providers_list_option_current_providers?: string[] | null
          display_name_text?: string | null
          existing_product_text?: string | null
          external_product_code_text?: string | null
          external_product_name_text?: string | null
          id?: string
          interested_products_list_option_interested_products?: string[] | null
          modified_at?: string | null
          order_uuid?: string | null
          parent_lead_uuid?: string | null
          periodic_usage_number?: number | null
          primary_language_text?: string | null
          product_1_text?: string | null
          product_2_text?: string | null
          product_3_text?: string | null
          product_attribute_1_text?: string | null
          product_attribute_2_text?: string | null
          product_plan_name_text?: string | null
          psu_sold_number?: number | null
          quantity_number?: number | null
          related_child_lead_custom_child_lead?: string | null
          related_order_custom_orders?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          related_product_custom_product_catalog?: string | null
          row_id_text?: string | null
          term_of_contract_number?: number | null
          term_option_terms?: string | null
        }
        Update: {
          bubble_id?: string
          child_lead_uuid?: string | null
          created_at?: string | null
          created_by?: string | null
          current_provider_list_option_current_providers?: string[] | null
          current_providers_list_option_current_providers?: string[] | null
          display_name_text?: string | null
          existing_product_text?: string | null
          external_product_code_text?: string | null
          external_product_name_text?: string | null
          id?: string
          interested_products_list_option_interested_products?: string[] | null
          modified_at?: string | null
          order_uuid?: string | null
          parent_lead_uuid?: string | null
          periodic_usage_number?: number | null
          primary_language_text?: string | null
          product_1_text?: string | null
          product_2_text?: string | null
          product_3_text?: string | null
          product_attribute_1_text?: string | null
          product_attribute_2_text?: string | null
          product_plan_name_text?: string | null
          psu_sold_number?: number | null
          quantity_number?: number | null
          related_child_lead_custom_child_lead?: string | null
          related_order_custom_orders?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          related_product_custom_product_catalog?: string | null
          row_id_text?: string | null
          term_of_contract_number?: number | null
          term_option_terms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_child_lead"
            columns: ["child_lead_uuid"]
            isOneToOne: false
            referencedRelation: "child_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_order"
            columns: ["order_uuid"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      program_records: {
        Row: {
          bubble_id: string
          campaign_assignment_uuid: string | null
          campaign_option_campaigns: string | null
          child_lead1_custom_child_lead: string | null
          created_at: string | null
          created_by: string | null
          credit_requests_list_date: string[] | null
          current_provider_list_option_current_providers: string[] | null
          day_uuid: string | null
          icl_uuid: string | null
          id: string
          interested_products_list_option_interested_products: string[] | null
          loop___to_dm_number: number | null
          modified_at: string | null
          ni_contact_boolean: boolean | null
          not_qualified_boolean: boolean | null
          not_qualified_option_negative_dispo2: string | null
          number_of_lines_number: number | null
          originating_order_custom_orders: string | null
          originating_order_date_date: number | null
          originating_rep_user: string | null
          parent_lead_uuid: string | null
          related_aci_list_custom_aci_v2: string[] | null
          related_campaign_assignment_custom_campaign_assignment: string | null
          related_day_custom_day: string | null
          related_icl_custom_icl: string | null
          related_latitude_number: number | null
          related_longitude_number: number | null
          related_orders_list_custom_orders: string[] | null
          related_parent_lead_custom_parent_lead: string | null
          related_territory_custom_territory: string | null
          related_user_user: string | null
          related_zip_code_custom_zip_code_assignments: string | null
          source_text: string | null
          stage_option_stage: string | null
          territory_uuid: string | null
          user_uuid: string | null
        }
        Insert: {
          bubble_id: string
          campaign_assignment_uuid?: string | null
          campaign_option_campaigns?: string | null
          child_lead1_custom_child_lead?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_requests_list_date?: string[] | null
          current_provider_list_option_current_providers?: string[] | null
          day_uuid?: string | null
          icl_uuid?: string | null
          id?: string
          interested_products_list_option_interested_products?: string[] | null
          loop___to_dm_number?: number | null
          modified_at?: string | null
          ni_contact_boolean?: boolean | null
          not_qualified_boolean?: boolean | null
          not_qualified_option_negative_dispo2?: string | null
          number_of_lines_number?: number | null
          originating_order_custom_orders?: string | null
          originating_order_date_date?: number | null
          originating_rep_user?: string | null
          parent_lead_uuid?: string | null
          related_aci_list_custom_aci_v2?: string[] | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_day_custom_day?: string | null
          related_icl_custom_icl?: string | null
          related_latitude_number?: number | null
          related_longitude_number?: number | null
          related_orders_list_custom_orders?: string[] | null
          related_parent_lead_custom_parent_lead?: string | null
          related_territory_custom_territory?: string | null
          related_user_user?: string | null
          related_zip_code_custom_zip_code_assignments?: string | null
          source_text?: string | null
          stage_option_stage?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Update: {
          bubble_id?: string
          campaign_assignment_uuid?: string | null
          campaign_option_campaigns?: string | null
          child_lead1_custom_child_lead?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_requests_list_date?: string[] | null
          current_provider_list_option_current_providers?: string[] | null
          day_uuid?: string | null
          icl_uuid?: string | null
          id?: string
          interested_products_list_option_interested_products?: string[] | null
          loop___to_dm_number?: number | null
          modified_at?: string | null
          ni_contact_boolean?: boolean | null
          not_qualified_boolean?: boolean | null
          not_qualified_option_negative_dispo2?: string | null
          number_of_lines_number?: number | null
          originating_order_custom_orders?: string | null
          originating_order_date_date?: number | null
          originating_rep_user?: string | null
          parent_lead_uuid?: string | null
          related_aci_list_custom_aci_v2?: string[] | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_day_custom_day?: string | null
          related_icl_custom_icl?: string | null
          related_latitude_number?: number | null
          related_longitude_number?: number | null
          related_orders_list_custom_orders?: string[] | null
          related_parent_lead_custom_parent_lead?: string | null
          related_territory_custom_territory?: string | null
          related_user_user?: string | null
          related_zip_code_custom_zip_code_assignments?: string | null
          source_text?: string | null
          stage_option_stage?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pr_campaign_assignment"
            columns: ["campaign_assignment_uuid"]
            isOneToOne: false
            referencedRelation: "campaign_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pr_day"
            columns: ["day_uuid"]
            isOneToOne: false
            referencedRelation: "days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pr_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pr_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pr_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pr_user"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_stores: {
        Row: {
          bubble_id: string
          city_text: string | null
          created_at: string | null
          created_by: string | null
          full_address_geographic_address: Json | null
          id: string
          latitude_number: number | null
          longitude_number: number | null
          modified_at: string | null
          name_text: string | null
          state_text: string | null
          status_text: string | null
          store_id_number: number | null
          store_id_text: string | null
          store_number_text: string | null
          zip_code_number: number | null
        }
        Insert: {
          bubble_id: string
          city_text?: string | null
          created_at?: string | null
          created_by?: string | null
          full_address_geographic_address?: Json | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          modified_at?: string | null
          name_text?: string | null
          state_text?: string | null
          status_text?: string | null
          store_id_number?: number | null
          store_id_text?: string | null
          store_number_text?: string | null
          zip_code_number?: number | null
        }
        Update: {
          bubble_id?: string
          city_text?: string | null
          created_at?: string | null
          created_by?: string | null
          full_address_geographic_address?: Json | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          modified_at?: string | null
          name_text?: string | null
          state_text?: string | null
          status_text?: string | null
          store_id_number?: number | null
          store_id_text?: string | null
          store_number_text?: string | null
          zip_code_number?: number | null
        }
        Relationships: []
      }
      route_stops: {
        Row: {
          bubble_id: string
          child_lead_uuid: string | null
          created_at: string | null
          created_by: string | null
          full_address_geographic_address: Json | null
          id: string
          latitude_number: number | null
          longitude_number: number | null
          mdu_uuid: string | null
          modified_at: string | null
          mtu_marker_id_text: string | null
          order1_number: number | null
          parent_lead_uuid: string | null
          rank_number: number | null
          related_child_lead_custom_child_lead: string | null
          related_mdu_custom_mdu: string | null
          related_parent_lead_custom_parent_lead: string | null
          related_route_custom_route: string | null
          route_uuid: string | null
          row_id_text: string | null
          status_option_status: string | null
          stop_info1_option_map_icons: string | null
        }
        Insert: {
          bubble_id: string
          child_lead_uuid?: string | null
          created_at?: string | null
          created_by?: string | null
          full_address_geographic_address?: Json | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          mdu_uuid?: string | null
          modified_at?: string | null
          mtu_marker_id_text?: string | null
          order1_number?: number | null
          parent_lead_uuid?: string | null
          rank_number?: number | null
          related_child_lead_custom_child_lead?: string | null
          related_mdu_custom_mdu?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          related_route_custom_route?: string | null
          route_uuid?: string | null
          row_id_text?: string | null
          status_option_status?: string | null
          stop_info1_option_map_icons?: string | null
        }
        Update: {
          bubble_id?: string
          child_lead_uuid?: string | null
          created_at?: string | null
          created_by?: string | null
          full_address_geographic_address?: Json | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          mdu_uuid?: string | null
          modified_at?: string | null
          mtu_marker_id_text?: string | null
          order1_number?: number | null
          parent_lead_uuid?: string | null
          rank_number?: number | null
          related_child_lead_custom_child_lead?: string | null
          related_mdu_custom_mdu?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          related_route_custom_route?: string | null
          route_uuid?: string | null
          row_id_text?: string | null
          status_option_status?: string | null
          stop_info1_option_map_icons?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_rs_mdu"
            columns: ["mdu_uuid"]
            isOneToOne: false
            referencedRelation: "mdus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rs_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rs_route"
            columns: ["route_uuid"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
      routes: {
        Row: {
          bubble_id: string
          created_at: string | null
          created_by: string | null
          creation_type_text: string | null
          date_date: number | null
          icl_user: string | null
          icl_uuid: string | null
          id: string
          leads_in_route_list: string[] | null
          modified_at: string | null
          name_text: string | null
          optimized_ready_boolean: boolean | null
          ordered_job_ids_num_list_number: number[] | null
          proposed_route_stop_list_list: string[] | null
          raw_open_route_json_text: string | null
          related_icl_custom_icl: string | null
          related_route_stops_list: string[] | null
          related_territory_custom_territory: string | null
          rep_s_default_campaign_option_campaigns: string | null
          status_option_status: string | null
          territory_uuid: string | null
          user_uuid: string | null
        }
        Insert: {
          bubble_id: string
          created_at?: string | null
          created_by?: string | null
          creation_type_text?: string | null
          date_date?: number | null
          icl_user?: string | null
          icl_uuid?: string | null
          id?: string
          leads_in_route_list?: string[] | null
          modified_at?: string | null
          name_text?: string | null
          optimized_ready_boolean?: boolean | null
          ordered_job_ids_num_list_number?: number[] | null
          proposed_route_stop_list_list?: string[] | null
          raw_open_route_json_text?: string | null
          related_icl_custom_icl?: string | null
          related_route_stops_list?: string[] | null
          related_territory_custom_territory?: string | null
          rep_s_default_campaign_option_campaigns?: string | null
          status_option_status?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Update: {
          bubble_id?: string
          created_at?: string | null
          created_by?: string | null
          creation_type_text?: string | null
          date_date?: number | null
          icl_user?: string | null
          icl_uuid?: string | null
          id?: string
          leads_in_route_list?: string[] | null
          modified_at?: string | null
          name_text?: string | null
          optimized_ready_boolean?: boolean | null
          ordered_job_ids_num_list_number?: number[] | null
          proposed_route_stop_list_list?: string[] | null
          raw_open_route_json_text?: string | null
          related_icl_custom_icl?: string | null
          related_route_stops_list?: string[] | null
          related_territory_custom_territory?: string | null
          rep_s_default_campaign_option_campaigns?: string | null
          status_option_status?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_routes_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_routes_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_routes_user"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_agent_statistics: {
        Row: {
          bubble_id: string
          campaign_assignment_uuid: string | null
          campaign_option_campaigns: string | null
          created_at: string | null
          created_by: string | null
          daily_breakdown___viewed_boolean: boolean | null
          date_date: number | null
          dms_number: number | null
          doors_number: number | null
          formula_1___number: number | null
          formula_2_number: number | null
          formula_3___number: number | null
          icl_uuid: string | null
          id: string
          input_1__number: number | null
          input_10_number: number | null
          input_11_number: number | null
          input_12_number: number | null
          input_13_number: number | null
          input_14_number: number | null
          input_15_number: number | null
          input_16_number: number | null
          input_17_number: number | null
          input_18_number: number | null
          input_19_number: number | null
          input_2__number: number | null
          input_20_number: number | null
          input_3_number: number | null
          input_4_number: number | null
          input_5_number: number | null
          input_6_number: number | null
          input_7_number: number | null
          input_8_number: number | null
          input_9_number: number | null
          loop___to_dm_number: number | null
          modified_at: string | null
          new_doors_number: number | null
          order_type_2_number: number | null
          order_type_2_value_number: number | null
          order_type_3_number: number | null
          order_type_3_value_number: number | null
          orders_number: number | null
          presentations_number: number | null
          product_input_1_number: number | null
          product_input_2_number: number | null
          product_input_3_number: number | null
          product_input_4_number: number | null
          product_input_5_number: number | null
          rank_number: number | null
          related_campaign_assignment_custom_campaign_assignment: string | null
          related_icl_custom_icl: string | null
          related_program_list: string[] | null
          related_sas_configuration: string | null
          related_territory_custom_territory: string | null
          related_user_user: string | null
          retention_doors_number: number | null
          row_id_text: string | null
          status_option_status: string | null
          territory_uuid: string | null
          user_uuid: string | null
        }
        Insert: {
          bubble_id: string
          campaign_assignment_uuid?: string | null
          campaign_option_campaigns?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_breakdown___viewed_boolean?: boolean | null
          date_date?: number | null
          dms_number?: number | null
          doors_number?: number | null
          formula_1___number?: number | null
          formula_2_number?: number | null
          formula_3___number?: number | null
          icl_uuid?: string | null
          id?: string
          input_1__number?: number | null
          input_10_number?: number | null
          input_11_number?: number | null
          input_12_number?: number | null
          input_13_number?: number | null
          input_14_number?: number | null
          input_15_number?: number | null
          input_16_number?: number | null
          input_17_number?: number | null
          input_18_number?: number | null
          input_19_number?: number | null
          input_2__number?: number | null
          input_20_number?: number | null
          input_3_number?: number | null
          input_4_number?: number | null
          input_5_number?: number | null
          input_6_number?: number | null
          input_7_number?: number | null
          input_8_number?: number | null
          input_9_number?: number | null
          loop___to_dm_number?: number | null
          modified_at?: string | null
          new_doors_number?: number | null
          order_type_2_number?: number | null
          order_type_2_value_number?: number | null
          order_type_3_number?: number | null
          order_type_3_value_number?: number | null
          orders_number?: number | null
          presentations_number?: number | null
          product_input_1_number?: number | null
          product_input_2_number?: number | null
          product_input_3_number?: number | null
          product_input_4_number?: number | null
          product_input_5_number?: number | null
          rank_number?: number | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_icl_custom_icl?: string | null
          related_program_list?: string[] | null
          related_sas_configuration?: string | null
          related_territory_custom_territory?: string | null
          related_user_user?: string | null
          retention_doors_number?: number | null
          row_id_text?: string | null
          status_option_status?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Update: {
          bubble_id?: string
          campaign_assignment_uuid?: string | null
          campaign_option_campaigns?: string | null
          created_at?: string | null
          created_by?: string | null
          daily_breakdown___viewed_boolean?: boolean | null
          date_date?: number | null
          dms_number?: number | null
          doors_number?: number | null
          formula_1___number?: number | null
          formula_2_number?: number | null
          formula_3___number?: number | null
          icl_uuid?: string | null
          id?: string
          input_1__number?: number | null
          input_10_number?: number | null
          input_11_number?: number | null
          input_12_number?: number | null
          input_13_number?: number | null
          input_14_number?: number | null
          input_15_number?: number | null
          input_16_number?: number | null
          input_17_number?: number | null
          input_18_number?: number | null
          input_19_number?: number | null
          input_2__number?: number | null
          input_20_number?: number | null
          input_3_number?: number | null
          input_4_number?: number | null
          input_5_number?: number | null
          input_6_number?: number | null
          input_7_number?: number | null
          input_8_number?: number | null
          input_9_number?: number | null
          loop___to_dm_number?: number | null
          modified_at?: string | null
          new_doors_number?: number | null
          order_type_2_number?: number | null
          order_type_2_value_number?: number | null
          order_type_3_number?: number | null
          order_type_3_value_number?: number | null
          orders_number?: number | null
          presentations_number?: number | null
          product_input_1_number?: number | null
          product_input_2_number?: number | null
          product_input_3_number?: number | null
          product_input_4_number?: number | null
          product_input_5_number?: number | null
          rank_number?: number | null
          related_campaign_assignment_custom_campaign_assignment?: string | null
          related_icl_custom_icl?: string | null
          related_program_list?: string[] | null
          related_sas_configuration?: string | null
          related_territory_custom_territory?: string | null
          related_user_user?: string | null
          retention_doors_number?: number | null
          row_id_text?: string | null
          status_option_status?: string | null
          territory_uuid?: string | null
          user_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sas_campaign_assignment"
            columns: ["campaign_assignment_uuid"]
            isOneToOne: false
            referencedRelation: "campaign_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sas_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sas_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sas_user"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sas_configurations: {
        Row: {
          bubble_id: string
          campaign_option_campaigns: string | null
          created_at: string | null
          created_by: string | null
          default_sort_text: string | null
          formula_1_goal_text: string | null
          formula_1_is_top_goal_boolean: boolean | null
          formula_1_label_text: string | null
          formula_1_list_number: number[] | null
          formula_2_goal_text: string | null
          formula_2_is_top_goal_boolean: boolean | null
          formula_2_label_text: string | null
          formula_2_list_number: number[] | null
          formula_3_goal_text: string | null
          formula_3_label_text: string | null
          formula_3_list_number: number[] | null
          formula_4_list_number: number[] | null
          formula_5_list_number: number[] | null
          goal_1_is_top_goal_boolean: boolean | null
          goal_10_is_top_goal_boolean: boolean | null
          goal_11_is_top_goal_boolean: boolean | null
          goal_12_is_top_goal_boolean: boolean | null
          goal_13_is_top_goal_boolean: boolean | null
          goal_14_is_top_goal_boolean: boolean | null
          goal_15_is_top_goal_boolean: boolean | null
          goal_16_is_top_goal_boolean: boolean | null
          goal_17_is_top_goal_boolean: boolean | null
          goal_18_is_top_goal_boolean: boolean | null
          goal_19_is_top_goal_boolean: boolean | null
          goal_2_is_top_goal_boolean: boolean | null
          goal_20_is_top_goal_boolean: boolean | null
          goal_3_is_top_goal_boolean: boolean | null
          goal_4_is_top_goal_boolean: boolean | null
          goal_5_is_top_goal_boolean: boolean | null
          goal_6_is_top_goal_boolean: boolean | null
          goal_7_is_top_goal_boolean: boolean | null
          goal_8_is_top_goal_boolean: boolean | null
          goal_9_is_top_goal_boolean: boolean | null
          goal_formula_1_is_top_goal_boolean: boolean | null
          hcw_goal_text: string | null
          id: string
          input_1_autoloop__rapid__boolean: boolean | null
          input_1_goal_text: string | null
          input_1_icon_option_numbers_app_icons: string | null
          input_1_text: string | null
          input_10_autoloop__rapid__boolean: boolean | null
          input_10_goal_text: string | null
          input_10_icon__option_numbers_app_icons: string | null
          input_10_text: string | null
          input_11_autoloop__rapid__boolean: boolean | null
          input_11_goal_text: string | null
          input_11_icon__option_numbers_app_icons: string | null
          input_11_text: string | null
          input_12_autoloop__rapid__boolean: boolean | null
          input_12_goal_text: string | null
          input_12_icon__option_numbers_app_icons: string | null
          input_12_text: string | null
          input_13_autoloop__rapid__boolean: boolean | null
          input_13_goal_text: string | null
          input_13_icon__option_numbers_app_icons: string | null
          input_13_label_text: string | null
          input_14_autoloop__rapid__boolean: boolean | null
          input_14_goal_text: string | null
          input_14_icon__option_numbers_app_icons: string | null
          input_14_text: string | null
          input_15_autoloop__rapid__boolean: boolean | null
          input_15_goal_text: string | null
          input_15_icon__option_numbers_app_icons: string | null
          input_15_text: string | null
          input_16_autoloop__rapid__boolean: boolean | null
          input_16_goal_text: string | null
          input_16_icon__option_numbers_app_icons: string | null
          input_16_text: string | null
          input_17_autoloop__rapid__boolean: boolean | null
          input_17_goal_text: string | null
          input_17_icon__option_numbers_app_icons: string | null
          input_17_text: string | null
          input_18_autoloop__rapid__boolean: boolean | null
          input_18_goal_text: string | null
          input_18_icon__option_numbers_app_icons: string | null
          input_18_label_text: string | null
          input_19_autoloop__rapid__boolean: boolean | null
          input_19_goal_text: string | null
          input_19_icon__option_numbers_app_icons: string | null
          input_19_label_text: string | null
          input_2_autoloop__rapid__boolean: boolean | null
          input_2_goal_text: string | null
          input_2_icon_option_numbers_app_icons: string | null
          input_2_text: string | null
          input_20_autoloop__rapid__boolean: boolean | null
          input_20_goal_text: string | null
          input_20_icon__option_numbers_app_icons: string | null
          input_20_label_text: string | null
          input_3_autoloop__rapid__boolean: boolean | null
          input_3_goal_text: string | null
          input_3_icon_option_numbers_app_icons: string | null
          input_3_text: string | null
          input_4_autoloop__rapid__boolean: boolean | null
          input_4_goal_text: string | null
          input_4_icon_option_numbers_app_icons: string | null
          input_4_text: string | null
          input_5_autoloop__rapid__boolean: boolean | null
          input_5_goal_text: string | null
          input_5_icon__option_numbers_app_icons: string | null
          input_5_text: string | null
          input_6_autoloop__rapid__boolean: boolean | null
          input_6_goal_text: string | null
          input_6_icon__option_numbers_app_icons: string | null
          input_6_text: string | null
          input_7_autoloop__rapid__boolean: boolean | null
          input_7_goal_text: string | null
          input_7_icon_option_numbers_app_icons: string | null
          input_7_text: string | null
          input_8_autoloop__rapid__boolean: boolean | null
          input_8_goal_text: string | null
          input_8_icon__option_numbers_app_icons: string | null
          input_8_text: string | null
          input_9_autoloop__rapid__boolean: boolean | null
          input_9_goal_text: string | null
          input_9_icon__option_numbers_app_icons: string | null
          input_9_text: string | null
          list_of_labels_list: string[] | null
          modified_at: string | null
          number_of_inputs_number: number | null
          order_type_1_label_text: string | null
          order_type_1_target_number: number | null
          order_type_2_goal_number: number | null
          order_type_2_label_text: string | null
          order_type_3_goal_number: number | null
          order_type_3_label_text: string | null
          product_input_1_label_text: string | null
          product_input_2_label_text: string | null
          product_input_3_label_text: string | null
          product_input_4_label_text: string | null
          product_input_5_label_text: string | null
          related_sas_list: string[] | null
          remove_days_list: string[] | null
          restrict_previous_data_visibility_boolean: boolean | null
          show_all_icls_rankings_boolean: boolean | null
          show_input_1_boolean: boolean | null
          show_input_10_boolean: boolean | null
          show_input_11_boolean: boolean | null
          show_input_12_boolean: boolean | null
          show_input_13_boolean: boolean | null
          show_input_14_boolean: boolean | null
          show_input_15_boolean: boolean | null
          show_input_16_boolean: boolean | null
          show_input_17_boolean: boolean | null
          show_input_18_boolean: boolean | null
          show_input_19_boolean: boolean | null
          show_input_2_boolean: boolean | null
          show_input_20_boolean: boolean | null
          show_input_3_boolean: boolean | null
          show_input_4_boolean: boolean | null
          show_input_5_boolean: boolean | null
          show_input_6_boolean: boolean | null
          show_input_7_boolean: boolean | null
          show_input_8_boolean: boolean | null
          show_input_9_boolean: boolean | null
          show_order_type_1_boolean: boolean | null
          show_order_type_2_boolean: boolean | null
          show_order_type_3_boolean: boolean | null
          show_popup_boolean: boolean | null
          show_product_input_1_boolean: boolean | null
          show_product_input_2_boolean: boolean | null
          show_product_input_21_boolean: boolean | null
          show_product_input_4_boolean: boolean | null
          show_product_input_5_boolean: boolean | null
          show_retention_doors_boolean: boolean | null
          show_tiers_boolean: boolean | null
          show_top_reps_only_boolean: boolean | null
          show_top_reps_only_count_number: number | null
          status_option_status: string | null
        }
        Insert: {
          bubble_id: string
          campaign_option_campaigns?: string | null
          created_at?: string | null
          created_by?: string | null
          default_sort_text?: string | null
          formula_1_goal_text?: string | null
          formula_1_is_top_goal_boolean?: boolean | null
          formula_1_label_text?: string | null
          formula_1_list_number?: number[] | null
          formula_2_goal_text?: string | null
          formula_2_is_top_goal_boolean?: boolean | null
          formula_2_label_text?: string | null
          formula_2_list_number?: number[] | null
          formula_3_goal_text?: string | null
          formula_3_label_text?: string | null
          formula_3_list_number?: number[] | null
          formula_4_list_number?: number[] | null
          formula_5_list_number?: number[] | null
          goal_1_is_top_goal_boolean?: boolean | null
          goal_10_is_top_goal_boolean?: boolean | null
          goal_11_is_top_goal_boolean?: boolean | null
          goal_12_is_top_goal_boolean?: boolean | null
          goal_13_is_top_goal_boolean?: boolean | null
          goal_14_is_top_goal_boolean?: boolean | null
          goal_15_is_top_goal_boolean?: boolean | null
          goal_16_is_top_goal_boolean?: boolean | null
          goal_17_is_top_goal_boolean?: boolean | null
          goal_18_is_top_goal_boolean?: boolean | null
          goal_19_is_top_goal_boolean?: boolean | null
          goal_2_is_top_goal_boolean?: boolean | null
          goal_20_is_top_goal_boolean?: boolean | null
          goal_3_is_top_goal_boolean?: boolean | null
          goal_4_is_top_goal_boolean?: boolean | null
          goal_5_is_top_goal_boolean?: boolean | null
          goal_6_is_top_goal_boolean?: boolean | null
          goal_7_is_top_goal_boolean?: boolean | null
          goal_8_is_top_goal_boolean?: boolean | null
          goal_9_is_top_goal_boolean?: boolean | null
          goal_formula_1_is_top_goal_boolean?: boolean | null
          hcw_goal_text?: string | null
          id?: string
          input_1_autoloop__rapid__boolean?: boolean | null
          input_1_goal_text?: string | null
          input_1_icon_option_numbers_app_icons?: string | null
          input_1_text?: string | null
          input_10_autoloop__rapid__boolean?: boolean | null
          input_10_goal_text?: string | null
          input_10_icon__option_numbers_app_icons?: string | null
          input_10_text?: string | null
          input_11_autoloop__rapid__boolean?: boolean | null
          input_11_goal_text?: string | null
          input_11_icon__option_numbers_app_icons?: string | null
          input_11_text?: string | null
          input_12_autoloop__rapid__boolean?: boolean | null
          input_12_goal_text?: string | null
          input_12_icon__option_numbers_app_icons?: string | null
          input_12_text?: string | null
          input_13_autoloop__rapid__boolean?: boolean | null
          input_13_goal_text?: string | null
          input_13_icon__option_numbers_app_icons?: string | null
          input_13_label_text?: string | null
          input_14_autoloop__rapid__boolean?: boolean | null
          input_14_goal_text?: string | null
          input_14_icon__option_numbers_app_icons?: string | null
          input_14_text?: string | null
          input_15_autoloop__rapid__boolean?: boolean | null
          input_15_goal_text?: string | null
          input_15_icon__option_numbers_app_icons?: string | null
          input_15_text?: string | null
          input_16_autoloop__rapid__boolean?: boolean | null
          input_16_goal_text?: string | null
          input_16_icon__option_numbers_app_icons?: string | null
          input_16_text?: string | null
          input_17_autoloop__rapid__boolean?: boolean | null
          input_17_goal_text?: string | null
          input_17_icon__option_numbers_app_icons?: string | null
          input_17_text?: string | null
          input_18_autoloop__rapid__boolean?: boolean | null
          input_18_goal_text?: string | null
          input_18_icon__option_numbers_app_icons?: string | null
          input_18_label_text?: string | null
          input_19_autoloop__rapid__boolean?: boolean | null
          input_19_goal_text?: string | null
          input_19_icon__option_numbers_app_icons?: string | null
          input_19_label_text?: string | null
          input_2_autoloop__rapid__boolean?: boolean | null
          input_2_goal_text?: string | null
          input_2_icon_option_numbers_app_icons?: string | null
          input_2_text?: string | null
          input_20_autoloop__rapid__boolean?: boolean | null
          input_20_goal_text?: string | null
          input_20_icon__option_numbers_app_icons?: string | null
          input_20_label_text?: string | null
          input_3_autoloop__rapid__boolean?: boolean | null
          input_3_goal_text?: string | null
          input_3_icon_option_numbers_app_icons?: string | null
          input_3_text?: string | null
          input_4_autoloop__rapid__boolean?: boolean | null
          input_4_goal_text?: string | null
          input_4_icon_option_numbers_app_icons?: string | null
          input_4_text?: string | null
          input_5_autoloop__rapid__boolean?: boolean | null
          input_5_goal_text?: string | null
          input_5_icon__option_numbers_app_icons?: string | null
          input_5_text?: string | null
          input_6_autoloop__rapid__boolean?: boolean | null
          input_6_goal_text?: string | null
          input_6_icon__option_numbers_app_icons?: string | null
          input_6_text?: string | null
          input_7_autoloop__rapid__boolean?: boolean | null
          input_7_goal_text?: string | null
          input_7_icon_option_numbers_app_icons?: string | null
          input_7_text?: string | null
          input_8_autoloop__rapid__boolean?: boolean | null
          input_8_goal_text?: string | null
          input_8_icon__option_numbers_app_icons?: string | null
          input_8_text?: string | null
          input_9_autoloop__rapid__boolean?: boolean | null
          input_9_goal_text?: string | null
          input_9_icon__option_numbers_app_icons?: string | null
          input_9_text?: string | null
          list_of_labels_list?: string[] | null
          modified_at?: string | null
          number_of_inputs_number?: number | null
          order_type_1_label_text?: string | null
          order_type_1_target_number?: number | null
          order_type_2_goal_number?: number | null
          order_type_2_label_text?: string | null
          order_type_3_goal_number?: number | null
          order_type_3_label_text?: string | null
          product_input_1_label_text?: string | null
          product_input_2_label_text?: string | null
          product_input_3_label_text?: string | null
          product_input_4_label_text?: string | null
          product_input_5_label_text?: string | null
          related_sas_list?: string[] | null
          remove_days_list?: string[] | null
          restrict_previous_data_visibility_boolean?: boolean | null
          show_all_icls_rankings_boolean?: boolean | null
          show_input_1_boolean?: boolean | null
          show_input_10_boolean?: boolean | null
          show_input_11_boolean?: boolean | null
          show_input_12_boolean?: boolean | null
          show_input_13_boolean?: boolean | null
          show_input_14_boolean?: boolean | null
          show_input_15_boolean?: boolean | null
          show_input_16_boolean?: boolean | null
          show_input_17_boolean?: boolean | null
          show_input_18_boolean?: boolean | null
          show_input_19_boolean?: boolean | null
          show_input_2_boolean?: boolean | null
          show_input_20_boolean?: boolean | null
          show_input_3_boolean?: boolean | null
          show_input_4_boolean?: boolean | null
          show_input_5_boolean?: boolean | null
          show_input_6_boolean?: boolean | null
          show_input_7_boolean?: boolean | null
          show_input_8_boolean?: boolean | null
          show_input_9_boolean?: boolean | null
          show_order_type_1_boolean?: boolean | null
          show_order_type_2_boolean?: boolean | null
          show_order_type_3_boolean?: boolean | null
          show_popup_boolean?: boolean | null
          show_product_input_1_boolean?: boolean | null
          show_product_input_2_boolean?: boolean | null
          show_product_input_21_boolean?: boolean | null
          show_product_input_4_boolean?: boolean | null
          show_product_input_5_boolean?: boolean | null
          show_retention_doors_boolean?: boolean | null
          show_tiers_boolean?: boolean | null
          show_top_reps_only_boolean?: boolean | null
          show_top_reps_only_count_number?: number | null
          status_option_status?: string | null
        }
        Update: {
          bubble_id?: string
          campaign_option_campaigns?: string | null
          created_at?: string | null
          created_by?: string | null
          default_sort_text?: string | null
          formula_1_goal_text?: string | null
          formula_1_is_top_goal_boolean?: boolean | null
          formula_1_label_text?: string | null
          formula_1_list_number?: number[] | null
          formula_2_goal_text?: string | null
          formula_2_is_top_goal_boolean?: boolean | null
          formula_2_label_text?: string | null
          formula_2_list_number?: number[] | null
          formula_3_goal_text?: string | null
          formula_3_label_text?: string | null
          formula_3_list_number?: number[] | null
          formula_4_list_number?: number[] | null
          formula_5_list_number?: number[] | null
          goal_1_is_top_goal_boolean?: boolean | null
          goal_10_is_top_goal_boolean?: boolean | null
          goal_11_is_top_goal_boolean?: boolean | null
          goal_12_is_top_goal_boolean?: boolean | null
          goal_13_is_top_goal_boolean?: boolean | null
          goal_14_is_top_goal_boolean?: boolean | null
          goal_15_is_top_goal_boolean?: boolean | null
          goal_16_is_top_goal_boolean?: boolean | null
          goal_17_is_top_goal_boolean?: boolean | null
          goal_18_is_top_goal_boolean?: boolean | null
          goal_19_is_top_goal_boolean?: boolean | null
          goal_2_is_top_goal_boolean?: boolean | null
          goal_20_is_top_goal_boolean?: boolean | null
          goal_3_is_top_goal_boolean?: boolean | null
          goal_4_is_top_goal_boolean?: boolean | null
          goal_5_is_top_goal_boolean?: boolean | null
          goal_6_is_top_goal_boolean?: boolean | null
          goal_7_is_top_goal_boolean?: boolean | null
          goal_8_is_top_goal_boolean?: boolean | null
          goal_9_is_top_goal_boolean?: boolean | null
          goal_formula_1_is_top_goal_boolean?: boolean | null
          hcw_goal_text?: string | null
          id?: string
          input_1_autoloop__rapid__boolean?: boolean | null
          input_1_goal_text?: string | null
          input_1_icon_option_numbers_app_icons?: string | null
          input_1_text?: string | null
          input_10_autoloop__rapid__boolean?: boolean | null
          input_10_goal_text?: string | null
          input_10_icon__option_numbers_app_icons?: string | null
          input_10_text?: string | null
          input_11_autoloop__rapid__boolean?: boolean | null
          input_11_goal_text?: string | null
          input_11_icon__option_numbers_app_icons?: string | null
          input_11_text?: string | null
          input_12_autoloop__rapid__boolean?: boolean | null
          input_12_goal_text?: string | null
          input_12_icon__option_numbers_app_icons?: string | null
          input_12_text?: string | null
          input_13_autoloop__rapid__boolean?: boolean | null
          input_13_goal_text?: string | null
          input_13_icon__option_numbers_app_icons?: string | null
          input_13_label_text?: string | null
          input_14_autoloop__rapid__boolean?: boolean | null
          input_14_goal_text?: string | null
          input_14_icon__option_numbers_app_icons?: string | null
          input_14_text?: string | null
          input_15_autoloop__rapid__boolean?: boolean | null
          input_15_goal_text?: string | null
          input_15_icon__option_numbers_app_icons?: string | null
          input_15_text?: string | null
          input_16_autoloop__rapid__boolean?: boolean | null
          input_16_goal_text?: string | null
          input_16_icon__option_numbers_app_icons?: string | null
          input_16_text?: string | null
          input_17_autoloop__rapid__boolean?: boolean | null
          input_17_goal_text?: string | null
          input_17_icon__option_numbers_app_icons?: string | null
          input_17_text?: string | null
          input_18_autoloop__rapid__boolean?: boolean | null
          input_18_goal_text?: string | null
          input_18_icon__option_numbers_app_icons?: string | null
          input_18_label_text?: string | null
          input_19_autoloop__rapid__boolean?: boolean | null
          input_19_goal_text?: string | null
          input_19_icon__option_numbers_app_icons?: string | null
          input_19_label_text?: string | null
          input_2_autoloop__rapid__boolean?: boolean | null
          input_2_goal_text?: string | null
          input_2_icon_option_numbers_app_icons?: string | null
          input_2_text?: string | null
          input_20_autoloop__rapid__boolean?: boolean | null
          input_20_goal_text?: string | null
          input_20_icon__option_numbers_app_icons?: string | null
          input_20_label_text?: string | null
          input_3_autoloop__rapid__boolean?: boolean | null
          input_3_goal_text?: string | null
          input_3_icon_option_numbers_app_icons?: string | null
          input_3_text?: string | null
          input_4_autoloop__rapid__boolean?: boolean | null
          input_4_goal_text?: string | null
          input_4_icon_option_numbers_app_icons?: string | null
          input_4_text?: string | null
          input_5_autoloop__rapid__boolean?: boolean | null
          input_5_goal_text?: string | null
          input_5_icon__option_numbers_app_icons?: string | null
          input_5_text?: string | null
          input_6_autoloop__rapid__boolean?: boolean | null
          input_6_goal_text?: string | null
          input_6_icon__option_numbers_app_icons?: string | null
          input_6_text?: string | null
          input_7_autoloop__rapid__boolean?: boolean | null
          input_7_goal_text?: string | null
          input_7_icon_option_numbers_app_icons?: string | null
          input_7_text?: string | null
          input_8_autoloop__rapid__boolean?: boolean | null
          input_8_goal_text?: string | null
          input_8_icon__option_numbers_app_icons?: string | null
          input_8_text?: string | null
          input_9_autoloop__rapid__boolean?: boolean | null
          input_9_goal_text?: string | null
          input_9_icon__option_numbers_app_icons?: string | null
          input_9_text?: string | null
          list_of_labels_list?: string[] | null
          modified_at?: string | null
          number_of_inputs_number?: number | null
          order_type_1_label_text?: string | null
          order_type_1_target_number?: number | null
          order_type_2_goal_number?: number | null
          order_type_2_label_text?: string | null
          order_type_3_goal_number?: number | null
          order_type_3_label_text?: string | null
          product_input_1_label_text?: string | null
          product_input_2_label_text?: string | null
          product_input_3_label_text?: string | null
          product_input_4_label_text?: string | null
          product_input_5_label_text?: string | null
          related_sas_list?: string[] | null
          remove_days_list?: string[] | null
          restrict_previous_data_visibility_boolean?: boolean | null
          show_all_icls_rankings_boolean?: boolean | null
          show_input_1_boolean?: boolean | null
          show_input_10_boolean?: boolean | null
          show_input_11_boolean?: boolean | null
          show_input_12_boolean?: boolean | null
          show_input_13_boolean?: boolean | null
          show_input_14_boolean?: boolean | null
          show_input_15_boolean?: boolean | null
          show_input_16_boolean?: boolean | null
          show_input_17_boolean?: boolean | null
          show_input_18_boolean?: boolean | null
          show_input_19_boolean?: boolean | null
          show_input_2_boolean?: boolean | null
          show_input_20_boolean?: boolean | null
          show_input_3_boolean?: boolean | null
          show_input_4_boolean?: boolean | null
          show_input_5_boolean?: boolean | null
          show_input_6_boolean?: boolean | null
          show_input_7_boolean?: boolean | null
          show_input_8_boolean?: boolean | null
          show_input_9_boolean?: boolean | null
          show_order_type_1_boolean?: boolean | null
          show_order_type_2_boolean?: boolean | null
          show_order_type_3_boolean?: boolean | null
          show_popup_boolean?: boolean | null
          show_product_input_1_boolean?: boolean | null
          show_product_input_2_boolean?: boolean | null
          show_product_input_21_boolean?: boolean | null
          show_product_input_4_boolean?: boolean | null
          show_product_input_5_boolean?: boolean | null
          show_retention_doors_boolean?: boolean | null
          show_tiers_boolean?: boolean | null
          show_top_reps_only_boolean?: boolean | null
          show_top_reps_only_count_number?: number | null
          status_option_status?: string | null
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          bubble_id: string
          created_at: string | null
          created_by: string | null
          id: string
          logs_list: string[] | null
          modified_at: string | null
          related_user_user: string | null
          user_uuid: string | null
        }
        Insert: {
          bubble_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          logs_list?: string[] | null
          modified_at?: string | null
          related_user_user?: string | null
          user_uuid?: string | null
        }
        Update: {
          bubble_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          logs_list?: string[] | null
          modified_at?: string | null
          related_user_user?: string | null
          user_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_session_logs_user"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
      }
      surveys: {
        Row: {
          additional_info_text: string | null
          bubble_id: string
          business_name_text: string | null
          business_services1_list: string[] | null
          client_option_campaigns: string | null
          completion_date_date: number | null
          created_at: string | null
          created_by: string | null
          current_question_number: number | null
          email_text: string | null
          employee_count_2025_text: string | null
          employee_count_number: number | null
          facebook_business_review_boolean: boolean | null
          first_name_text: string | null
          full_name_text: string | null
          google_business_review_boolean: boolean | null
          how_likely_are_you_to_use_cmb_again_number: number | null
          icl_custom_icl: string | null
          icl_uuid: string | null
          id: string
          industry_text: string | null
          ip_address_text: string | null
          language_text: string | null
          last_name_text: string | null
          modified_at: string | null
          number_of_locations_number: number | null
          opt_in_text: string | null
          order_s_sales_date_date: number | null
          order_uuid: string | null
          parent_lead_uuid: string | null
          phone_text: string | null
          program_text: string | null
          rate_your_experience_number: number | null
          related_order_custom_orders: string | null
          related_parent_lead_custom_parent_lead: string | null
          revenue_text: string | null
          sales_rep_name_text: string | null
          sales_rep_user: string | null
          sales_rep_uuid: string | null
          same_day_completion_boolean: boolean | null
          source_text: string | null
          status_text: string | null
          url_text: string | null
          years_in_business_number: number | null
        }
        Insert: {
          additional_info_text?: string | null
          bubble_id: string
          business_name_text?: string | null
          business_services1_list?: string[] | null
          client_option_campaigns?: string | null
          completion_date_date?: number | null
          created_at?: string | null
          created_by?: string | null
          current_question_number?: number | null
          email_text?: string | null
          employee_count_2025_text?: string | null
          employee_count_number?: number | null
          facebook_business_review_boolean?: boolean | null
          first_name_text?: string | null
          full_name_text?: string | null
          google_business_review_boolean?: boolean | null
          how_likely_are_you_to_use_cmb_again_number?: number | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          industry_text?: string | null
          ip_address_text?: string | null
          language_text?: string | null
          last_name_text?: string | null
          modified_at?: string | null
          number_of_locations_number?: number | null
          opt_in_text?: string | null
          order_s_sales_date_date?: number | null
          order_uuid?: string | null
          parent_lead_uuid?: string | null
          phone_text?: string | null
          program_text?: string | null
          rate_your_experience_number?: number | null
          related_order_custom_orders?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          revenue_text?: string | null
          sales_rep_name_text?: string | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          same_day_completion_boolean?: boolean | null
          source_text?: string | null
          status_text?: string | null
          url_text?: string | null
          years_in_business_number?: number | null
        }
        Update: {
          additional_info_text?: string | null
          bubble_id?: string
          business_name_text?: string | null
          business_services1_list?: string[] | null
          client_option_campaigns?: string | null
          completion_date_date?: number | null
          created_at?: string | null
          created_by?: string | null
          current_question_number?: number | null
          email_text?: string | null
          employee_count_2025_text?: string | null
          employee_count_number?: number | null
          facebook_business_review_boolean?: boolean | null
          first_name_text?: string | null
          full_name_text?: string | null
          google_business_review_boolean?: boolean | null
          how_likely_are_you_to_use_cmb_again_number?: number | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          industry_text?: string | null
          ip_address_text?: string | null
          language_text?: string | null
          last_name_text?: string | null
          modified_at?: string | null
          number_of_locations_number?: number | null
          opt_in_text?: string | null
          order_s_sales_date_date?: number | null
          order_uuid?: string | null
          parent_lead_uuid?: string | null
          phone_text?: string | null
          program_text?: string | null
          rate_your_experience_number?: number | null
          related_order_custom_orders?: string | null
          related_parent_lead_custom_parent_lead?: string | null
          revenue_text?: string | null
          sales_rep_name_text?: string | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          same_day_completion_boolean?: boolean | null
          source_text?: string | null
          status_text?: string | null
          url_text?: string | null
          years_in_business_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_surveys_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_surveys_order"
            columns: ["order_uuid"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_surveys_parent_lead"
            columns: ["parent_lead_uuid"]
            isOneToOne: false
            referencedRelation: "parent_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_surveys_sales_rep"
            columns: ["sales_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_state: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          last_bubble_modified: string | null
          last_sync_at: string
          records_synced: number | null
          sync_status: string | null
          table_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_bubble_modified?: string | null
          last_sync_at?: string
          records_synced?: number | null
          sync_status?: string | null
          table_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          last_bubble_modified?: string | null
          last_sync_at?: string
          records_synced?: number | null
          sync_status?: string | null
          table_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      territories: {
        Row: {
          addresses_cleaned_date: number | null
          assigned_icl_custom_icl: string | null
          assigned_rep_user: string | null
          assigned_rep_uuid: string | null
          bubble_id: string
          city_text: string | null
          closed_businesses_scrub_last_ran_date: number | null
          country_text: string | null
          created_at: string | null
          created_by: string | null
          dms_number: number | null
          doors_number: number | null
          full_address_geographic_address: Json | null
          icl_uuid: string | null
          id: string
          latitude_number: number | null
          longitude_number: number | null
          modified_at: string | null
          name_text: string | null
          new_doors_number: number | null
          orders_number: number | null
          parent_lead_count_number: number | null
          parent_leads_list: string[] | null
          presentations_number: number | null
          related_zip_code_assignment: string | null
          state_text: string | null
          status_option_status: string | null
          territory_id__glide__text: string | null
          territory_id_text: string | null
          territory_status_option_territory_status: string | null
          zip_code__text__text: string | null
          zip_code_number: number | null
        }
        Insert: {
          addresses_cleaned_date?: number | null
          assigned_icl_custom_icl?: string | null
          assigned_rep_user?: string | null
          assigned_rep_uuid?: string | null
          bubble_id: string
          city_text?: string | null
          closed_businesses_scrub_last_ran_date?: number | null
          country_text?: string | null
          created_at?: string | null
          created_by?: string | null
          dms_number?: number | null
          doors_number?: number | null
          full_address_geographic_address?: Json | null
          icl_uuid?: string | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          modified_at?: string | null
          name_text?: string | null
          new_doors_number?: number | null
          orders_number?: number | null
          parent_lead_count_number?: number | null
          parent_leads_list?: string[] | null
          presentations_number?: number | null
          related_zip_code_assignment?: string | null
          state_text?: string | null
          status_option_status?: string | null
          territory_id__glide__text?: string | null
          territory_id_text?: string | null
          territory_status_option_territory_status?: string | null
          zip_code__text__text?: string | null
          zip_code_number?: number | null
        }
        Update: {
          addresses_cleaned_date?: number | null
          assigned_icl_custom_icl?: string | null
          assigned_rep_user?: string | null
          assigned_rep_uuid?: string | null
          bubble_id?: string
          city_text?: string | null
          closed_businesses_scrub_last_ran_date?: number | null
          country_text?: string | null
          created_at?: string | null
          created_by?: string | null
          dms_number?: number | null
          doors_number?: number | null
          full_address_geographic_address?: Json | null
          icl_uuid?: string | null
          id?: string
          latitude_number?: number | null
          longitude_number?: number | null
          modified_at?: string | null
          name_text?: string | null
          new_doors_number?: number | null
          orders_number?: number | null
          parent_lead_count_number?: number | null
          parent_leads_list?: string[] | null
          presentations_number?: number | null
          related_zip_code_assignment?: string | null
          state_text?: string | null
          status_option_status?: string | null
          territory_id__glide__text?: string | null
          territory_id_text?: string | null
          territory_status_option_territory_status?: string | null
          zip_code__text__text?: string | null
          zip_code_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_territories_assigned_rep"
            columns: ["assigned_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_territories_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
        ]
      }
      territory_snapshots: {
        Row: {
          assigned_icl_custom_icl: string | null
          avg_loops_to_dm_number: number | null
          bubble_id: string
          count_of_days_worked_number: number | null
          count_of_dms_number: number | null
          count_of_existing_customers_number: number | null
          count_of_invalid_leads_number: number | null
          count_of_leads_in_mdu_number: number | null
          count_of_leads_worked_number: number | null
          count_of_locked_doors_number: number | null
          count_of_mdus_number: number | null
          count_of_sales_number: number | null
          count_of_total_leads_number: number | null
          count_of_unworked_leads_number: number | null
          count_of_warm_dms_number: number | null
          created_at: string | null
          created_by: string | null
          date_of_first_worked_date: number | null
          date_of_last_worked_date: number | null
          icl_uuid: string | null
          id: string
          last_refreshed_date_date: number | null
          modified_at: string | null
          previous_rep1___days_worked_number: number | null
          previous_rep1_user: string | null
          previous_rep2___days_worked_number: number | null
          previous_rep2_user: string | null
          primary_rep___days_worked_number: number | null
          primary_rep_user: string | null
          primary_rep_uuid: string | null
          refreshed_date_list: number[] | null
          related_territory_custom_territory: string | null
          related_zip_code_assignment_custom_zip_code_icl__assignments:
            | string
            | null
          related_zip_code_custom_zip_code_assignments: string | null
          reps_list: string[] | null
          sales_rep_user: string | null
          sales_rep_uuid: string | null
          secondary_rep___days_worked_number: number | null
          secondary_rep_user: string | null
          secondary_rep_uuid: string | null
          shared_rep_user: string | null
          shared_rep1_user: string | null
          shared_rep2___days_worked_number: number | null
          shared_rep2_user: string | null
          shared_rep3___days_worked_number: number | null
          shared_rep3_user: string | null
          snapshot_status_option_user_status: string | null
          tags_list: string[] | null
          territory_uuid: string | null
          upcoming_calendar_events_number: number | null
          zip_code_assignment_uuid: string | null
          zip_code_icl_assignment_uuid: string | null
        }
        Insert: {
          assigned_icl_custom_icl?: string | null
          avg_loops_to_dm_number?: number | null
          bubble_id: string
          count_of_days_worked_number?: number | null
          count_of_dms_number?: number | null
          count_of_existing_customers_number?: number | null
          count_of_invalid_leads_number?: number | null
          count_of_leads_in_mdu_number?: number | null
          count_of_leads_worked_number?: number | null
          count_of_locked_doors_number?: number | null
          count_of_mdus_number?: number | null
          count_of_sales_number?: number | null
          count_of_total_leads_number?: number | null
          count_of_unworked_leads_number?: number | null
          count_of_warm_dms_number?: number | null
          created_at?: string | null
          created_by?: string | null
          date_of_first_worked_date?: number | null
          date_of_last_worked_date?: number | null
          icl_uuid?: string | null
          id?: string
          last_refreshed_date_date?: number | null
          modified_at?: string | null
          previous_rep1___days_worked_number?: number | null
          previous_rep1_user?: string | null
          previous_rep2___days_worked_number?: number | null
          previous_rep2_user?: string | null
          primary_rep___days_worked_number?: number | null
          primary_rep_user?: string | null
          primary_rep_uuid?: string | null
          refreshed_date_list?: number[] | null
          related_territory_custom_territory?: string | null
          related_zip_code_assignment_custom_zip_code_icl__assignments?:
            | string
            | null
          related_zip_code_custom_zip_code_assignments?: string | null
          reps_list?: string[] | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          secondary_rep___days_worked_number?: number | null
          secondary_rep_user?: string | null
          secondary_rep_uuid?: string | null
          shared_rep_user?: string | null
          shared_rep1_user?: string | null
          shared_rep2___days_worked_number?: number | null
          shared_rep2_user?: string | null
          shared_rep3___days_worked_number?: number | null
          shared_rep3_user?: string | null
          snapshot_status_option_user_status?: string | null
          tags_list?: string[] | null
          territory_uuid?: string | null
          upcoming_calendar_events_number?: number | null
          zip_code_assignment_uuid?: string | null
          zip_code_icl_assignment_uuid?: string | null
        }
        Update: {
          assigned_icl_custom_icl?: string | null
          avg_loops_to_dm_number?: number | null
          bubble_id?: string
          count_of_days_worked_number?: number | null
          count_of_dms_number?: number | null
          count_of_existing_customers_number?: number | null
          count_of_invalid_leads_number?: number | null
          count_of_leads_in_mdu_number?: number | null
          count_of_leads_worked_number?: number | null
          count_of_locked_doors_number?: number | null
          count_of_mdus_number?: number | null
          count_of_sales_number?: number | null
          count_of_total_leads_number?: number | null
          count_of_unworked_leads_number?: number | null
          count_of_warm_dms_number?: number | null
          created_at?: string | null
          created_by?: string | null
          date_of_first_worked_date?: number | null
          date_of_last_worked_date?: number | null
          icl_uuid?: string | null
          id?: string
          last_refreshed_date_date?: number | null
          modified_at?: string | null
          previous_rep1___days_worked_number?: number | null
          previous_rep1_user?: string | null
          previous_rep2___days_worked_number?: number | null
          previous_rep2_user?: string | null
          primary_rep___days_worked_number?: number | null
          primary_rep_user?: string | null
          primary_rep_uuid?: string | null
          refreshed_date_list?: number[] | null
          related_territory_custom_territory?: string | null
          related_zip_code_assignment_custom_zip_code_icl__assignments?:
            | string
            | null
          related_zip_code_custom_zip_code_assignments?: string | null
          reps_list?: string[] | null
          sales_rep_user?: string | null
          sales_rep_uuid?: string | null
          secondary_rep___days_worked_number?: number | null
          secondary_rep_user?: string | null
          secondary_rep_uuid?: string | null
          shared_rep_user?: string | null
          shared_rep1_user?: string | null
          shared_rep2___days_worked_number?: number | null
          shared_rep2_user?: string | null
          shared_rep3___days_worked_number?: number | null
          shared_rep3_user?: string | null
          snapshot_status_option_user_status?: string | null
          tags_list?: string[] | null
          territory_uuid?: string | null
          upcoming_calendar_events_number?: number | null
          zip_code_assignment_uuid?: string | null
          zip_code_icl_assignment_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_ts_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ts_primary_rep"
            columns: ["primary_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ts_sales_rep"
            columns: ["sales_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ts_secondary_rep"
            columns: ["secondary_rep_uuid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ts_territory"
            columns: ["territory_uuid"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ts_zca"
            columns: ["zip_code_assignment_uuid"]
            isOneToOne: false
            referencedRelation: "zip_code_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ts_zcia"
            columns: ["zip_code_icl_assignment_uuid"]
            isOneToOne: false
            referencedRelation: "zip_code_icl_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      us_zip_kml: {
        Row: {
          altitudemode: string | null
          begin: string | null
          description: string | null
          draworder: number | null
          end: string | null
          extrude: number | null
          geom: unknown
          gid: number
          icon: string | null
          id: string | null
          name: string | null
          tessellate: number | null
          timestamp: string | null
          url: string | null
          visibility: number | null
        }
        Insert: {
          altitudemode?: string | null
          begin?: string | null
          description?: string | null
          draworder?: number | null
          end?: string | null
          extrude?: number | null
          geom?: unknown
          gid?: number
          icon?: string | null
          id?: string | null
          name?: string | null
          tessellate?: number | null
          timestamp?: string | null
          url?: string | null
          visibility?: number | null
        }
        Update: {
          altitudemode?: string | null
          begin?: string | null
          description?: string | null
          draworder?: number | null
          end?: string | null
          extrude?: number | null
          geom?: unknown
          gid?: number
          icon?: string | null
          id?: string | null
          name?: string | null
          tessellate?: number | null
          timestamp?: string | null
          url?: string | null
          visibility?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          account_id_text: string | null
          account_name_text: string | null
          active_session_log: string | null
          assigned_campaigns_list: string[] | null
          assigned_territories_count_number: number | null
          assigned_territories_list: string[] | null
          auth_user_id: string | null
          avatar_prompts_list: string[] | null
          bio_last_updated_date: number | null
          bio_text: string | null
          bubble_id: string
          campaign_agent_code_text: string | null
          chats_list: string[] | null
          checkpoints_text: string | null
          ciaa_id_text: string | null
          contact_card_file: string | null
          contact_id_text: string | null
          created_at: string | null
          created_by: string | null
          custom_settings_list: string[] | null
          custom_settings_visible_boolean: boolean | null
          default_campaign_option_campaigns: string | null
          device_height_text: string | null
          device_type_text: string | null
          devide_width_text: string | null
          email_text: string | null
          enable_session_logs_boolean: boolean | null
          enabled_beta_features_list: string[] | null
          feedback_requested_date: number | null
          field_change_history_list: string[] | null
          first_name_text: string | null
          full_name_text: string | null
          generated_avatars_list: string[] | null
          icl_assignment_id_text: string | null
          icl_code_text: string | null
          icl_code1_custom_icl: string | null
          icl_name_custom_icl: string | null
          icl_uuid: string | null
          id: string
          last_announcement_seen_date: number | null
          last_image_generated_date: number | null
          last_message_recieved_date: number | null
          last_name_text: string | null
          logins__unique_days__list: number[] | null
          logins_list: number[] | null
          mighty_link_text: string | null
          modified_at: string | null
          modified_email_text: string | null
          new_role_option_role: string | null
          opt_in_boolean: boolean | null
          org_consultant_user: string | null
          owner_downline_list: string[] | null
          owner_portal_logins_list: number[] | null
          phone_text: string | null
          photo_image: string | null
          promoting_owner_user: string | null
          ranked_score_number: number | null
          related_campaign_assignments_list: string[] | null
          related_orders_list: string[] | null
          related_routes_list: string[] | null
          related_sas_list: string[] | null
          related_user_team: string | null
          removed_campaigns_list: string[] | null
          rep_link_text: string | null
          rep_opt_in_last_viewed_date_list: number[] | null
          rep_opt_in_text: string | null
          role_text: string | null
          sms_sent_count_number: number | null
          status_option_user_status: string | null
          temp_password_text: string | null
          user_signed_up: boolean | null
          vcard_list: string[] | null
          vcardfr_text: string | null
          web_notification_key_text: string | null
        }
        Insert: {
          account_id_text?: string | null
          account_name_text?: string | null
          active_session_log?: string | null
          assigned_campaigns_list?: string[] | null
          assigned_territories_count_number?: number | null
          assigned_territories_list?: string[] | null
          auth_user_id?: string | null
          avatar_prompts_list?: string[] | null
          bio_last_updated_date?: number | null
          bio_text?: string | null
          bubble_id: string
          campaign_agent_code_text?: string | null
          chats_list?: string[] | null
          checkpoints_text?: string | null
          ciaa_id_text?: string | null
          contact_card_file?: string | null
          contact_id_text?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_settings_list?: string[] | null
          custom_settings_visible_boolean?: boolean | null
          default_campaign_option_campaigns?: string | null
          device_height_text?: string | null
          device_type_text?: string | null
          devide_width_text?: string | null
          email_text?: string | null
          enable_session_logs_boolean?: boolean | null
          enabled_beta_features_list?: string[] | null
          feedback_requested_date?: number | null
          field_change_history_list?: string[] | null
          first_name_text?: string | null
          full_name_text?: string | null
          generated_avatars_list?: string[] | null
          icl_assignment_id_text?: string | null
          icl_code_text?: string | null
          icl_code1_custom_icl?: string | null
          icl_name_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          last_announcement_seen_date?: number | null
          last_image_generated_date?: number | null
          last_message_recieved_date?: number | null
          last_name_text?: string | null
          logins__unique_days__list?: number[] | null
          logins_list?: number[] | null
          mighty_link_text?: string | null
          modified_at?: string | null
          modified_email_text?: string | null
          new_role_option_role?: string | null
          opt_in_boolean?: boolean | null
          org_consultant_user?: string | null
          owner_downline_list?: string[] | null
          owner_portal_logins_list?: number[] | null
          phone_text?: string | null
          photo_image?: string | null
          promoting_owner_user?: string | null
          ranked_score_number?: number | null
          related_campaign_assignments_list?: string[] | null
          related_orders_list?: string[] | null
          related_routes_list?: string[] | null
          related_sas_list?: string[] | null
          related_user_team?: string | null
          removed_campaigns_list?: string[] | null
          rep_link_text?: string | null
          rep_opt_in_last_viewed_date_list?: number[] | null
          rep_opt_in_text?: string | null
          role_text?: string | null
          sms_sent_count_number?: number | null
          status_option_user_status?: string | null
          temp_password_text?: string | null
          user_signed_up?: boolean | null
          vcard_list?: string[] | null
          vcardfr_text?: string | null
          web_notification_key_text?: string | null
        }
        Update: {
          account_id_text?: string | null
          account_name_text?: string | null
          active_session_log?: string | null
          assigned_campaigns_list?: string[] | null
          assigned_territories_count_number?: number | null
          assigned_territories_list?: string[] | null
          auth_user_id?: string | null
          avatar_prompts_list?: string[] | null
          bio_last_updated_date?: number | null
          bio_text?: string | null
          bubble_id?: string
          campaign_agent_code_text?: string | null
          chats_list?: string[] | null
          checkpoints_text?: string | null
          ciaa_id_text?: string | null
          contact_card_file?: string | null
          contact_id_text?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_settings_list?: string[] | null
          custom_settings_visible_boolean?: boolean | null
          default_campaign_option_campaigns?: string | null
          device_height_text?: string | null
          device_type_text?: string | null
          devide_width_text?: string | null
          email_text?: string | null
          enable_session_logs_boolean?: boolean | null
          enabled_beta_features_list?: string[] | null
          feedback_requested_date?: number | null
          field_change_history_list?: string[] | null
          first_name_text?: string | null
          full_name_text?: string | null
          generated_avatars_list?: string[] | null
          icl_assignment_id_text?: string | null
          icl_code_text?: string | null
          icl_code1_custom_icl?: string | null
          icl_name_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          last_announcement_seen_date?: number | null
          last_image_generated_date?: number | null
          last_message_recieved_date?: number | null
          last_name_text?: string | null
          logins__unique_days__list?: number[] | null
          logins_list?: number[] | null
          mighty_link_text?: string | null
          modified_at?: string | null
          modified_email_text?: string | null
          new_role_option_role?: string | null
          opt_in_boolean?: boolean | null
          org_consultant_user?: string | null
          owner_downline_list?: string[] | null
          owner_portal_logins_list?: number[] | null
          phone_text?: string | null
          photo_image?: string | null
          promoting_owner_user?: string | null
          ranked_score_number?: number | null
          related_campaign_assignments_list?: string[] | null
          related_orders_list?: string[] | null
          related_routes_list?: string[] | null
          related_sas_list?: string[] | null
          related_user_team?: string | null
          removed_campaigns_list?: string[] | null
          rep_link_text?: string | null
          rep_opt_in_last_viewed_date_list?: number[] | null
          rep_opt_in_text?: string | null
          role_text?: string | null
          sms_sent_count_number?: number | null
          status_option_user_status?: string | null
          temp_password_text?: string | null
          user_signed_up?: boolean | null
          vcard_list?: string[] | null
          vcardfr_text?: string | null
          web_notification_key_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
        ]
      }
      zip_code_assignments: {
        Row: {
          assigned_icls_list: string[] | null
          bubble_id: string
          count_of_leads_number: number | null
          country_text: string | null
          created_at: string | null
          created_by: string | null
          data_layer_text: string | null
          icon_text: string | null
          id: string
          last_activity_date: number | null
          modified_at: string | null
          name_text: string | null
          owner_text: string | null
          population_number: number | null
          potential_business_count_number: number | null
          related_territories_list: string[] | null
          related_zip_code_icl_assignments_list: string[] | null
          reprocess_boolean: boolean | null
          rested_date_date: number | null
          shape_color_text: string | null
          source_text: string | null
          square_ft_number: number | null
          state_text: string | null
          status_text: string | null
          tags_list: string[] | null
          zip_and_count_text: string | null
          zip_code__number__number: number | null
        }
        Insert: {
          assigned_icls_list?: string[] | null
          bubble_id: string
          count_of_leads_number?: number | null
          country_text?: string | null
          created_at?: string | null
          created_by?: string | null
          data_layer_text?: string | null
          icon_text?: string | null
          id?: string
          last_activity_date?: number | null
          modified_at?: string | null
          name_text?: string | null
          owner_text?: string | null
          population_number?: number | null
          potential_business_count_number?: number | null
          related_territories_list?: string[] | null
          related_zip_code_icl_assignments_list?: string[] | null
          reprocess_boolean?: boolean | null
          rested_date_date?: number | null
          shape_color_text?: string | null
          source_text?: string | null
          square_ft_number?: number | null
          state_text?: string | null
          status_text?: string | null
          tags_list?: string[] | null
          zip_and_count_text?: string | null
          zip_code__number__number?: number | null
        }
        Update: {
          assigned_icls_list?: string[] | null
          bubble_id?: string
          count_of_leads_number?: number | null
          country_text?: string | null
          created_at?: string | null
          created_by?: string | null
          data_layer_text?: string | null
          icon_text?: string | null
          id?: string
          last_activity_date?: number | null
          modified_at?: string | null
          name_text?: string | null
          owner_text?: string | null
          population_number?: number | null
          potential_business_count_number?: number | null
          related_territories_list?: string[] | null
          related_zip_code_icl_assignments_list?: string[] | null
          reprocess_boolean?: boolean | null
          rested_date_date?: number | null
          shape_color_text?: string | null
          source_text?: string | null
          square_ft_number?: number | null
          state_text?: string | null
          status_text?: string | null
          tags_list?: string[] | null
          zip_and_count_text?: string | null
          zip_code__number__number?: number | null
        }
        Relationships: []
      }
      zip_code_icl_assignments: {
        Row: {
          assigned_date_date: number | null
          bubble_id: string
          created_at: string | null
          created_by: string | null
          icl_custom_icl: string | null
          icl_uuid: string | null
          id: string
          last_worked__date: number | null
          leads_imported_date: number | null
          modified_at: string | null
          name_text: string | null
          related_territories_list: string[] | null
          rested_date_date: number | null
          shared_icl_custom_icl: string | null
          shared_icl_uuid: string | null
          shared_icls_list: string[] | null
          status_option_zip_code_assignment_status: string | null
          tags_list: string[] | null
          zip_code_custom_zip_code_assignments: string | null
          zip_code_uuid: string | null
        }
        Insert: {
          assigned_date_date?: number | null
          bubble_id: string
          created_at?: string | null
          created_by?: string | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          last_worked__date?: number | null
          leads_imported_date?: number | null
          modified_at?: string | null
          name_text?: string | null
          related_territories_list?: string[] | null
          rested_date_date?: number | null
          shared_icl_custom_icl?: string | null
          shared_icl_uuid?: string | null
          shared_icls_list?: string[] | null
          status_option_zip_code_assignment_status?: string | null
          tags_list?: string[] | null
          zip_code_custom_zip_code_assignments?: string | null
          zip_code_uuid?: string | null
        }
        Update: {
          assigned_date_date?: number | null
          bubble_id?: string
          created_at?: string | null
          created_by?: string | null
          icl_custom_icl?: string | null
          icl_uuid?: string | null
          id?: string
          last_worked__date?: number | null
          leads_imported_date?: number | null
          modified_at?: string | null
          name_text?: string | null
          related_territories_list?: string[] | null
          rested_date_date?: number | null
          shared_icl_custom_icl?: string | null
          shared_icl_uuid?: string | null
          shared_icls_list?: string[] | null
          status_option_zip_code_assignment_status?: string | null
          tags_list?: string[] | null
          zip_code_custom_zip_code_assignments?: string | null
          zip_code_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_zcia_icl"
            columns: ["icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_zcia_shared_icl"
            columns: ["shared_icl_uuid"]
            isOneToOne: false
            referencedRelation: "icls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_zcia_zip_code"
            columns: ["zip_code_uuid"]
            isOneToOne: false
            referencedRelation: "zip_code_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      zip_import_jobs: {
        Row: {
          batches_failed: number | null
          batches_succeeded: number | null
          bubble_version: string
          completed_at: string | null
          created_at: string | null
          defaults: Json | null
          error_message: string | null
          id: string
          max_retries: number | null
          postal_code: string
          retry_count: number | null
          status: string
          territory_id: string | null
          total_batches: number | null
          total_found: number | null
          total_posted: number | null
          updated_at: string | null
          workflow_success: boolean | null
          workflow_triggered: boolean | null
        }
        Insert: {
          batches_failed?: number | null
          batches_succeeded?: number | null
          bubble_version?: string
          completed_at?: string | null
          created_at?: string | null
          defaults?: Json | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          postal_code: string
          retry_count?: number | null
          status?: string
          territory_id?: string | null
          total_batches?: number | null
          total_found?: number | null
          total_posted?: number | null
          updated_at?: string | null
          workflow_success?: boolean | null
          workflow_triggered?: boolean | null
        }
        Update: {
          batches_failed?: number | null
          batches_succeeded?: number | null
          bubble_version?: string
          completed_at?: string | null
          created_at?: string | null
          defaults?: Json | null
          error_message?: string | null
          id?: string
          max_retries?: number | null
          postal_code?: string
          retry_count?: number | null
          status?: string
          territory_id?: string | null
          total_batches?: number | null
          total_found?: number | null
          total_posted?: number | null
          updated_at?: string | null
          workflow_success?: boolean | null
          workflow_triggered?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      business_leads_by_postal_code: {
        Row: {
          lead_count: number | null
          postal_code: string | null
        }
        Relationships: []
      }
      business_leads_by_postal_code_ca: {
        Row: {
          lead_count: number | null
          postal_code: string | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown
          f_table_catalog: unknown
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown
          f_table_catalog: string | null
          f_table_name: unknown
          f_table_schema: unknown
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown
          f_table_catalog?: string | null
          f_table_name?: unknown
          f_table_schema?: unknown
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      v_all_option_sets: {
        Row: {
          display_name: string | null
          option_set: string | null
          sort_order: number | null
          value: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _postgis_deprecate: {
        Args: { newname: string; oldname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { col: string; tbl: unknown }
        Returns: unknown
      }
      _postgis_pgsql_version: { Args: never; Returns: string }
      _postgis_scripts_pgsql_version: { Args: never; Returns: string }
      _postgis_selectivity: {
        Args: { att_name: string; geom: unknown; mode?: string; tbl: unknown }
        Returns: number
      }
      _postgis_stats: {
        Args: { ""?: string; att_name: string; tbl: unknown }
        Returns: string
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_sortablehash: { Args: { geom: unknown }; Returns: number }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          clip?: unknown
          g1: unknown
          return_polygons?: boolean
          tolerance?: number
        }
        Returns: unknown
      }
      _st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      addauth: { Args: { "": string }; Returns: boolean }
      addgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              new_dim: number
              new_srid_in: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              schema_name: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              new_dim: number
              new_srid: number
              new_type: string
              table_name: string
              use_typmod?: boolean
            }
            Returns: string
          }
      backfill_uuid_fks: { Args: never; Returns: Json }
      backfill_uuid_fks_aci: { Args: never; Returns: Json }
      backfill_uuid_fks_large: { Args: never; Returns: Json }
      batch_update_geometry: {
        Args: { record_ids: string[] }
        Returns: {
          error_count: number
          updated_count: number
        }[]
      }
      bubble_epoch_to_timestamp: { Args: { epoch_ms: number }; Returns: string }
      cleanup_staging_tables: {
        Args: never
        Returns: {
          execution_time_ms: number
          tables_cleaned: string[]
        }[]
      }
      create_parent_lead_mapping: {
        Args: never
        Returns: {
          execution_time_ms: number
          total_mapped: number
          total_unmatched: number
        }[]
      }
      create_parent_lead_mapping_batched: {
        Args: { batch_size?: number }
        Returns: {
          execution_time_ms: number
          total_mapped: number
          total_unmatched: number
        }[]
      }
      create_web_mercator_point: {
        Args: { lat: number; lng: number }
        Returns: unknown
      }
      create_wgs84_point: {
        Args: { lat: number; lng: number }
        Returns: unknown
      }
      disablelongtransactions: { Args: never; Returns: string }
      dropgeometrycolumn:
        | {
            Args: {
              catalog_name: string
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | {
            Args: {
              column_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { column_name: string; table_name: string }; Returns: string }
      dropgeometrytable:
        | {
            Args: {
              catalog_name: string
              schema_name: string
              table_name: string
            }
            Returns: string
          }
        | { Args: { schema_name: string; table_name: string }; Returns: string }
        | { Args: { table_name: string }; Returns: string }
      enablelongtransactions: { Args: never; Returns: string }
      equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      estimate_backfill_completion: {
        Args: { p_job_name: string; p_total_records: number }
        Returns: {
          avg_records_per_minute: number
          estimated_completion: string
          estimated_hours_remaining: number
          records_remaining: number
        }[]
      }
      export_mapping_to_csv: {
        Args: { chunk_size?: number; csv_file_path: string }
        Returns: {
          execution_time_ms: number
          total_chunks: number
          total_exported: number
        }[]
      }
      extract_bid: { Args: { val: string }; Returns: string }
      extract_bubble_id: { Args: { lookup_value: string }; Returns: string }
      find_nearby_leads_for_bubble: {
        Args: {
          k?: number
          lat: number
          lon: number
          p_lead_source?: string
          p_status?: string
          radius_m?: number
        }
        Returns: {
          "Business Name": string
          "Business Type (Manual)": string
          "Business Types": Json
          City: string
          "External Unified ID": string
          "Full Address (text)": string
          "Google Place ID": string
          Latitude: number
          "Lead Source": string
          Longitude: number
          State: string
          Status: string
          "Street #": number
          "Street Name": string
          "Zip Code": string
          "Zip Code (text)": string
        }[]
      }
      geometry: { Args: { "": string }; Returns: unknown }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geomfromewkt: { Args: { "": string }; Returns: unknown }
      get_active_order_campaigns: {
        Args: { cutoff_date: string }
        Returns: {
          campaign: string
          order_count: number
        }[]
      }
      get_backfill_stats: {
        Args: never
        Returns: {
          mapping_created_at: string
          mapping_total: number
          stage_processed: number
          stage_total: number
          stage_unprocessed: number
        }[]
      }
      get_campaign_orders_for_csv: {
        Args: { p_campaign: string; p_cutoff_date: string }
        Returns: {
          order_data: Json
        }[]
      }
      get_my_icl_uuid: { Args: never; Returns: string }
      get_my_role: { Args: never; Returns: string }
      get_my_user_id: { Args: never; Returns: string }
      gettransactionid: { Args: never; Returns: unknown }
      im_unaccent: { Args: { t: string }; Returns: string }
      initialize_backfill_job: {
        Args: { p_config?: Json; p_job_name: string }
        Returns: {
          created_at: string
          job_name: string
          status: string
        }[]
      }
      initialize_geometry_backfill_job: {
        Args: { p_config?: Json; p_job_name: string }
        Returns: {
          created_at: string
          job_name: string
          status: string
        }[]
      }
      is_valid_coordinate: {
        Args: { lat: number; lng: number }
        Returns: boolean
      }
      load_bubble_csv_data: {
        Args: { csv_file_path: string }
        Returns: {
          execution_time_ms: number
          total_loaded: number
          total_skipped: number
        }[]
      }
      longtransactionsenabled: { Args: never; Returns: boolean }
      lrt_append_audit_log: {
        Args: {
          p_field_name: string | null
          p_new_value: string | null
          p_old_value: string | null
          p_request_id: string
        }
        Returns: string
      }
      lrt_is_territory_team: { Args: never; Returns: boolean }
      populate_geometry_columns:
        | { Args: { tbl_oid: unknown; use_typmod?: boolean }; Returns: number }
        | { Args: { use_typmod?: boolean }; Returns: string }
      postgis_constraint_dims: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomcolumn: string; geomschema: string; geomtable: string }
        Returns: string
      }
      postgis_extensions_upgrade: { Args: never; Returns: string }
      postgis_full_version: { Args: never; Returns: string }
      postgis_geos_version: { Args: never; Returns: string }
      postgis_lib_build_date: { Args: never; Returns: string }
      postgis_lib_revision: { Args: never; Returns: string }
      postgis_lib_version: { Args: never; Returns: string }
      postgis_libjson_version: { Args: never; Returns: string }
      postgis_liblwgeom_version: { Args: never; Returns: string }
      postgis_libprotobuf_version: { Args: never; Returns: string }
      postgis_libxml_version: { Args: never; Returns: string }
      postgis_proj_version: { Args: never; Returns: string }
      postgis_scripts_build_date: { Args: never; Returns: string }
      postgis_scripts_installed: { Args: never; Returns: string }
      postgis_scripts_released: { Args: never; Returns: string }
      postgis_svn_version: { Args: never; Returns: string }
      postgis_type_name: {
        Args: {
          coord_dimension: number
          geomname: string
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_version: { Args: never; Returns: string }
      postgis_wagyu_version: { Args: never; Returns: string }
      seed_default_csv_config: {
        Args: { p_campaign: string }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      snake_to_title: { Args: { snake_text: string }; Returns: string }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle:
        | { Args: { line1: unknown; line2: unknown }; Returns: number }
        | {
            Args: { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
            Returns: number
          }
      st_area:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkt: { Args: { "": string }; Returns: string }
      st_asgeojson:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | {
            Args: {
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
              r: Record<string, unknown>
            }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_asgml:
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
            }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
        | {
            Args: {
              geog: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown
              id?: string
              maxdecimaldigits?: number
              nprefix?: string
              options?: number
              version: number
            }
            Returns: string
          }
      st_askml:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: { Args: { format?: string; geom: unknown }; Returns: string }
      st_asmvtgeom: {
        Args: {
          bounds: unknown
          buffer?: number
          clip_geom?: boolean
          extent?: number
          geom: unknown
        }
        Returns: unknown
      }
      st_assvg:
        | {
            Args: { geog: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | {
            Args: { geom: unknown; maxdecimaldigits?: number; rel?: number }
            Returns: string
          }
        | { Args: { "": string }; Returns: string }
      st_astext: { Args: { "": string }; Returns: string }
      st_astwkb:
        | {
            Args: {
              geom: unknown
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_m?: number
              prec_z?: number
              with_boxes?: boolean
              with_sizes?: boolean
            }
            Returns: string
          }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: number }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_boundingdiagonal: {
        Args: { fits?: boolean; geom: unknown }
        Returns: unknown
      }
      st_buffer:
        | {
            Args: { geom: unknown; options?: string; radius: number }
            Returns: unknown
          }
        | {
            Args: { geom: unknown; quadsegs: number; radius: number }
            Returns: unknown
          }
      st_centroid: { Args: { "": string }; Returns: unknown }
      st_clipbybox2d: {
        Args: { box: unknown; geom: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collect: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_concavehull: {
        Args: {
          param_allow_holes?: boolean
          param_geom: unknown
          param_pctconvex: number
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_coorddim: { Args: { geometry: unknown }; Returns: number }
      st_coveredby:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_covers:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_crosses: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_curvetoline: {
        Args: { flags?: number; geom: unknown; tol?: number; toltype?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { flags?: number; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance:
        | {
            Args: { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
            Returns: number
          }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
      st_distancesphere:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: number }
        | {
            Args: { geom1: unknown; geom2: unknown; radius: number }
            Returns: number
          }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_equals: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_expand:
        | { Args: { box: unknown; dx: number; dy: number }; Returns: unknown }
        | {
            Args: { box: unknown; dx: number; dy: number; dz?: number }
            Returns: unknown
          }
        | {
            Args: {
              dm?: number
              dx: number
              dy: number
              dz?: number
              geom: unknown
            }
            Returns: unknown
          }
      st_force3d: { Args: { geom: unknown; zvalue?: number }; Returns: unknown }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; mvalue?: number; zvalue?: number }
        Returns: unknown
      }
      st_generatepoints:
        | { Args: { area: unknown; npoints: number }; Returns: unknown }
        | {
            Args: { area: unknown; npoints: number; seed: number }
            Returns: unknown
          }
      st_geogfromtext: { Args: { "": string }; Returns: unknown }
      st_geographyfromtext: { Args: { "": string }; Returns: unknown }
      st_geohash:
        | { Args: { geog: unknown; maxchars?: number }; Returns: string }
        | { Args: { geom: unknown; maxchars?: number }; Returns: string }
      st_geomcollfromtext: { Args: { "": string }; Returns: unknown }
      st_geometricmedian: {
        Args: {
          fail_if_not_converged?: boolean
          g: unknown
          max_iter?: number
          tolerance?: number
        }
        Returns: unknown
      }
      st_geometryfromtext: { Args: { "": string }; Returns: unknown }
      st_geomfromewkt: { Args: { "": string }; Returns: unknown }
      st_geomfromgeojson:
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": Json }; Returns: unknown }
        | { Args: { "": string }; Returns: unknown }
      st_geomfromgml: { Args: { "": string }; Returns: unknown }
      st_geomfromkml: { Args: { "": string }; Returns: unknown }
      st_geomfrommarc21: { Args: { marc21xml: string }; Returns: unknown }
      st_geomfromtext: { Args: { "": string }; Returns: unknown }
      st_gmltosql: { Args: { "": string }; Returns: unknown }
      st_hasarc: { Args: { geometry: unknown }; Returns: boolean }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects:
        | { Args: { geog1: unknown; geog2: unknown }; Returns: boolean }
        | { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_isvaliddetail: {
        Args: { flags?: number; geom: unknown }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
        SetofOptions: {
          from: "*"
          to: "valid_detail"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      st_length:
        | { Args: { geog: unknown; use_spheroid?: boolean }; Returns: number }
        | { Args: { "": string }; Returns: number }
      st_letters: { Args: { font?: Json; letters: string }; Returns: unknown }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { nprecision?: number; txtin: string }
        Returns: unknown
      }
      st_linefromtext: { Args: { "": string }; Returns: unknown }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linetocurve: { Args: { geometry: unknown }; Returns: unknown }
      st_locatealong: {
        Args: { geometry: unknown; leftrightoffset?: number; measure: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          frommeasure: number
          geometry: unknown
          leftrightoffset?: number
          tomeasure: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { fromelevation: number; geometry: unknown; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_mlinefromtext: { Args: { "": string }; Returns: unknown }
      st_mpointfromtext: { Args: { "": string }; Returns: unknown }
      st_mpolyfromtext: { Args: { "": string }; Returns: unknown }
      st_multilinestringfromtext: { Args: { "": string }; Returns: unknown }
      st_multipointfromtext: { Args: { "": string }; Returns: unknown }
      st_multipolygonfromtext: { Args: { "": string }; Returns: unknown }
      st_node: { Args: { g: unknown }; Returns: unknown }
      st_normalize: { Args: { geom: unknown }; Returns: unknown }
      st_offsetcurve: {
        Args: { distance: number; line: unknown; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_pointfromtext: { Args: { "": string }; Returns: unknown }
      st_pointm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
        }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          mcoordinate: number
          srid?: number
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
        }
        Returns: unknown
      }
      st_polyfromtext: { Args: { "": string }; Returns: unknown }
      st_polygonfromtext: { Args: { "": string }; Returns: unknown }
      st_project: {
        Args: { azimuth: number; distance: number; geog: unknown }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_m?: number
          prec_x: number
          prec_y?: number
          prec_z?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: { Args: { geom1: unknown; geom2: unknown }; Returns: string }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid:
        | { Args: { geog: unknown; srid: number }; Returns: unknown }
        | { Args: { geom: unknown; srid: number }; Returns: unknown }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; is_outer?: boolean; vertex_fraction: number }
        Returns: unknown
      }
      st_split: { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
      st_square: {
        Args: { cell_i: number; cell_j: number; origin?: unknown; size: number }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { bounds: unknown; size: number }
        Returns: Record<string, unknown>[]
      }
      st_srid:
        | { Args: { geog: unknown }; Returns: number }
        | { Args: { geom: unknown }; Returns: number }
      st_subdivide: {
        Args: { geom: unknown; gridsize?: number; maxvertices?: number }
        Returns: unknown[]
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          bounds?: unknown
          margin?: number
          x: number
          y: number
          zoom: number
        }
        Returns: unknown
      }
      st_touches: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_transform:
        | {
            Args: { from_proj: string; geom: unknown; to_proj: string }
            Returns: unknown
          }
        | {
            Args: { from_proj: string; geom: unknown; to_srid: number }
            Returns: unknown
          }
        | { Args: { geom: unknown; to_proj: string }; Returns: unknown }
      st_triangulatepolygon: { Args: { g1: unknown }; Returns: unknown }
      st_union:
        | { Args: { geom1: unknown; geom2: unknown }; Returns: unknown }
        | {
            Args: { geom1: unknown; geom2: unknown; gridsize: number }
            Returns: unknown
          }
      st_voronoilines: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { extend_to?: unknown; g1: unknown; tolerance?: number }
        Returns: unknown
      }
      st_within: { Args: { geom1: unknown; geom2: unknown }; Returns: boolean }
      st_wkbtosql: { Args: { wkb: string }; Returns: unknown }
      st_wkttosql: { Args: { "": string }; Returns: unknown }
      st_wrapx: {
        Args: { geom: unknown; move: number; wrap: number }
        Returns: unknown
      }
      strip_lk: { Args: { val: string }; Returns: string }
      unaccent: { Args: { "": string }; Returns: string }
      unlockrows: { Args: { "": string }; Returns: number }
      update_staging_with_business_lead_ids: {
        Args: { batch_size?: number }
        Returns: {
          execution_time_ms: number
          total_unmatched: number
          total_updated: number
        }[]
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          column_name: string
          new_srid_in: number
          schema_name: string
          table_name: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      geometry_dump: {
        path: number[] | null
        geom: unknown
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown
      }
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

/** App-facing profile role (DB column is `text`). */
export type LrtProfileRole =
  Database["public"]["Tables"]["lrt_profiles"]["Row"]["role"];
