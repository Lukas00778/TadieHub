import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const jobCategories = [
  { value: 'gardening', label: 'Gardening', icon: '🌱' },
  { value: 'landscaping', label: 'Landscaping', icon: '🏡' },
  { value: 'lawn_mowing', label: 'Lawn Mowing', icon: '割' },
  { value: 'tree_trimming', label: 'Tree Trimming', icon: '🌳' },
  { value: 'irrigation', label: 'Irrigation', icon: '💧' },
  { value: 'fencing', label: 'Fencing', icon: '🚧' },
  { value: 'painting', label: 'Painting', icon: '🎨' },
  { value: 'plumbing', label: 'Plumbing', icon: '🔧' },
  { value: 'electrical', label: 'Electrical', icon: '⚡' },
  { value: 'carpentry', label: 'Carpentry', icon: '🪵' },
  { value: 'tiling', label: 'Tiling', icon: '⬜' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'other', label: 'Other', icon: '🔨' },
]

export const urgencyLevels = [
  { value: 'low', label: 'Low - Flexible', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium - Within a week', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High - Within 48 hours', color: 'bg-orange-100 text-orange-800' },
  { value: 'emergency', label: 'Emergency - ASAP', color: 'bg-red-100 text-red-800' },
]

export const australianCities = [
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
  { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
  { name: 'Perth', lat: -31.9505, lng: 115.8605 },
  { name: 'Adelaide', lat: -34.9285, lng: 138.6007 },
  { name: 'Canberra', lat: -35.2809, lng: 149.1300 },
  { name: 'Hobart', lat: -42.8821, lng: 147.3272 },
  { name: 'Darwin', lat: -12.4634, lng: 130.8456 },
]