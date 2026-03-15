'use client'

import { useState } from 'react'
import { Search, X, Check } from 'lucide-react'

const SKILLS = [
  { value: '', label: 'All Skills' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'lawn_mowing', label: 'Lawn Mowing' },
  { value: 'tree_trimming', label: 'Tree Trimming' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
]

const RATINGS = [
  { value: '', label: 'Any Rating' },
  { value: '4.5', label: '4.5+ Stars' },
  { value: '4.0', label: '4.0+ Stars' },
  { value: '3.5', label: '3.5+ Stars' },
]

const MAX_RATE = [
  { value: '', label: 'Any Rate' },
  { value: '30', label: 'Under $30/hr' },
  { value: '50', label: 'Under $50/hr' },
  { value: '75', label: 'Under $75/hr' },
  { value: '100', label: 'Under $100/hr' },
]

interface ProviderFiltersProps {
  onFilterChange?: (filters: {
    category: string
    min_rating?: number
    max_hourly_rate?: number
    is_verified?: boolean
  }) => void
}

export function ProviderFilters({ onFilterChange }: ProviderFiltersProps) {
  const [category, setCategory] = useState('')
  const [minRating, setMinRating] = useState('')
  const [maxHourlyRate, setMaxHourlyRate] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleApply = () => {
    onFilterChange?.({
      category,
      min_rating: minRating ? parseFloat(minRating) : undefined,
      max_hourly_rate: maxHourlyRate ? parseInt(maxHourlyRate) : undefined,
      is_verified: isVerified || undefined,
    })
  }

  const handleReset = () => {
    setCategory('')
    setMinRating('')
    setMaxHourlyRate('')
    setIsVerified(false)
    onFilterChange?.({
      category: '',
    })
  }

  const hasFilters = category || minRating || maxHourlyRate || isVerified

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900">Filter Providers</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skill
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {SKILLS.map((skill) => (
              <option key={skill.value} value={skill.value}>
                {skill.label}
              </option>
            ))}
          </select>
        </div>

        {isExpanded && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {RATINGS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Hourly Rate
              </label>
              <select
                value={maxHourlyRate}
                onChange={(e) => setMaxHourlyRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {MAX_RATE.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => setIsVerified(!isVerified)}
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  isVerified
                    ? 'bg-green-600 border-green-600'
                    : 'border-gray-300 bg-white'
                }`}
              >
                {isVerified && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-gray-700">Verified providers only</span>
            </label>
          </>
        )}

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-green-600 hover:text-green-700"
        >
          {isExpanded ? 'Show less' : 'More filters'}
        </button>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleApply}
          className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Apply
        </button>
        {hasFilters && (
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}