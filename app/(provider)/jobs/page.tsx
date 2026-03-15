'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { jobCategories, urgencyLevels } from '@/lib/utils'
import { Search, MapPin, DollarSign, Clock, Send, Loader2 } from 'lucide-react'

export default function ProviderJobsPage() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedJob, setSelectedJob] = useState<string | null>(null)
  const [quoteAmount, setQuoteAmount] = useState('')
  const [quoteMessage, setQuoteMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchJobs() {
      const { data } = await supabase
        .from('jobs')
        .select('*, client:users!client_id(*)')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      setJobs(data || [])
      setLoading(false)
    }

    fetchJobs()
  }, [])

  const handleSubmitQuote = async (jobId: string) => {
    if (!quoteAmount) return

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSubmitting(false)
      return
    }

    const { error } = await supabase.from('job_applications').insert({
      job_id: jobId,
      provider_id: user.id,
      proposed_price: parseFloat(quoteAmount),
      message: quoteMessage,
    })

    if (!error) {
      setSelectedJob(null)
      setQuoteAmount('')
      setQuoteMessage('')
    }

    setSubmitting(false)
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !categoryFilter || job.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const urgencyColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    emergency: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
        <p className="text-gray-500">Browse available jobs and submit quotes</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {jobCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No jobs available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className={selectedJob === job.id ? 'border-emerald-500' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <Badge className={urgencyColors[job.urgency]}>{job.urgency}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location_address}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        ${job.budget_min || '?'} - ${job.budget_max || '?'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Posted by {job.client?.full_name}</p>
                  </div>
                  <div className="ml-4">
                    {selectedJob === job.id ? (
                      <div className="space-y-3">
                        <Input
                          type="number"
                          placeholder="Your price ($)"
                          value={quoteAmount}
                          onChange={(e) => setQuoteAmount(e.target.value)}
                        />
                        <textarea
                          className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Message (optional)"
                          rows={2}
                          value={quoteMessage}
                          onChange={(e) => setQuoteMessage(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitQuote(job.id)}
                            disabled={submitting || !quoteAmount}
                          >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
                            Send Quote
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedJob(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button size="sm" onClick={() => setSelectedJob(job.id)}>
                        Quote
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}