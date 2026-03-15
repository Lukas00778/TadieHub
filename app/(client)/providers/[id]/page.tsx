'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Shield, Phone, Mail, Calendar, ArrowLeft } from 'lucide-react'

export default function ProviderProfilePage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [provider, setProvider] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProvider() {
      const { data: providerData } = await supabase
        .from('users')
        .select('*, profiles(*), provider_skills(*), provider_rates(*)')
        .eq('id', params.id)
        .single()

      if (providerData) {
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select('*, reviewer:users!reviewer_id(*)')
          .eq('reviewee_id', params.id)
          .order('created_at', { ascending: false })
          .limit(10)

        setReviews(reviewsData || [])
      }

      setProvider(providerData)
      setLoading(false)
    }

    fetchProvider()
  }, [params.id])

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  if (!provider) {
    return <div className="p-8 text-center text-gray-500">Provider not found</div>
  }

  const rating = 4.8 // Mock rating

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Providers
      </Button>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-emerald-600">
                {provider.full_name?.charAt(0) || 'T'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">
                    {provider.profiles?.business_name || provider.full_name}
                  </h1>
                  <p className="text-gray-500">{provider.full_name}</p>
                </div>
                {provider.profiles?.is_verified && (
                  <Badge className="bg-emerald-100 text-emerald-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{rating}</span>
                  <span className="text-gray-500">({reviews.length} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  Sydney, NSW
                </div>
              </div>

              {provider.profiles?.bio && (
                <p className="text-gray-600 mt-4">{provider.profiles.bio}</p>
              )}

              <div className="flex gap-3 mt-6">
                <Button>Contact Tradie</Button>
                <Button variant="outline">Request Quote</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {provider.provider_skills?.map((skill: any, i: number) => (
                <Badge key={i} variant="secondary">
                  {skill.skill_category}
                </Badge>
              )) || <p className="text-gray-500">No skills listed</p>}
            </div>

            {provider.profiles?.tools_available?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Tools Available</h4>
                <p className="text-sm text-gray-600">{provider.profiles.tools_available.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            {provider.provider_rates?.[0] ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Hourly Rate</span>
                  <span className="font-medium">${provider.provider_rates[0].hourly_rate}/hr</span>
                </div>
                {provider.provider_rates[0].minimum_job_price && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Minimum Job</span>
                    <span className="font-medium">${provider.provider_rates[0].minimum_job_price}</span>
                  </div>
                )}
                {provider.provider_rates[0].call_out_fee && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Call-out Fee</span>
                    <span className="font-medium">${provider.provider_rates[0].call_out_fee}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Rates not set</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification */}
      {(provider.profiles?.is_id_verified || provider.profiles?.is_insurance_verified || provider.profiles?.is_police_checked) && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {provider.profiles?.is_id_verified && (
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">ID Verified</span>
                </div>
              )}
              {provider.profiles?.is_insurance_verified && (
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Insured</span>
                </div>
              )}
              {provider.profiles?.is_police_checked && (
                <div className="flex items-center gap-2 text-green-600">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Police Checked</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>What customers say</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{review.reviewer?.full_name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating_quality ? 'text-yellow-500' : 'text-gray-300'}`}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}