'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'lawn_mowing', label: 'Lawn Mowing' },
  { value: 'tree_trimming', label: 'Tree Trimming' },
  { value: 'irrigation', label: 'Irrigation' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' },
]

const URGENCY = [
  { value: '', label: 'Any Urgency' },
  { value: 'low', label: 'Low - Within a week' },
  { value: 'medium', label: 'Medium - Within 3 days' },
  { value: 'high', label: 'High - Tomorrow' },
  { value: 'emergency', label: 'Emergency - ASAP' },
]

interface JobFiltersProps {
  onFilterChange?: (filters: {
    category: string
    urgency: string
    min_budget?: number
    max_budget?: number
  }) => void
}

export function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [category, setCategory] = useState('')
  const [urgency, setUrgency] = useState('')
  const [minBudget, setMinBudget] = useState('')
  const [maxBudget, setMaxBudget] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleApply = () => {
    onFilterChange?.({
      category,
      urgency,
      min_budget: minBudget ? parseInt(minBudget) : undefined,
      max_budget: maxBudget ? parseInt(maxBudget) : undefined,
    })
  }

  const handleReset = () => {
    setCategory('')
    setUrgency('')
    setMinBudget('')
    setMaxBudget('')
    onFilterChange?.({
      category: '',
      urgency: '',
    })
  }

  const hasFilters = category || urgency || minBudget || maxBudget

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-gray-400" />
        <h3 className="font-semibold text-gray-900">Filter Jobs</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {isExpanded && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Urgency
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {URGENCY.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Budget ($)
                </label>
                <input
                  type="number"
                  value={minBudget}
                  onChange={(e) => setMinBudget(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Budget ($)
                </label>
                <input
                  type="number"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  placeholder="Any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
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