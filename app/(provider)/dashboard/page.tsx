'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, DollarSign, Star, TrendingUp, ArrowRight, MessageSquare } from 'lucide-react'

export default function ProviderDashboard() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [stats, setStats] = useState({ pending: 0, accepted: 0, completed: 0, earnings: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch available jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*, client:users!client_id(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(10)

      // Fetch provider's bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, jobs(*), client:users!client_id(*)')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch applications
      const { data: applicationsData } = await supabase
        .from('job_applications')
        .select('*')
        .eq('provider_id', user.id)

      const pendingApps = applicationsData?.filter(a => a.status === 'pending').length || 0
      const acceptedApps = applicationsData?.filter(a => a.status === 'accepted').length || 0

      // Calculate earnings
      const completedBookings = bookingsData?.filter(b => b.status === 'completed') || []
      const earnings = completedBookings.reduce((sum, b) => sum + (b.agreed_price || 0), 0)

      setStats({
        pending: pendingApps,
        accepted: acceptedApps,
        completed: completedBookings.length,
        earnings,
      })

      setJobs(jobsData || [])
      setBookings(bookingsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const statCards = [
    { label: 'Pending Quotes', value: stats.pending, icon: Briefcase, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Accepted Jobs', value: stats.accepted, icon: TrendingUp, color: 'bg-green-100 text-green-600' },
    { label: 'Completed Jobs', value: stats.completed, icon: DollarSign, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Earnings', value: `$${stats.earnings}`, icon: Star, color: 'bg-purple-100 text-purple-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500">Find jobs and manage your bookings</p>
        </div>
        <Link href="/profile">
          <Button variant="outline">Edit Profile</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Available Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Available Jobs</CardTitle>
              <CardDescription>Jobs in your area</CardDescription>
            </div>
            <Link href="/jobs">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No jobs available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-500">{job.category} • {job.location_address}</p>
                        <p className="text-sm text-emerald-600 mt-1">
                          ${job.budget_min} - ${job.budget_max}
                        </p>
                      </div>
                      <Badge variant="secondary">{job.urgency}</Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Jobs</CardTitle>
              <CardDescription>Your current work</CardDescription>
            </div>
            <Link href="/bookings">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active jobs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{booking.jobs?.title}</h4>
                        <p className="text-sm text-gray-500">for {booking.client?.full_name}</p>
                        <p className="text-sm text-emerald-600 mt-1">${booking.agreed_price}</p>
                      </div>
                      <Badge variant={
                        booking.status === 'completed' ? 'default' :
                        booking.status === 'in_progress' ? 'secondary' : 'outline'
                      }>
                        {booking.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}