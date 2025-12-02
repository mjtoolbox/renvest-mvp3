import Link from 'next/link'
import DB from '../../lib/db'
import { cookies } from 'next/headers'

type Props = { searchParams?: { email?: string } }

export default async function LandlordPortal({ searchParams }: Props) {
  // prefer query param, fall back to cookie named `userEmail`
  const paramEmail = searchParams?.email
  const cookieEmail = cookies().get('userEmail')?.value
  const email = paramEmail || cookieEmail
  let user: any = null

  if (email) {
    try {
      user = await DB.getUserByEmail(String(email).trim().toLowerCase())
    } catch (err) {
      // DB may not be configured in some environments — fall through to placeholder
      user = null
    }
  }

  const firstName = user?.firstName || 'Landlord'
  const needsStripe = !user?.stripeAccountId

  return (
    <div className="min-h-[70vh] py-12 bg-offwhite">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Top section: welcome + in-app notification */}
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-black">Welcome, {firstName}</h1>
              <p className="text-sm text-darkgrey mt-1">Your landlord dashboard</p>
            </div>
            <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-2 text-sm text-yellow-900">
              In-application notification: you have important next steps to complete.
            </div>
          </div>

          {/* Stripe CTA if missing */}
          {needsStripe && (
            <div className="mt-4 bg-white border border-gray-200 rounded p-4 text-sm">
              <p className="mb-2">Next step: Connect Stripe for Payouts.</p>
              <p className="mb-4 text-xs text-slate-500">We need your Stripe account details to pay out rent collections to your bank account.</p>
              <Link
                href={`/landlord-portal/connect-stripe${user?.email ? `?email=${encodeURIComponent(user.email)}` : ''}`}
                className="inline-block rounded bg-btnblue px-4 py-2 text-sm text-white"
              >
                Connect Stripe for Payouts
              </Link>
            </div>
          )}
        </header>

        {/* Middle section: quick action / summary */}
        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded bg-white border p-6 shadow-sm">
            <h2 className="font-semibold">Properties</h2>
            <p className="text-sm text-darkgrey mt-2">Manage properties you own and monitor rent schedules.</p>
          </div>
          <div className="rounded bg-white border p-6 shadow-sm">
            <h2 className="font-semibold">Tenants</h2>
            <p className="text-sm text-darkgrey mt-2">View tenant details, leases, and documents.</p>
          </div>
          <div className="rounded bg-white border p-6 shadow-sm">
            <h2 className="font-semibold">Payments</h2>
            <p className="text-sm text-darkgrey mt-2">Track payouts and payment history (Stripe connected: {user?.stripeAccountId ? 'Yes' : 'No'}).</p>
          </div>
        </section>

        {/* Bottom section: account / help */}
        <section className="rounded bg-white border p-6 shadow-sm">
          <h3 className="font-semibold">Account</h3>
          <div className="mt-3 text-sm text-darkgrey">
            <p>Email: {user?.email || 'not signed in'}</p>
            <p>Role: {user?.role || 'LANDLORD'}</p>
          </div>
        </section>

      </div>
    </div>
  )
}
