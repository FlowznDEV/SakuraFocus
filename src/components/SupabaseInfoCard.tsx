import React, { useState } from 'react';
import { Database, ShieldCheck, Key, Server, FileCode, CheckCircle2, ChevronRight, Copy, Check, Terminal, Layers } from 'lucide-react';

interface SupabaseInfoCardProps {
  onOpenAuthModal: () => void;
}

export const SupabaseInfoCard: React.FC<SupabaseInfoCardProps> = ({ onOpenAuthModal }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'files' | 'env' | 'rls'>('architecture');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div
      id="supabase-info-card"
      className="rounded-[32px] border border-pink-100/80 bg-white/60 p-6 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/60"
    >
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-pink-100 dark:border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Arquitetura Segura Supabase</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              Integração Supabase de Alta Segurança
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Separação rigorosa entre Frontend (Anon), Backend (Service Role) e Banco RLS.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="flex items-center justify-center space-x-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm"
        >
          <Key className="h-4 w-4" />
          <span>Autenticar / Sincronizar</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-pink-50 pb-3 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            activeTab === 'architecture'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'text-gray-500 hover:bg-pink-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Visão Geral</span>
        </button>

        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            activeTab === 'files'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'text-gray-500 hover:bg-pink-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          <FileCode className="h-3.5 w-3.5" />
          <span>Estrutura de Arquivos</span>
        </button>

        <button
          onClick={() => setActiveTab('env')}
          className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            activeTab === 'env'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'text-gray-500 hover:bg-pink-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>Variáveis de Ambiente</span>
        </button>

        <button
          onClick={() => setActiveTab('rls')}
          className={`flex items-center space-x-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
            activeTab === 'rls'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'text-gray-500 hover:bg-pink-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Políticas RLS SQL</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="mt-4 text-xs">
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Frontend Layer */}
            <div className="rounded-2xl border border-pink-100 bg-white/60 p-4 dark:border-zinc-800 dark:bg-zinc-800/40 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-gray-900 dark:text-white">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-pink-700 text-[10px]">1</span>
                <span>Frontend (Navegador)</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                Usa apenas <code className="text-emerald-600 font-mono">VITE_SUPABASE_ANON_KEY</code>.
              </p>
              <ul className="text-[10px] space-y-1 text-gray-600 dark:text-zinc-300 list-disc pl-4">
                <li>Login / Cadastro Supabase Auth</li>
                <li>Operações seguras e limitadas por RLS</li>
                <li>Nenhuma chave privada exposta no bundle</li>
              </ul>
            </div>

            {/* 2. Backend Layer */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/30 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-950 dark:text-emerald-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 text-[10px]">2</span>
                <span>Backend Express (Servidor)</span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                Guarda exclusivamente a <code className="font-mono text-rose-600 dark:text-rose-400 font-bold">SUPABASE_SERVICE_ROLE_KEY</code>.
              </p>
              <ul className="text-[10px] space-y-1 text-emerald-900 dark:text-emerald-300 list-disc pl-4">
                <li>Rotas /api/supabase/privileged-sync</li>
                <li>Validação de tokens JWT dos usuários</li>
                <li>Operações administrativas privilegiadas</li>
              </ul>
            </div>

            {/* 3. Database Layer */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 dark:border-blue-900/40 dark:bg-blue-950/20 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-blue-950 dark:text-blue-200">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-blue-800 text-[10px]">3</span>
                <span>Banco de Dados (RLS)</span>
              </div>
              <p className="text-[11px] text-blue-800 dark:text-blue-300">
                Políticas ativas em todas as tabelas.
              </p>
              <ul className="text-[10px] space-y-1 text-blue-900 dark:text-blue-300 list-disc pl-4">
                <li><code>public.profiles</code></li>
                <li><code>public.user_tasks</code></li>
                <li><code>public.user_stats</code></li>
                <li>Acesso estritamente via <code>auth.uid() = user_id</code></li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-zinc-300 mb-2">
              Organização exata dos arquivos criados no projeto seguindo os padrões exigidos:
            </p>

            {[
              {
                path: '/src/lib/supabaseClient.ts',
                type: 'Frontend',
                desc: 'Cliente público do Supabase usando apenas VITE_SUPABASE_ANON_KEY para Auth e RLS.',
              },
              {
                path: '/server/supabaseAdmin.ts',
                type: 'Backend',
                desc: 'Módulo do servidor Express com SUPABASE_SERVICE_ROLE_KEY. NUNCA importado no frontend.',
              },
              {
                path: '/server.ts',
                type: 'Backend',
                desc: 'Servidor Express com endpoints privilegiados (/api/supabase/*) que validam JWT.',
              },
              {
                path: '/supabase/schema.sql',
                type: 'Banco de Dados',
                desc: 'Script SQL completo com criação de tabelas, Row Level Security (RLS) e Triggers.',
              },
              {
                path: '/.env.example',
                type: 'Configuração',
                desc: 'Documentação oficial das variáveis públicas (VITE_) e privadas do servidor.',
              },
            ].map((f) => (
              <div
                key={f.path}
                className="flex items-center justify-between rounded-xl border border-pink-100/70 bg-white/80 p-3 dark:border-zinc-800 dark:bg-zinc-800/60"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">{f.path}</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {f.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">{f.desc}</p>
                </div>
                <button
                  onClick={() => copyPath(f.path)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700"
                  title="Copiar caminho"
                >
                  {copiedFile === f.path ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'env' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-pink-100 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/50 space-y-2">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-500" />
                Variáveis para o Frontend (.env)
              </h4>
              <pre className="rounded-xl bg-gray-900 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto">
{`# Disponíveis no cliente browser via import.meta.env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...`}
              </pre>
            </div>

            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-4 dark:border-rose-900/50 dark:bg-rose-950/20 space-y-2">
              <h4 className="font-bold text-rose-950 dark:text-rose-200 flex items-center gap-1.5">
                <Server className="h-4 w-4 text-rose-500" />
                Variáveis Privadas do Backend (Apenas no Servidor Node)
              </h4>
              <pre className="rounded-xl bg-gray-900 p-3 font-mono text-[11px] text-rose-300 overflow-x-auto">
{`# SECRET KEY - NUNCA colocar VITE_ e NUNCA expor no frontend!
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...secret_service_role_key`}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'rls' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-2">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Políticas de Segurança SQL Aplicadas (`/supabase/schema.sql`)
              </h4>
              <pre className="rounded-xl bg-gray-900 p-3 font-mono text-[10px] text-emerald-300 overflow-x-auto leading-relaxed">
{`-- Ativar Row Level Security em todas as tabelas
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Exemplo de política de acesso estrito:
CREATE POLICY "Usuários veem apenas suas tarefas"
  ON public.user_tasks FOR SELECT
  USING (auth.uid() = user_id);`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
