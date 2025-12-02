"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('landlord');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/users/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone,
          role,
        }),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create account');

      // On success, route landlords to the landlord portal placeholder.
      if (role === 'landlord') {
        router.push('/landlord-portal');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl py-20 px-6">
      <h1 className="text-3xl font-bold mb-6">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input required value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="First name" className="p-3 border rounded" />
          <input required value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="Last name" className="p-3 border rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="p-3 border rounded" />
          <input required type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="p-3 border rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" className="p-3 border rounded" />
          <select value={role} onChange={(e)=>setRole(e.target.value)} className="p-3 border rounded">
            <option value="landlord">Landlord</option>
            <option value="tenant">Tenant</option>
            <option value="property_management">Property Management</option>
          </select>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="pt-4">
          <button type="submit" disabled={loading} className="px-6 py-3 bg-blue text-white rounded-md">
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
