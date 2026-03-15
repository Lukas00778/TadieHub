'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Briefcase, DollarSign, TrendingUp, Settings, Shield, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalClients: 0,
    totalJobs: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      const { data: users } = await supabase.from('users').select('role')
      const { data: jobs } = await supabase.from('jobs').select('*')
      const { data: bookings } = await supabase.from('bookings').select('*')

      const providers = users?.filter(u => u.role === 'provider').length || 0
      const clients = users?.filter(u => u.role === 'client').length || 0
      const revenue = bookings?.reduce((sum, b) => sum + (b.agreed_price || 0), 0) || 0

      setStats({
        totalUsers: users?.length || 0,
        totalProviders: providers,
        totalClients: clients,
        totalJobs: jobs?.length || 0,
        totalBookings: bookings?.length || 0,
        totalRevenue: revenue,
      })
      setLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Providers', value: stats.totalProviders, icon: Shield, color: 'bg-green-100 text-green-600' },
    { label: 'Clients', value: stats.totalClients, icon: Users, color: 'bg-purple-100 text-purple-600' },
    { label: 'Total Jobs', value: stats.totalJobs, icon: Briefcase, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Bookings', value: stats.totalBookings, icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Revenue', value: `$${stats.totalRevenue}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
  ]

  const adminSections = [
    {
      title: 'User Management',
      description: 'View and manage all users',
      href: '/admin/users',
      icon: Users,
    },
    {
      title: 'Job Oversight',
      description: 'Monitor all job postings',
      href: '/admin/jobs',
      icon: Briefcase,
    },
    {
      title: 'Analytics',
      description: 'View platform analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
    },
    {
      title: 'Settings',
      description: 'Configure platform settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Manage the TradieHub platform</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold">{loading ? '...' : stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Sections */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminSections.map((section, index) => (
          <Link key={index} href={section.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <section.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" size="sm" className="w-full">
                  Manage <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}