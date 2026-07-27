import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { ShieldCheck, Lock, UserCheck, LogOut, KeyRound, Server, Sparkles, RefreshCw, AlertTriangle, CheckCircle, Database, Copy, Check } from 'lucide-react';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncSuccess?: () => void;
  localStats?: any;
  localTasks?: any;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({
  isOpen,
  onClose,
  onSyncSuccess,
  localStats,
  localTasks,
}) => {
  const { user, isConfigured, signIn, signUp, signOut } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [backendStatus, setBackendStatus] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Check backend health
    fetch('/api/supabase/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data))
      .catch(() => setBackendStatus({ configured: false }));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) {
      setMessage({
        type: 'error',
        text: 'Chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ainda não configuradas nas variáveis de ambiente.',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    if (isSignUp) {
      const { user: newUser, error } = await signUp(email, password);
      setLoading(false);
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Erro ao realizar cadastro no Supabase' });
      } else {
        setMessage({
          type: 'success',
          text: `Conta criada com sucesso (${newUser?.email})! Sessão mantida.`,
        });
      }
    } else {
      const { user: loggedUser, error } = await signIn(email, password);
      setLoading(false);
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Erro de autenticação no Supabase' });
      } else {
        setMessage({
          type: 'success',
          text: `Bem-vindo de volta, ${loggedUser?.email}! Sessão autenticada e persistida.`,
        });
      }
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'info', text: 'Você saiu da sua conta Supabase com segurança.' });
    }
  };

  const handlePrivilegedSync = async () => {
    const client = getSupabaseClient();
    if (!client || !user) {
      setMessage({ type: 'error', text: 'Você precisa estar autenticado no Supabase para sincronizar.' });
      return;
    }

    setSyncing(true);
    setMessage(null);

    try {
      // Get current JWT token safely from client-side Auth
      const { data: sessionData } = await client.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.');
      }

      // Call privileged Express backend API route
      const response = await fetch('/api/supabase/privileged-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stats: localStats,
          tasks: localTasks,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Falha ao sincronizar via servidor.');
      }

      setMessage({
        type: 'success',
        text: '✨ Dados sincronizados com sucesso via Backend Privilegiado (Service Role) e RLS!',
      });
      onSyncSuccess?.();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro na sincronização' });
    } finally {
      setSyncing(false);
    }
  };

  const copySqlToClipboard = () => {
    const sql = `-- Script de Schema e Políticas RLS disponível em /supabase/schema.sql`;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[32px] border border-pink-200/80 bg-gradient-to-b from-white via-pink-50/40 to-rose-50/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100/80 pb-4 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-rose-100">Login no Banco de Dados</h2>
              <p className="text-xs text-pink-700/70 dark:text-rose-200/60 font-medium">Auth, RLS e Backend Service Role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-rose-400 hover:bg-pink-100/80 dark:text-rose-300 dark:hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Security Rule Highlights */}
        <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 text-xs text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <div className="flex items-center space-x-2 font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Segurança Reforçada</span>
          </div>
        </div>

        {/* Status Alerts */}
        {message && (
          <div
            className={`mt-4 rounded-2xl p-3.5 text-xs font-medium ${
              message.type === 'success'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                : message.type === 'error'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Main Body */}
        <div className="mt-5 space-y-5">
          {user ? (
            /* Authenticated User Panel */
            <div className="rounded-2xl border border-pink-200/80 bg-white/80 p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-800/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-bold dark:bg-pink-950 dark:text-pink-300">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-rose-100">{user.email}</p>
                    <p className="text-[10px] text-pink-600/60 dark:text-rose-300/50 font-mono">UID: {user.id.slice(0, 18)}...</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-1.5 text-xs font-semibold text-pink-800 hover:bg-pink-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-rose-200"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sair</span>
                </button>
              </div>

              {/* Cloud Sync Action */}
              <div className="rounded-xl border border-pink-200/70 bg-pink-50/60 p-4 dark:border-zinc-700 dark:bg-zinc-900/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-rose-100 flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-pink-500" />
                    Sincronização Privilegiada Backend
                  </span>
                  <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[10px] font-bold text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                    Express + Service Role
                  </span>
                </div>
                <p className="text-[11px] text-pink-800/70 dark:text-rose-200/70">
                  Envia seu progresso local com autenticação JWT verificada pelo servidor.
                </p>
                <button
                  onClick={handlePrivilegedSync}
                  disabled={syncing}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-pink-500 hover:bg-pink-600 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'Sincronizando no Supabase...' : 'Sincronizar Progresso Nuvem'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form (Login / Register) */
            <div className="space-y-4">
              {!isConfigured && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200 space-y-1">
                  <div className="flex items-center space-x-2 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Variáveis do Supabase Ausentes</span>
                  </div>
                  <p className="text-[11px]">
                    Configure <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">VITE_SUPABASE_URL</code> e <code className="font-mono bg-amber-100 dark:bg-amber-900/50 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> no arquivo <code className="font-mono">.env</code> para testar a conexão em tempo real.
                  </p>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-rose-200/90 mb-1">
                    E-mail do Usuário
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full rounded-xl border border-pink-200/80 bg-white/80 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-pink-300/70 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-rose-50 dark:placeholder:text-zinc-500 dark:focus:border-pink-500 dark:focus:ring-pink-950"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-rose-200/90 mb-1">
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-pink-200/80 bg-white/80 px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-pink-300/70 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/90 dark:text-rose-50 dark:placeholder:text-zinc-500 dark:focus:border-pink-500 dark:focus:ring-pink-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !isConfigured}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:opacity-95 py-3 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>
                    {loading
                      ? 'Processando...'
                      : isSignUp
                      ? 'Criar Conta no Supabase Auth'
                      : 'Entrar com Supabase Auth'}
                  </span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-xs font-medium text-pink-600 hover:underline dark:text-pink-400"
                  >
                    {isSignUp
                      ? 'Já tem uma conta? Faça login'
                      : 'Não tem conta? Cadastre-se com Supabase'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Backend Health Diagnostic */}
          <div className="rounded-2xl border border-pink-100/80 bg-pink-50/40 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-rose-200">
              <span className="flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-pink-500 dark:text-rose-400" />
                Status do Servidor Backend Node/Express
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  backendStatus?.configured
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {backendStatus?.configured ? 'Service Role Ativo' : 'Chave Protegida / Servidor Online'}
              </span>
            </div>
            <p className="text-[11px] text-pink-800/70 dark:text-rose-200/70">
              {backendStatus?.message || 'Verificando conexão backend...'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-pink-100/80 hover:bg-pink-200/80 px-5 py-2.5 text-xs font-bold text-pink-800 dark:bg-zinc-800 dark:text-rose-200 dark:hover:bg-zinc-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
