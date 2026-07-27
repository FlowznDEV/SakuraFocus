import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Backend-only Supabase Service Role Client
 * STRICT SECURITY MANDATE:
 * 1. This file is executed ONLY in Node.js backend runtime (Express server).
 * 2. It reads SUPABASE_SERVICE_ROLE_KEY from process.env.
 * 3. Never bundle or export this file to frontend client code.
 */
let adminClientInstance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  if (!adminClientInstance) {
    adminClientInstance = createClient(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClientInstance;
}

/**
 * Helper to verify Supabase User JWT Bearer Token in backend API routes
 */
export async function verifyUserToken(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const admin = getSupabaseAdmin();

  if (!admin) {
    // Attempt fallback validation using URL + token if service role key isn't provided
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (url && anonKey) {
      const client = createClient(url, anonKey);
      const { data, error } = await client.auth.getUser(token);
      if (error || !data.user) return null;
      return data.user;
    }
    return null;
  }

  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }
    return data.user;
  } catch (err) {
    console.error('Error verifying Supabase JWT Token:', err);
    return null;
  }
}
