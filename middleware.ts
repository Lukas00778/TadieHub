import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
    : { data: null }

  const userRole = profile?.role || null

  const { pathname } = request.nextUrl

  // Define route access by role
  const authRoutes = ['/login', '/register']
  const clientRoutes = ['/dashboard', '/jobs', '/providers']
  const providerRoutes = ['/provider/dashboard', '/provider/jobs', '/provider/profile']
  const adminRoutes = ['/admin']

  // Check if user is authenticated
  const isAuthenticated = !!user
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isAuthenticated) {
    const redirectPath = userRole === 'admin' ? '/admin' : userRole === 'provider' ? '/provider/dashboard' : '/dashboard'
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based route protection
  if (isAuthenticated && userRole) {
    // Admin routes
    if (userRole === 'admin') {
      if (!adminRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
    }

    // Provider routes - only providers can access
    if (userRole === 'provider') {
      const isProviderRoute = providerRoutes.some((route) => pathname.startsWith(route))
      const isSharedRoute = pathname.startsWith('/messages') || pathname.startsWith('/bookings')

      if (!isProviderRoute && !isSharedRoute && pathname !== '/' && !pathname.startsWith('/provider')) {
        return NextResponse.redirect(new URL('/provider/dashboard', request.url))
      }
    }

    // Client routes - only clients can access
    if (userRole === 'client') {
      const isClientRoute = clientRoutes.some((route) => pathname.startsWith(route))
      const isSharedRoute = pathname.startsWith('/messages') || pathname.startsWith('/bookings')

      if (!isClientRoute && !isSharedRoute && pathname !== '/' && !pathname.startsWith('/client')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}