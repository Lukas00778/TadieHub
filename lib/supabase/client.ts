import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
  )
}

// Types for the application
export interface User {
  id: string
  email: string
  phone?: string
  full_name: string
  avatar_url?: string
  role: 'client' | 'provider' | 'admin'
  created_at: string
}

export interface Profile {
  user_id: string
  business_name?: string
  abn?: string
  bio?: string
  vehicle_type?: string
  tools_available?: string[]
  is_verified: boolean
  is_id_verified: boolean
  is_insurance_verified: boolean
  is_police_checked: boolean
}

export interface Job {
  id: string
  client_id: string
  title: string
  category: string
  description: string
  location_address: string
  location_lat?: number
  location_lng?: number
  budget_min?: number
  budget_max?: number
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  timeframe?: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

export interface Booking {
  id: string
  job_id: string
  provider_id: string
  client_id: string
  agreed_price: number
  scheduled_date?: string
  scheduled_time?: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  commission_paid: boolean
  created_at: string
}

export interface Message {
  id: string
  booking_id: string
  sender_id: string
  content?: string
  message_type: 'text' | 'photo' | 'location'
  created_at: string
}

export interface Review {
  id: string
  booking_id: string
  reviewer_id: string
  reviewee_id: string
  rating_quality: number
  rating_communication: number
  rating_punctuality: number
  rating_value: number
  comment?: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  body?: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

export interface ProviderRating {
  overall_rating: number
  quality_avg: number
  communication_avg: number
  punctuality_avg: number
  value_avg: number
  total_reviews: number
}