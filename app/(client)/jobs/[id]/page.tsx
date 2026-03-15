'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign, Clock, User, Check, X } from 'lucide-react'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [job, setJob] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchJob() {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('*, client:users!client_id(*)')
        .eq('id', params.id)
        .single()

      if (jobData) {
        const { data: appsData } = await supabase
          .from('job_applications')
          .select('*, provider:users!provider_id(*)')
          .eq('job_id', params.id)
          .order('created_at', { ascending: false })

        setApplications(appsData || [])
      }

      setJob(jobData)
      setLoading(false)
    }

    fetchJob()
  }, [params.id])

  const handleAcceptApplication = async (applicationId: string, providerId: string) => {
    // Update application status
    await supabase
      .from('job_applications')
      .update({ status: 'accepted' })
      .eq('id', applicationId)

    // Reject other applications
    await supabase
      .from('job_applications')
      .update({ status: 'rejected' })
      .eq('job_id', params.id)
      .neq('id', applicationId)

    // Create booking
    const application = applications.find(a => a.id === applicationId)
    if (application) {
      await supabase.from('bookings').insert({
        job_id: params.id,
        provider_id: providerId,
        client_id: job.client_id,
        agreed_price: application.proposed_price,
        status: 'confirmed',
      })

      // Update job status
      await supabase
        .from('jobs')
        .update({ status: 'in_progress' })
        .eq('id', params.id)
    }

    router.push('/bookings')
  }

  const handleRejectApplication = async (applicationId: string) => {
    await supabase
      .from('job_applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId)

    // Refresh
    window.location.reload()
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (!job) {
    return <div className="p-8 text-center text-gray-500">Job not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        ← Back to Jobs
      </Button>

      {/* Job Details */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-2">
                <MapPin className="w-4 h-4" />
                {job.location_address}
              </CardDescription>
            </div>
            <Badge className={
              job.status === 'open' ? 'bg-green-100 text-green-800' :
              job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }>
              {job.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600">{job.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium capitalize">{job.category.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Budget</p>
              <p className="font-medium">
                ${job.budget_min || '?'} - ${job.budget_max || '?'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Urgency</p>
              <p className="font-medium capitalize">{job.urgency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Posted</p>
              <p className="font-medium">{new Date(job.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {job.timeframe && (
            <div>
              <p className="text-sm text-gray-500">Timeframe</p>
              <p className="font-medium">{job.timeframe}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Quotes ({applications.length})</CardTitle>
          <CardDescription>Review quotes from tradies</CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No quotes received yet</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{app.provider?.full_name || 'Tradie'}</h4>
                        <p className="text-2xl font-bold text-emerald-600">${app.proposed_price}</p>
                        {app.message && (
                          <p className="text-sm text-gray-600 mt-2">{app.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {app.status === 'pending' && job.status === 'open' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptApplication(app.id, app.provider_id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectApplication(app.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {app.status === 'accepted' && (
                        <Badge className="bg-green-100 text-green-800">Accepted</Badge>
                      )}
                      {app.status === 'rejected' && (
                        <Badge className="bg-gray-100 text-gray-600">Rejected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}