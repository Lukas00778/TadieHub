'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RoleSelector } from '@/components/auth/RoleSelector'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<'role' | 'details'>('role')
  const [role, setRole] = useState<'client' | 'provider' | 'admin'>('client')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRoleSelect = (selectedRole: 'client' | 'provider' | 'admin') => {
    setRole(selectedRole)
    setStep('details')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          role: role,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    // Create user record in users table
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: formData.email,
        full_name: formData.fullName,
        phone: formData.phone,
        role: role,
      })

      // Create profile for provider
      if (role === 'provider' && formData.businessName) {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
          business_name: formData.businessName,
        })
      } else {
        await supabase.from('profiles').insert({
          user_id: data.user.id,
        })
      }
    }

    router.push('/login?registered=true')
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">TradieHub</h1>
          <p className="text-gray-500 mt-1">Connect with trusted tradies</p>
        </div>
        <RoleSelector onSelectRole={handleRoleSelect} isLoading={isLoading} />
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">TradieHub</h1>
          <p className="text-gray-500 mt-1">Connect with trusted tradies</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Create your account</CardTitle>
              <span className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full capitalize">
                {role}
              </span>
            </div>
            <CardDescription>
              {role === 'provider'
                ? 'Register as a service provider'
                : role === 'admin'
                ? 'Register as an administrator'
                : 'Register as a client'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              {role === 'provider' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Business Name (optional)</label>
                  <Input
                    type="text"
                    placeholder="Your Business Name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone (optional)</label>
                <Input
                  type="tel"
                  placeholder="+61 400 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <button
                onClick={() => setStep('role')}
                className="text-emerald-600 hover:underline"
              >
                Change role
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}