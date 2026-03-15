'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { jobCategories } from '@/lib/utils'
import { Search, MapPin, Star, Shield, ArrowRight } from 'lucide-react'

export default function ProvidersPage() {
  const supabase = createClient()
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    async function fetchProviders() {
      // Get all providers with their profiles
      const { data: users } = await supabase
        .from('users')
        .select('*, profiles(*), provider_skills(*), provider_rates(*)')
        .eq('role', 'provider')

      setProviders(users || [])
      setLoading(false)
    }

    fetchProviders()
  }, [])

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = !searchTerm ||
      provider.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.profiles?.business_name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !categoryFilter ||
      provider.provider_skills?.some((s: any) => s.skill_category === categoryFilter)

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Tradies</h1>
        <p className="text-gray-500">Browse verified service providers in your area</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by name or business..."
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

      {/* Providers Grid */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredProviders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No providers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <Link key={provider.id} href={`/providers/${provider.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-emerald-600">
                        {provider.full_name?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {provider.profiles?.business_name || provider.full_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Sydney, NSW
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {provider.profiles?.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {provider.profiles.bio}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    {provider.provider_skills?.slice(0, 3).map((skill: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill.skill_category}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">4.8</span>
                      <span className="text-xs text-gray-500">(24 reviews)</span>
                    </div>
                    {provider.provider_rates?.[0]?.hourly_rate && (
                      <span className="text-sm font-medium text-emerald-600">
                        ${provider.provider_rates[0].hourly_rate}/hr
                      </span>
                    )}
                  </div>

                  {provider.profiles?.is_verified && (
                    <div className="flex items-center gap-1 mt-3 text-xs text-emerald-600">
                      <Shield className="w-3 h-3" />
                      Verified Tradie
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}