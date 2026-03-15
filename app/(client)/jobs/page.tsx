'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react'

export default function ClientJobsPage() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJobs() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('jobs')
        .select('*, job_applications(*)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      setJobs(data || [])
      setLoading(false)
    }

    fetchJobs()
  }, [])

  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500">Manage your posted jobs</p>
        </div>
        <Link href="/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : jobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven't posted any jobs yet</p>
            <Link href="/jobs/new">
              <Button>Post Your First Job</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <Badge className={statusColors[job.status]}>{job.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{job.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location_address}
                        </span>
                        {(job.budget_min || job.budget_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {job.budget_min && job.budget_max
                              ? `$${job.budget_min} - $${job.budget_max}`
                              : job.budget_min
                              ? `From $${job.budget_min}`
                              : `Up to $${job.budget_max}`}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm text-gray-500">{job.job_applications?.length || 0} quotes</p>
                      <ArrowRight className="w-5 h-5 text-gray-400 ml-auto mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}