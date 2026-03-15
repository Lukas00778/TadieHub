'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Bell, Menu, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn, getInitials } from '@/lib/utils'

interface NavbarProps {
  user?: {
    id: string
    email: string
    full_name: string
    role: string
    avatar_url?: string
  }
}

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navLinks = user?.role === 'provider'
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/jobs', label: 'Find Jobs' },
        { href: '/bookings', label: 'My Jobs' },
        { href: '/messages', label: 'Messages' },
      ]
    : user?.role === 'admin'
    ? [
        { href: '/admin', label: 'Admin' },
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/jobs', label: 'Jobs' },
        { href: '/admin/analytics', label: 'Analytics' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/jobs', label: 'My Jobs' },
        { href: '/providers', label: 'Find Tradies' },
        { href: '/messages', label: 'Messages' },
      ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={user ? '/dashboard' : '/'} className="flex items-center">
              <span className="text-xl font-bold text-emerald-600">TradieHub</span>
            </Link>

            {user && (
              <div className="hidden md:flex ml-10 space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-emerald-700">
                        {getInitials(user.full_name)}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="md:hidden p-2 text-gray-500 hover:text-gray-700"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button>Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {isMenuOpen && user && (
          <div className="md:hidden pb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  pathname === link.href
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}