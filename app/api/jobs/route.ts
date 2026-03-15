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
  const urgency = searchParams.get('urgency')
  const status = searchParams.get('status') || 'open'
  const minBudget = searchParams.get('min_budget')
  const maxBudget = searchParams.get('max_budget')
  const limit = searchParams.get('limit') || '20'
  const offset = searchParams.get('offset') || '0'

  let query = supabase
    .from('jobs')
    .select(`
      *,
      client:users!jobs_client_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      job_photos(*)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

  if (category) {
    query = query.eq('category', category)
  }

  if (urgency) {
    query = query.eq('urgency', urgency)
  }

  if (minBudget) {
    query = query.gte('budget_max', parseInt(minBudget))
  }

  if (maxBudget) {
    query = query.lte('budget_min', parseInt(maxBudget))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ jobs: data })
}

export async function POST(request: NextRequest) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is a client
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'client') {
    return NextResponse.json({ error: 'Only clients can post jobs' }, { status: 403 })
  }

  const body = await request.json()
  const {
    title,
    category,
    description,
    location_address,
    location_lat,
    location_lng,
    budget_min,
    budget_max,
    urgency,
    timeframe,
    photos,
  } = body

  // Create job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      client_id: user.id,
      title,
      category,
      description,
      location_address,
      location_lat,
      location_lng,
      budget_min,
      budget_max,
      urgency,
      timeframe,
      status: 'open',
    })
    .select()
    .single()

  if (jobError) {
    return NextResponse.json({ error: jobError.message }, { status: 500 })
  }

  // Add photos if provided
  if (photos && photos.length > 0) {
    const photoInserts = photos.map((photoUrl: string) => ({
      job_id: job.id,
      photo_url: photoUrl,
    }))

    await supabase.from('job_photos').insert(photoInserts)
  }

  return NextResponse.json({ job }, { status: 201 })
}