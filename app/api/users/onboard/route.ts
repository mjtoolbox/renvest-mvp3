import { NextResponse } from 'next/server';
import DB from '../../../../lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Coerce incoming values to strings and protect against accidental arrays
    const rawFirst = body.firstName;
    const rawLast = body.lastName;
    const rawEmail = body.email;
    const rawPassword = body.password;
    const rawRole = body.role;
    const phone = body.phone;

    const coerce = (v: any) => {
      if (v == null) return '';
      if (Array.isArray(v)) return String(v[0]);
      return String(v);
    };

    const firstName = coerce(rawFirst).trim();
    const lastName = coerce(rawLast).trim();
    const email = coerce(rawEmail).trim();
    const password = coerce(rawPassword);
    const role = coerce(rawRole).trim();

    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Ensure no duplicate user exists
    const existing = await DB.getUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Enforce reasonable length constraints that match DB schema
    if (firstName.length > 255 || lastName.length > 100) {
      return NextResponse.json({ error: 'Name fields exceed allowed length' }, { status: 400 });
    }

    // Hash the password with Node's crypto (scrypt) and a random salt
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
    const passwordHash = `${salt}:${derived}`;

    // Map incoming role strings to the DB enum values (expected uppercase)
    const roleMap: Record<string, string> = {
      landlord: 'LANDLORD',
      tenant: 'TENANT',
      property_management: 'PROPERTYMANAGER',
      propertymanagement: 'PROPERTYMANAGER',
      propertyManager: 'PROPERTYMANAGER',
    };
    const mappedRole = roleMap[String(role).toLowerCase()] || String(role).toUpperCase();

    // Insert user into User table
    const newUser = await DB.insertUser(firstName.trim(), lastName.trim(), normalizedEmail, passwordHash, mappedRole);

    // Optionally persist a contact record / phone if required - keep simple for now
    try {
      await DB.insertContact(`${firstName.trim()} ${lastName.trim()}`, normalizedEmail, mappedRole);
    } catch (err) {
      // ignore duplicate/contact insert errors for now
    }

    return NextResponse.json({ success: true, userId: newUser.userId });
  } catch (err: any) {
    console.error('onboard POST error', err);
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
