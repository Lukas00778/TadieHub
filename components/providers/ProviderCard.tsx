import Link from 'next/link'
import { MapPin, Clock, CheckCircle } from 'lucide-react'
import { ProviderRating } from './ProviderRating'

interface ProviderCardProps {
  provider: {
    id: string
    full_name: string
    avatar_url?: string
    profiles?: {
      business_name?: string
      bio?: string
      is_verified: boolean
      is_id_verified: boolean
      is_insurance_verified: boolean
      is_police_checked: boolean
    }[]
    provider_skills?: { skill_category: string }[]
    provider_rates?: { hourly_rate: number; minimum_job_price: number }[]
    overall_rating?: number
    total_reviews?: number
  }
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const profile = provider.profiles?.[0]
  const rates = provider.provider_rates?.[0]
  const skills = provider.provider_skills?.map((s) => s.skill_category) || []

  return (
    <Link href={`/providers/${provider.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.full_name}
                className="w-16 h-16 object-cover"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-green-100 text-green-600 text-xl font-semibold">
                {provider.full_name[0].toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {profile?.business_name || provider.full_name}
              </h3>
              {profile?.is_verified && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>

            {profile?.bio && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{profile.bio}</p>
            )}

            <div className="mt-2">
              <ProviderRating
                rating={
                  provider.overall_rating
                    ? {
                        overall_rating: provider.overall_rating,
                        quality_avg: provider.overall_rating,
                        communication_avg: provider.overall_rating,
                        punctuality_avg: provider.overall_rating,
                        value_avg: provider.overall_rating,
                        total_reviews: provider.total_reviews || 0,
                      }
                    : undefined
                }
                size="sm"
              />
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {skill.replace('_', ' ')}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="px-2 py-0.5 text-gray-500 text-xs">
                    +{skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            {rates && (
              <div className="text-lg font-bold text-green-600">
                ${rates.hourly_rate}
                <span className="text-sm font-normal text-gray-500">/hr</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}