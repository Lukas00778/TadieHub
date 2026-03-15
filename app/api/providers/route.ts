import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll() {},
      },
    }
  )

  const searchParams = request.nextUrl.searchParams
  const category = searchParams.get('category')
  const minRating = searchParams.get('min_rating')
  const maxHourlyRate = searchParams.get('max_hourly_rate')
  const isVerified = searchParams.get('is_verified')
  const limit = searchParams.get('limit') || '20'
  const offset = searchParams.get('offset') || '0'

  // Get all providers first
  let query = supabase
    .from('users')
    .select(`
      *,
      profiles(*),
      provider_skills(*),
      provider_rates(*)
    `)
    .eq('role', 'provider')
    .order('created_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

  const { data: providers, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Get reviews for each provider to calculate ratings
  const providerIds = providers?.map((p) => p.id) || []

  if (providerIds.length > 0) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .in('reviewee_id', providerIds)

    // Calculate average ratings per provider
    const ratingsByProvider: Record<string, { total: number; count: number }> = {}
    reviews?.forEach((review) => {
      if (!ratingsByProvider[review.reviewee_id]) {
        ratingsByProvider[review.reviewee_id] = { total: 0, count: 0 }
      }
      const avg =
        (review.rating_quality +
          review.rating_communication +
          review.rating_punctuality +
          review.rating_value) /
        4
      ratingsByProvider[review.reviewee_id].total += avg
      ratingsByProvider[review.reviewee_id].count += 1
    })

    // Add ratings to providers
    providers?.forEach((provider) => {
      const rating = ratingsByProvider[provider.id]
      if (rating && rating.count > 0) {
        provider.overall_rating = rating.total / rating.count
        provider.total_reviews = rating.count
      } else {
        provider.overall_rating = 0
        provider.total_reviews = 0
      }
    })
  }

  // Apply filters
  let filteredProviders = providers || []

  if (category) {
    filteredProviders = filteredProviders.filter((p) =>
      p.provider_skills?.some((s: { skill_category: string }) => s.skill_category === category)
    )
  }

  if (minRating) {
    filteredProviders = filteredProviders.filter(
      (p) => p.overall_rating >= parseFloat(minRating)
    )
  }

  if (maxHourlyRate) {
    filteredProviders = filteredProviders.filter(
      (p) => !p.provider_rates?.[0] || p.provider_rates[0].hourly_rate <= parseInt(maxHourlyRate)
    )
  }

  if (isVerified === 'true') {
    filteredProviders = filteredProviders.filter((p) => p.profiles?.[0]?.is_verified)
  }

  return NextResponse.json({ providers: filteredProviders })
}