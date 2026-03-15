// Mock Payment Service
// This simulates a Stripe integration for demo purposes
// Replace with actual Stripe implementation when ready

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed'
  clientId: string
  providerId: string
  bookingId: string
  createdAt: Date
}

export interface EscrowPayment {
  id: string
  bookingId: string
  amount: number
  platformFee: number
  providerPayout: number
  status: 'held' | 'released' | 'refunded'
}

// Commission rate (platform fee)
const COMMISSION_RATE = 0.15 // 15%

class MockPaymentService {
  private payments: Map<string, PaymentIntent> = new Map()
  private escrowPayments: Map<string, EscrowPayment> = new Map()

  // Simulate creating a payment intent
  async createPaymentIntent(params: {
    amount: number
    clientId: string
    providerId: string
    bookingId: string
  }): Promise<PaymentIntent> {
    const payment: PaymentIntent = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: params.amount,
      currency: 'aud',
      status: 'pending',
      clientId: params.clientId,
      providerId: params.providerId,
      bookingId: params.bookingId,
      createdAt: new Date(),
    }

    this.payments.set(payment.id, payment)

    // Simulate async processing
    await this.simulateDelay(500)

    // Mark as succeeded (in real app, this would be webhook-triggered)
    payment.status = 'succeeded'

    // Create escrow hold
    const platformFee = Math.round(params.amount * COMMISSION_RATE)
    const escrow: EscrowPayment = {
      id: `escrow_${payment.id}`,
      bookingId: params.bookingId,
      amount: params.amount,
      platformFee,
      providerPayout: params.amount - platformFee,
      status: 'held',
    }

    this.escrowPayments.set(escrow.id, escrow)

    return payment
  }

  // Release escrow payment to provider (after job completion)
  async releaseEscrow(bookingId: string): Promise<EscrowPayment | null> {
    const escrow = Array.from(this.escrowPayments.values()).find(
      (e) => e.bookingId === bookingId && e.status === 'held'
    )

    if (!escrow) return null

    await this.simulateDelay(300)
    escrow.status = 'released'

    return escrow
  }

  // Refund escrow (if job is cancelled)
  async refundEscrow(bookingId: string): Promise<EscrowPayment | null> {
    const escrow = Array.from(this.escrowPayments.values()).find(
      (e) => e.bookingId === bookingId && e.status === 'held'
    )

    if (!escrow) return null

    await this.simulateDelay(300)
    escrow.status = 'refunded'

    return escrow
  }

  // Get payment details
  getPayment(paymentId: string): PaymentIntent | undefined {
    return this.payments.get(paymentId)
  }

  // Get escrow for booking
  getEscrow(bookingId: string): EscrowPayment | undefined {
    return Array.from(this.escrowPayments.values()).find(
      (e) => e.bookingId === bookingId
    )
  }

  // Calculate platform fee
  calculatePlatformFee(amount: number): number {
    return Math.round(amount * COMMISSION_RATE)
  }

  // Get provider payout amount (after platform fee)
  calculateProviderPayout(amount: number): number {
    return amount - this.calculatePlatformFee(amount)
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const mockPaymentService = new MockPaymentService()

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount)
}

// Payment status colors
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'succeeded':
    case 'released':
      return 'text-green-600 bg-green-50'
    case 'pending':
    case 'held':
    case 'processing':
      return 'text-yellow-600 bg-yellow-50'
    case 'failed':
    case 'refunded':
      return 'text-red-600 bg-red-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}