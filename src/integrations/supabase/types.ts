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
      editais: {
        Row: {
          ano: number | null
          banca: string | null
          cargo: string | null
          created_at: string
          id: string
          municipio: string | null
          pdf_storage_path: string | null
          status: string
          status_message: string | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: number | null
          banca?: string | null
          cargo?: string | null
          created_at?: string
          id?: string
          municipio?: string | null
          pdf_storage_path?: string | null
          status?: string
          status_message?: string | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number | null
          banca?: string | null
          cargo?: string | null
          created_at?: string
          id?: string
          municipio?: string | null
          pdf_storage_path?: string | null
          status?: string
          status_message?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      edital_materias: {
        Row: {
          created_at: string
          edital_id: string
          id: string
          nome: string
          num_questoes: number | null
          peso: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          edital_id: string
          id?: string
          nome: string
          num_questoes?: number | null
          peso?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          edital_id?: string
          id?: string
          nome?: string
          num_questoes?: number | null
          peso?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "edital_materias_edital_id_fkey"
            columns: ["edital_id"]
            isOneToOne: false
            referencedRelation: "editais"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_generations: {
        Row: {
          banca: string | null
          created_at: string
          id: string
          nivel: string
          num_questoes: number
          resultado: string
          tema: string
          titulo: string
          user_id: string
        }
        Insert: {
          banca?: string | null
          created_at?: string
          id?: string
          nivel: string
          num_questoes: number
          resultado: string
          tema: string
          titulo: string
          user_id: string
        }
        Update: {
          banca?: string | null
          created_at?: string
          id?: string
          nivel?: string
          num_questoes?: number
          resultado?: string
          tema?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_exam_cache: {
        Row: {
          banca: string
          cache_key: string
          cargo: string | null
          created_at: string
          id: string
          nivel: string
          num_alternativas: number
          quantidade: number
          resultado: string
          source_user_id: string | null
          tema: string
          updated_at: string
          use_count: number
        }
        Insert: {
          banca?: string
          cache_key: string
          cargo?: string | null
          created_at?: string
          id?: string
          nivel: string
          num_alternativas: number
          quantidade: number
          resultado: string
          source_user_id?: string | null
          tema: string
          updated_at?: string
          use_count?: number
        }
        Update: {
          banca?: string
          cache_key?: string
          cargo?: string | null
          created_at?: string
          id?: string
          nivel?: string
          num_alternativas?: number
          quantidade?: number
          resultado?: string
          source_user_id?: string | null
          tema?: string
          updated_at?: string
          use_count?: number
        }
        Relationships: []
      }
      generation_logs: {
        Row: {
          cost_usd: number | null
          created_at: string
          feature: string
          id: string
          meta: Json | null
          user_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string
          feature: string
          id?: string
          meta?: Json | null
          user_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string
          feature?: string
          id?: string
          meta?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          id: number
          path: string
          referrer: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
          visitor_id: string
        }
        Insert: {
          id?: number
          path: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          visitor_id: string
        }
        Update: {
          id?: number
          path?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          visitor_id?: string
        }
        Relationships: []
      }
      payment_submissions: {
        Row: {
          amount_cents: number
          coupon_code: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          payment_method: string
          pix_payload: string
          proof_file_name: string
          proof_mime_type: string | null
          proof_size_bytes: number | null
          proof_storage_path: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          coupon_code?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          payment_method?: string
          pix_payload: string
          proof_file_name: string
          proof_mime_type?: string | null
          proof_size_bytes?: number | null
          proof_storage_path: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          coupon_code?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          payment_method?: string
          pix_payload?: string
          proof_file_name?: string
          proof_mime_type?: string | null
          proof_size_bytes?: number | null
          proof_storage_path?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pix_payments: {
        Row: {
          comprovante_url: string | null
          concurso_slug: string
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          status: string
          user_id: string
          valor_centavos: number
        }
        Insert: {
          comprovante_url?: string | null
          concurso_slug: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id: string
          valor_centavos: number
        }
        Update: {
          comprovante_url?: string | null
          concurso_slug?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id?: string
          valor_centavos?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area_foco: string | null
          concurso_slug: string
          created_at: string
          email: string | null
          full_name: string | null
          has_lifetime_access: boolean
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_foco?: string | null
          concurso_slug?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_lifetime_access?: boolean
          id: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_foco?: string | null
          concurso_slug?: string
          created_at?: string
          email?: string | null
          full_name?: string | null
          has_lifetime_access?: boolean
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prova_attempts: {
        Row: {
          answers: Json
          correct_answers: number
          created_at: string
          duration_seconds: number | null
          finished_at: string | null
          id: string
          percentage: number
          prova_id: string
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json
          correct_answers: number
          created_at?: string
          duration_seconds?: number | null
          finished_at?: string | null
          id?: string
          percentage: number
          prova_id: string
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json
          correct_answers?: number
          created_at?: string
          duration_seconds?: number | null
          finished_at?: string | null
          id?: string
          percentage?: number
          prova_id?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prova_attempts_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "provas_importadas"
            referencedColumns: ["id"]
          },
        ]
      }
      prova_questoes_importadas: {
        Row: {
          alternativas: string[]
          created_at: string
          edited_by_user: boolean
          enunciado: string
          gabarito: string
          id: string
          justificativa: string | null
          justificativa_origem: string
          numero: number
          pagina_origem: number | null
          prova_id: string
          raw_extraction: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alternativas: string[]
          created_at?: string
          edited_by_user?: boolean
          enunciado: string
          gabarito: string
          id?: string
          justificativa?: string | null
          justificativa_origem?: string
          numero: number
          pagina_origem?: number | null
          prova_id: string
          raw_extraction?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alternativas?: string[]
          created_at?: string
          edited_by_user?: boolean
          enunciado?: string
          gabarito?: string
          id?: string
          justificativa?: string | null
          justificativa_origem?: string
          numero?: number
          pagina_origem?: number | null
          prova_id?: string
          raw_extraction?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prova_questoes_importadas_prova_id_fkey"
            columns: ["prova_id"]
            isOneToOne: false
            referencedRelation: "provas_importadas"
            referencedColumns: ["id"]
          },
        ]
      }
      provas_importadas: {
        Row: {
          ano: number | null
          attempts_count: number
          banca: string | null
          best_percentage: number | null
          cargo: string | null
          created_at: string
          extraction_completed_at: string | null
          extraction_cost_usd: number | null
          extraction_started_at: string | null
          gerar_justificativa_ia: boolean
          id: string
          num_alternativas: number
          num_paginas: number | null
          num_questoes: number
          num_questoes_aprovadas: number
          num_questoes_rejeitadas: number
          pdf_size_bytes: number | null
          pdf_storage_path: string | null
          status: string
          status_message: string | null
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ano?: number | null
          attempts_count?: number
          banca?: string | null
          best_percentage?: number | null
          cargo?: string | null
          created_at?: string
          extraction_completed_at?: string | null
          extraction_cost_usd?: number | null
          extraction_started_at?: string | null
          gerar_justificativa_ia?: boolean
          id?: string
          num_alternativas: number
          num_paginas?: number | null
          num_questoes?: number
          num_questoes_aprovadas?: number
          num_questoes_rejeitadas?: number
          pdf_size_bytes?: number | null
          pdf_storage_path?: string | null
          status?: string
          status_message?: string | null
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ano?: number | null
          attempts_count?: number
          banca?: string | null
          best_percentage?: number | null
          cargo?: string | null
          created_at?: string
          extraction_completed_at?: string | null
          extraction_cost_usd?: number | null
          extraction_started_at?: string | null
          gerar_justificativa_ia?: boolean
          id?: string
          num_alternativas?: number
          num_paginas?: number | null
          num_questoes?: number
          num_questoes_aprovadas?: number
          num_questoes_rejeitadas?: number
          pdf_size_bytes?: number | null
          pdf_storage_path?: string | null
          status?: string
          status_message?: string | null
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_attempts: {
        Row: {
          alternativas: Json
          answered_at: string
          banca: string | null
          cargo_slug: string | null
          chosen_answer: string | null
          concurso_slug: string
          correct_answer: string
          enunciado: string
          explanation: string | null
          id: string
          is_correct: boolean
          nivel: string | null
          question_hash: string
          tema: string | null
          user_id: string
        }
        Insert: {
          alternativas?: Json
          answered_at?: string
          banca?: string | null
          cargo_slug?: string | null
          chosen_answer?: string | null
          concurso_slug?: string
          correct_answer: string
          enunciado: string
          explanation?: string | null
          id?: string
          is_correct: boolean
          nivel?: string | null
          question_hash: string
          tema?: string | null
          user_id: string
        }
        Update: {
          alternativas?: Json
          answered_at?: string
          banca?: string | null
          cargo_slug?: string | null
          chosen_answer?: string | null
          concurso_slug?: string
          correct_answer?: string
          enunciado?: string
          explanation?: string | null
          id?: string
          is_correct?: boolean
          nivel?: string | null
          question_hash?: string
          tema?: string | null
          user_id?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          alternativas: Json
          banca: string
          cargo_slug: string | null
          categoria: string
          comentario: string
          concurso_slug: string
          created_at: string
          enunciado: string
          gabarito: string
          generated_batch: string | null
          id: string
          materia_id: string
          nivel: string
          num_alternativas: number
          source_model: string | null
        }
        Insert: {
          alternativas: Json
          banca?: string
          cargo_slug?: string | null
          categoria: string
          comentario: string
          concurso_slug?: string
          created_at?: string
          enunciado: string
          gabarito: string
          generated_batch?: string | null
          id?: string
          materia_id: string
          nivel: string
          num_alternativas: number
          source_model?: string | null
        }
        Update: {
          alternativas?: Json
          banca?: string
          cargo_slug?: string | null
          categoria?: string
          comentario?: string
          concurso_slug?: string
          created_at?: string
          enunciado?: string
          gabarito?: string
          generated_batch?: string | null
          id?: string
          materia_id?: string
          nivel?: string
          num_alternativas?: number
          source_model?: string | null
        }
        Relationships: []
      }
      question_bank_seen: {
        Row: {
          question_id: string
          seen_at: string
          user_id: string
        }
        Insert: {
          question_id: string
          seen_at?: string
          user_id: string
        }
        Update: {
          question_id?: string
          seen_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_seen_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
        ]
      }
      review_queue: {
        Row: {
          alternativas: Json
          banca: string | null
          box: number
          cargo_slug: string | null
          concurso_slug: string
          correct_answer: string
          created_at: string
          enunciado: string
          explanation: string | null
          last_result: boolean | null
          next_review_at: string
          nivel: string | null
          question_hash: string
          tema: string | null
          times_correct: number
          times_seen: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alternativas?: Json
          banca?: string | null
          box?: number
          cargo_slug?: string | null
          concurso_slug?: string
          correct_answer: string
          created_at?: string
          enunciado: string
          explanation?: string | null
          last_result?: boolean | null
          next_review_at?: string
          nivel?: string | null
          question_hash: string
          tema?: string | null
          times_correct?: number
          times_seen?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alternativas?: Json
          banca?: string | null
          box?: number
          cargo_slug?: string | null
          concurso_slug?: string
          correct_answer?: string
          created_at?: string
          enunciado?: string
          explanation?: string | null
          last_result?: boolean | null
          next_review_at?: string
          nivel?: string | null
          question_hash?: string
          tema?: string | null
          times_correct?: number
          times_seen?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          access_expires_at: string | null
          created_at: string
          granted_at: string | null
          granted_by: string | null
          id: string
          notes: string | null
          payment_provider: string | null
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_expires_at?: string | null
          created_at?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          payment_provider?: string | null
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_expires_at?: string | null
          created_at?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          notes?: string | null
          payment_provider?: string | null
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      count_coupon_usage: { Args: { _code: string }; Returns: number }
      grade_review: {
        Args: { _got_it: boolean; _question_hash: string }
        Returns: undefined
      }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      landing_stats: { Args: never; Returns: Json }
      leitner_interval: { Args: { _box: number }; Returns: string }
      mark_questions_seen: { Args: { _ids: string[] }; Returns: undefined }
      pick_questions:
        | {
            Args: {
              _limit: number
              _materia_id: string
              _nivel: string
              _num_alternativas: number
            }
            Returns: {
              alternativas: Json
              banca: string
              cargo_slug: string | null
              categoria: string
              comentario: string
              concurso_slug: string
              created_at: string
              enunciado: string
              gabarito: string
              generated_batch: string | null
              id: string
              materia_id: string
              nivel: string
              num_alternativas: number
              source_model: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "question_bank"
              isOneToOne: false
              isSetofReturn: true
            }
          }
        | {
            Args: {
              _concurso_slug?: string
              _limit: number
              _materia_id: string
              _nivel: string
              _num_alternativas: number
            }
            Returns: {
              alternativas: Json
              banca: string
              cargo_slug: string | null
              categoria: string
              comentario: string
              concurso_slug: string
              created_at: string
              enunciado: string
              gabarito: string
              generated_batch: string | null
              id: string
              materia_id: string
              nivel: string
              num_alternativas: number
              source_model: string | null
            }[]
            SetofOptions: {
              from: "*"
              to: "question_bank"
              isOneToOne: false
              isSetofReturn: true
            }
          }
      question_bank_summary: { Args: never; Returns: Json }
      record_attempts: {
        Args: { _attempts: Json; _concurso_slug: string }
        Returns: undefined
      }
      save_questions_to_bank: { Args: { _questions: Json }; Returns: number }
      track_pageview: {
        Args: {
          _path: string
          _referrer?: string
          _user_agent?: string
          _visitor_id: string
        }
        Returns: undefined
      }
      traffic_summary: { Args: { _days?: number }; Returns: Json }
      user_performance_summary: {
        Args: { _concurso_slug: string }
        Returns: Json
      }
      wrong_questions_for_review: {
        Args: { _concurso_slug: string; _limit?: number }
        Returns: {
          alternativas: Json
          banca: string | null
          box: number
          cargo_slug: string | null
          concurso_slug: string
          correct_answer: string
          created_at: string
          enunciado: string
          explanation: string | null
          last_result: boolean | null
          next_review_at: string
          nivel: string | null
          question_hash: string
          tema: string | null
          times_correct: number
          times_seen: number
          updated_at: string
          user_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "review_queue"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      app_role: "admin"
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
    Enums: {
      app_role: ["admin"],
    },
  },
} as const
