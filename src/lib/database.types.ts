export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type DnaCategory = 'form' | 'voice' | 'content' | 'experience' | 'quirk'
export type SurpriseLevel = 'recognizable' | 'subtle' | 'surprising'
export type RecommendationFeedback = 'loved' | 'interested' | 'not_for_me' | 'already_read'

export interface DnaAttribute {
  category: DnaCategory
  label: string
  explanation: string
  surprise_level: SurpriseLevel
}

export interface BreakdownItem {
  book: string
  connection: string
}

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string | null
          published_year: number | null
          description: string | null
          cover_url: string | null
          openlibrary_key: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          author?: string | null
          published_year?: number | null
          description?: string | null
          cover_url?: string | null
          openlibrary_key?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string | null
          published_year?: number | null
          description?: string | null
          cover_url?: string | null
          openlibrary_key?: string | null
          created_at?: string
        }
        Relationships: []
      }
      book_dna: {
        Row: {
          id: string
          book_id: string
          attributes: DnaAttribute[]
          generated_at: string
          model_used: string
        }
        Insert: {
          id?: string
          book_id: string
          attributes: DnaAttribute[]
          generated_at?: string
          model_used: string
        }
        Update: {
          id?: string
          book_id?: string
          attributes?: DnaAttribute[]
          generated_at?: string
          model_used?: string
        }
        Relationships: [
          {
            foreignKeyName: 'book_dna_book_id_fkey'
            columns: ['book_id']
            isOneToOne: true
            referencedRelation: 'books'
            referencedColumns: ['id']
          }
        ]
      }
      user_books: {
        Row: {
          id: string
          user_id: string
          book_id: string
          chips: string[] | null
          free_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          chips?: string[] | null
          free_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          chips?: string[] | null
          free_text?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_books_book_id_fkey'
            columns: ['book_id']
            isOneToOne: false
            referencedRelation: 'books'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'user_books_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          recommended_book_id: string
          explanation: string
          breakdown: BreakdownItem[] | null
          based_on_book_ids: string[]
          generated_at: string
          feedback: RecommendationFeedback | null
          feedback_at: string | null
          batch_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recommended_book_id: string
          explanation: string
          breakdown?: BreakdownItem[] | null
          based_on_book_ids: string[]
          generated_at?: string
          feedback?: RecommendationFeedback | null
          feedback_at?: string | null
          batch_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recommended_book_id?: string
          explanation?: string
          breakdown?: BreakdownItem[] | null
          based_on_book_ids?: string[]
          generated_at?: string
          feedback?: RecommendationFeedback | null
          feedback_at?: string | null
          batch_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'recommendations_recommended_book_id_fkey'
            columns: ['recommended_book_id']
            isOneToOne: false
            referencedRelation: 'books'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'recommendations_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}
