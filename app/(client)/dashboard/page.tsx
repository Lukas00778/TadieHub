'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Briefcase, Clock, MessageSquare, DollarSign, ArrowRight } from 'lucide-react'

export default function ClientDashboard() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch user's jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch user's bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*, jobs(*), provider:users!provider_id(*)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setJobs(jobsData || [])
      setBookings(bookingsData || [])
      setLoading(false)
    }

    fetchData()
  }, [])

  const stats = [
    { label: 'Active Jobs', value: jobs.filter(j => j.status === 'open').length, icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
    { label: 'In Progress', value: bookings.filter(b => b.status === 'in_progress').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: DollarSign, color: 'bg-green-100 text-green-600' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-500">Manage your jobs and find service providers</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Jobs</CardTitle>
              <CardDescription>Your posted jobs</CardDescription>
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
                <p className="text-gray-500 mb-4">No jobs posted yet</p>
                <Link href="/jobs/new">
                  <Button variant="outline" size="sm">Post Your First Job</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-500">{job.location_address}</p>
                      </div>
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                        {job.status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Bookings</CardTitle>
              <CardDescription>Your scheduled jobs</CardDescription>
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
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No bookings yet</p>
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
                        <p className="text-sm text-gray-500">with {booking.provider?.full_name}</p>
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

      {/* Find Tradies CTA */}
      <Card className="bg-emerald-50 border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Need a Tradie?</h3>
              <p className="text-sm text-gray-600">Browse verified tradies in your area</p>
            </div>
            <Link href="/providers">
              <Button>
                Find Tradies
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}