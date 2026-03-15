'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Wrench, Shield } from 'lucide-react'

interface RoleSelectorProps {
  onSelectRole: (role: 'client' | 'provider' | 'admin') => void
  isLoading?: boolean
}

export function RoleSelector({ onSelectRole, isLoading }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<'client' | 'provider' | 'admin' | null>(null)

  const roles = [
    {
      value: 'client' as const,
      title: 'Client',
      description: 'I need garden or trade services',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      value: 'provider' as const,
      title: 'Tradie / Provider',
      description: 'I want to offer my services',
      icon: Wrench,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      value: 'admin' as const,
      title: 'Admin',
      description: 'Platform administrator',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Choose your role</h2>
        <p className="text-gray-500">Select how you want to use TradieHub</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roles.map((role) => (
          <Card
            key={role.value}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRole === role.value
                ? 'border-2 border-emerald-500 ring-2 ring-emerald-200'
                : ''
            }`}
            onClick={() => setSelectedRole(role.value)}
          >
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto mb-3 w-14 h-14 ${role.bgColor} rounded-full flex items-center justify-center`}>
                <role.icon className={`w-7 h-7 ${role.color}`} />
              </div>
              <CardTitle className="text-base">{role.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-xs">
                {role.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedRole || isLoading}
          className="w-full max-w-xs"
        >
          {isLoading ? 'Continuing...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}