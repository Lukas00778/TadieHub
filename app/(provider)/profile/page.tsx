'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { jobCategories } from '@/lib/utils'
import { Loader2, Save } from 'lucide-react'

export default function ProfilePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    business_name: '',
    bio: '',
    abn: '',
    vehicle_type: '',
  })
  const [skills, setSkills] = useState<any[]>([])
  const [rates, setRates] = useState({
    hourly_rate: '',
    minimum_job_price: '',
    call_out_fee: '',
    emergency_surcharge: '',
  })
  const [newSkill, setNewSkill] = useState({ category: '', years_experience: 0 })

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase
        .from('users')
        .select('*, profiles(*)')
        .eq('id', user.id)
        .single()

      if (userData) {
        setProfile({
          full_name: userData.full_name || '',
          email: userData.email || '',
          business_name: userData.profiles?.business_name || '',
          bio: userData.profiles?.bio || '',
          abn: userData.profiles?.abn || '',
          vehicle_type: userData.profiles?.vehicle_type || '',
        })
      }

      const { data: skillsData } = await supabase
        .from('provider_skills')
        .select('*')
        .eq('user_id', user.id)

      setSkills(skillsData || [])

      const { data: ratesData } = await supabase
        .from('provider_rates')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (ratesData) {
        setRates({
          hourly_rate: ratesData.hourly_rate?.toString() || '',
          minimum_job_price: ratesData.minimum_job_price?.toString() || '',
          call_out_fee: ratesData.call_out_fee?.toString() || '',
          emergency_surcharge: ratesData.emergency_surcharge?.toString() || '',
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({
        business_name: profile.business_name,
        bio: profile.bio,
        abn: profile.abn,
        vehicle_type: profile.vehicle_type,
      })
      .eq('user_id', user.id)

    await supabase
      .from('users')
      .update({ full_name: profile.full_name })
      .eq('id', user.id)

    setSaving(false)
  }

  const handleSaveRates = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('provider_rates')
      .upsert({
        user_id: user.id,
        hourly_rate: parseFloat(rates.hourly_rate) || null,
        minimum_job_price: parseFloat(rates.minimum_job_price) || null,
        call_out_fee: parseFloat(rates.call_out_fee) || null,
        emergency_surcharge: parseFloat(rates.emergency_surcharge) || null,
      })

    setSaving(false)
  }

  const handleAddSkill = async () => {
    if (!newSkill.category) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('provider_skills').insert({
      user_id: user.id,
      skill_category: newSkill.category,
      years_experience: newSkill.years_experience,
    })

    const { data } = await supabase
      .from('provider_skills')
      .select('*')
      .eq('user_id', user.id)

    setSkills(data || [])
    setNewSkill({ category: '', years_experience: 0 })
  }

  const handleRemoveSkill = async (skillId: string) => {
    await supabase.from('provider_skills').delete().eq('id', skillId)
    setSkills(skills.filter(s => s.id !== skillId))
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500">Manage your business information</p>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Your public profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Name</label>
              <Input
                value={profile.business_name}
                onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
                placeholder="Your Business Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ABN</label>
              <Input
                value={profile.abn}
                onChange={(e) => setProfile({ ...profile, abn: e.target.value })}
                placeholder="Australian Business Number"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio</label>
            <textarea
              className="flex w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              rows={3}
              placeholder="Tell customers about your services..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle Type</label>
            <Input
              value={profile.vehicle_type}
              onChange={(e) => setProfile({ ...profile, vehicle_type: e.target.value })}
              placeholder="e.g., Ute, Van, ute with trailer"
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Services</CardTitle>
          <CardDescription>What services do you offer?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
              >
                <span className="text-sm capitalize">{skill.skill_category.replace('_', ' ')}</span>
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <select
              className="h-10 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
            >
              <option value="">Select skill</option>
              {jobCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <Input
              type="number"
              className="w-24"
              placeholder="Years"
              value={newSkill.years_experience || ''}
              onChange={(e) => setNewSkill({ ...newSkill, years_experience: parseInt(e.target.value) || 0 })}
            />
            <Button onClick={handleAddSkill} variant="outline">Add</Button>
          </div>
        </CardContent>
      </Card>

      {/* Rates */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set your rates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hourly Rate ($)</label>
              <Input
                type="number"
                value={rates.hourly_rate}
                onChange={(e) => setRates({ ...rates, hourly_rate: e.target.value })}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Job Price ($)</label>
              <Input
                type="number"
                value={rates.minimum_job_price}
                onChange={(e) => setRates({ ...rates, minimum_job_price: e.target.value })}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Call-out Fee ($)</label>
              <Input
                type="number"
                value={rates.call_out_fee}
                onChange={(e) => setRates({ ...rates, call_out_fee: e.target.value })}
                placeholder="30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Surcharge ($)</label>
              <Input
                type="number"
                value={rates.emergency_surcharge}
                onChange={(e) => setRates({ ...rates, emergency_surcharge: e.target.value })}
                placeholder="25"
              />
            </div>
          </div>
          <Button onClick={handleSaveRates} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Rates
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}