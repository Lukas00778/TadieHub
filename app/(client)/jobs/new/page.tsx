'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { jobCategories, urgencyLevels } from '@/lib/utils'
import { Loader2, Upload, MapPin, DollarSign, Clock, FileText } from 'lucide-react'

export default function NewJobPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    urgency: 'medium',
    timeframe: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase.from('jobs').insert({
      client_id: user.id,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      location_address: formData.location,
      budget_min: parseFloat(formData.budgetMin) || null,
      budget_max: parseFloat(formData.budgetMax) || null,
      urgency: formData.urgency,
      timeframe: formData.timeframe,
    }).select().single()

    if (error) {
      console.error('Error creating job:', error)
      setIsLoading(false)
      return
    }

    router.push(`/jobs/${data.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500">Describe what you need done and get quotes from local tradies</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>Provide information about your job</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Job Title</label>
              <Input
                placeholder="e.g., Garden cleanup and lawn mowing"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                {jobCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="flex min-h-[120px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe what needs to be done in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Address in Australia"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Minimum Budget ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    type="number"
                    placeholder="50"
                    value={formData.budgetMin}
                    onChange={(e) => setFormData({ ...formData, budgetMin: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Maximum Budget ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-10"
                    type="number"
                    placeholder="200"
                    value={formData.budgetMax}
                    onChange={(e) => setFormData({ ...formData, budgetMax: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Urgency</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {urgencyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: level.value })}
                    className={`p-3 rounded-lg border-2 text-left transition-colors ${
                      formData.urgency === level.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-xs px-2 py-0.5 rounded-full ${level.color}`}>
                      {level.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Timeframe (optional)</label>
              <Input
                placeholder="e.g., This weekend, Within a week"
                value={formData.timeframe}
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}