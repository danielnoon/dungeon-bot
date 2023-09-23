export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      creatures: {
        Row: {
          acc: number
          atk: number
          created_at: string
          def: number
          guild: string
          hp: number
          id: number
          image_url: string[]
          lck: number
          mgk: number
          mp: number
          name: string
          spd: number
        }
        Insert: {
          acc: number
          atk: number
          created_at?: string
          def: number
          guild: string
          hp: number
          id?: number
          image_url: string[]
          lck: number
          mgk: number
          mp: number
          name: string
          spd: number
        }
        Update: {
          acc?: number
          atk?: number
          created_at?: string
          def?: number
          guild?: string
          hp?: number
          id?: number
          image_url?: string[]
          lck?: number
          mgk?: number
          mp?: number
          name?: string
          spd?: number
        }
        Relationships: [
          {
            foreignKeyName: "creatures_guild_fkey"
            columns: ["guild"]
            referencedRelation: "guild"
            referencedColumns: ["id"]
          }
        ]
      }
      guild: {
        Row: {
          created_at: string
          dm: string
          id: string
        }
        Insert: {
          created_at?: string
          dm: string
          id: string
        }
        Update: {
          created_at?: string
          dm?: string
          id?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          guild: string
          id: number
          name: string
          portrait: string | null
          user: string
        }
        Insert: {
          created_at?: string
          guild: string
          id?: number
          name: string
          portrait?: string | null
          user: string
        }
        Update: {
          created_at?: string
          guild?: string
          id?: number
          name?: string
          portrait?: string | null
          user?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_guild_fkey"
            columns: ["guild"]
            referencedRelation: "guild"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
