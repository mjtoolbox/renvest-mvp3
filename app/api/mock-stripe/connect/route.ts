import { NextResponse } from 'next/server'
import DB from '../../../../lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })

    // Simulate creating a Stripe Connected Account id
    const acct = `acct_mock_${Math.random().toString(36).slice(2, 10)}`

    // Update user record
    const updated = await DB.updateUserStripeAccount(email, acct)
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ stripeAccountId: acct, user: updated })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
