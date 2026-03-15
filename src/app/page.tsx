import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/Navbar'
import { Wrench, Shield, Clock, Star, ArrowRight, Check } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar user={undefined} />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Find Trusted Tradies in Your Area
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Connect with verified gardeners, landscapers, and tradies across Australia. Get quotes, book services, and pay securely—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  Find a Tradie
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Become a Tradie
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose TradieHub?</h2>
            <p className="text-gray-600 mt-2">The easiest way to get your jobs done</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Verified Tradies</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All tradies are ID verified, insured, and police checked for your peace of mind.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Fast Quotes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get multiple quotes from local tradies within hours, not days.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Real Reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Read genuine reviews from real customers to make informed decisions.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <Wrench className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-lg">Secure Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pay securely through our platform with escrow protection.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Post Your Job</h3>
              <p className="text-gray-600">Describe what you need done, set your budget, and add photos.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Quotes</h3>
              <p className="text-gray-600">Local tradies will send you competitive quotes with their experience.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-emerald-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Book & Pay</h3>
              <p className="text-gray-600">Choose the best tradie, schedule the job, and pay securely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Join thousands of happy customers and tradies across Australia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="outline" className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-8">
                Sign Up Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-emerald-700 text-white hover:bg-emerald-800 text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">TradieHub</h3>
              <p className="text-sm">Connecting clients with trusted tradies across Australia.</p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/providers" className="hover:text-white">Find Tradies</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">For Tradies</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/register" className="hover:text-white">Join as a Tradie</Link></li>
                <li><Link href="/resources" className="hover:text-white">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            © 2024 TradieHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}