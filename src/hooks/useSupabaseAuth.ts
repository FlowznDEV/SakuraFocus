import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

export interface UseSupabaseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: str) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: str) => Promise<{ user: User | null; error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  const refreshSession = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session: currentSession }, error } = await client.auth.getSession();
      if (error) {
        console.warn('Erro ao obter sessão do Supabase:', error.message);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    } catch (err) {
      console.error('Erro de rede ao verificar sessão:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setLoading(false);
      return;
    }

    // Carrega a sessão atual persistida
    refreshSession();

    // Registra listener de mudanças de estado de autenticação (login, logout, auto refresh token)
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  const signIn = async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, error: new Error('Supabase não está configurado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.') };
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setUser(data.user);
      setSession(data.session);
      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const signUp = async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { user: null, error: new Error('Supabase não está configurado. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.') };
    }

    try {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      if (data.user) {
        setUser(data.user);
        setSession(data.session);
      }
      return { user: data.user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  };

  const signOut = async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { error: new Error('Supabase não está configurado.') };
    }

    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    isConfigured,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };
}
