// ⚠️ AUTO-GENERATED — DO NOT EDIT
// This file reflects the database schema. Update by running: supabase gen types typescript

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          id_number: string;
          user_type: 'zaair' | 'patur' | 'murshe' | null;
          is_registration_complete: boolean;
          deductions_summary: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          first_name?: string;
          last_name?: string;
          id_number?: string;
          user_type?: 'zaair' | 'patur' | 'murshe' | null;
          is_registration_complete?: boolean;
          deductions_summary?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          id_number?: string;
          user_type?: 'zaair' | 'patur' | 'murshe' | null;
          is_registration_complete?: boolean;
          deductions_summary?: Json | null;
          updated_at?: string;
        };
      };
      incomes: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          description: string;
          income_date: string;
          payment_method: string;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          document_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          description: string;
          income_date?: string;
          payment_method: string;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          description?: string;
          income_date?: string;
          payment_method?: string;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          document_url?: string | null;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category: string;
          description: string | null;
          expense_date: string;
          recognition_percentage: number;
          supplier_email: string | null;
          supplier_phone: string | null;
          document_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category: string;
          description?: string | null;
          expense_date?: string;
          recognition_percentage?: number;
          supplier_email?: string | null;
          supplier_phone?: string | null;
          document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category?: string;
          description?: string | null;
          expense_date?: string;
          recognition_percentage?: number;
          supplier_email?: string | null;
          supplier_phone?: string | null;
          document_url?: string | null;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'payment' | 'submission' | 'reminder' | 'update';
          read: boolean;
          due_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'payment' | 'submission' | 'reminder' | 'update';
          read?: boolean;
          due_date?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          message?: string;
          type?: 'info' | 'payment' | 'submission' | 'reminder' | 'update';
          read?: boolean;
          due_date?: string | null;
        };
      };
      invoice_sends: {
        Row: {
          id: string;
          user_id: string;
          income_id: string;
          recipient_email: string;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          income_id: string;
          recipient_email: string;
          sent_at?: string;
          created_at?: string;
        };
        Update: Record<string, never>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
