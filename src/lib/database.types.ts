export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// DNA attribute shape stored in book_dna.attributes (jsonb)
export type DnaCategory = 'form' | 'voice' | 'content' | 'experience' | 'quirk'
export type SurpriseLevel = 'recognizable' | 'subtle' | 'surprising'
export type RecommendationFeedback = 'loved' | 'interested' | 'not_for_me' | 'already_read'

export interface DnaAttribute {
  category: DnaCategory
  label: string
  explanation: string
  surprise_level: SurpriseLevel
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
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          author?: string | null
          published_year?: number | null
          description?: string | null
          cover_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          author?: string | null
          published_year?: number | null
          description?: string | null
          cover_url?: string | null
          created_at?: string
        }
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
      }
      recommendations: {
        Row: {
          id: string
          user_id: string
          recommended_book_id: string
          explanation: string
          based_on_book_ids: string[]
          generated_at: string
          feedback: RecommendationFeedback | null
          feedback_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          recommended_book_id: string
          explanation: string
          based_on_book_ids: string[]
          generated_at?: string
          feedback?: RecommendationFeedback | null
          feedback_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          recommended_book_id?: string
          explanation?: string
          based_on_book_ids?: string[]
          generated_at?: string
          feedback?: RecommendationFeedback | null
          feedback_at?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
