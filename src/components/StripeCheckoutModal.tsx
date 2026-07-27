import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    id: string;
    email: string;
  } | null;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({ isOpen, onClose, user }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check URL parameters for Checkout return status
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setCheckoutSuccess(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    const isYearly = selectedPlan === 'yearly';
    const planName = isYearly ? 'Sakura Pro - Plano Anual' : 'Sakura Pro - Plano Mensal';
    const amount = isYearly ? 2900 : 1490; // R$ 29,00 or R$ 14,90 em centavos

    try {
      // Chama o endpoint /create-checkout conforme especificação
      const response = await fetch('/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id || undefined,
          user_email: user?.email || undefined,
          plan_name: planName,
          amount: amount,
          currency: 'brl',
          success_url: `${window.location.origin}/?checkout=success`,
          cancel_url: `${window.location.origin}/?checkout=canceled`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Erro ao conectar ao Stripe Checkout.');
      }

      // Requisito: O endpoint retorna apenas a URL e o frontend redireciona automaticamente
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Nenhuma URL do Stripe foi retornada pelo servidor.');
      }
    } catch (err: any) {
      console.error('Erro no checkout:', err);
      setError(err.message || 'Ocorreu um erro ao gerar a sessão do Stripe Checkout.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[32px] border border-pink-200/80 bg-gradient-to-b from-white via-pink-50/40 to-rose-50/30 p-6 sm:p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-pink-100/80 pb-4 dark:border-zinc-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500/10 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-rose-100">Sakura Pro & Stripe Checkout</h2>
              <p className="text-xs text-pink-700/70 dark:text-rose-200/60 font-medium">
                Pagamentos Seguros com FastAPI & Supabase
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-rose-400 hover:bg-pink-100/80 dark:text-rose-300 dark:hover:bg-zinc-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Success Alert if coming back from Stripe */}
        {checkoutSuccess && (
          <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-xs text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-200">Pagamento Confirmado pelo Stripe!</p>
              <p className="text-[11px] mt-0.5 text-emerald-800/80 dark:text-emerald-300/80">
                O webhook do Stripe recebeu o evento <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">checkout.session.completed</code> e atualizou sua assinatura na tabela <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">subscriptions</code> no Supabase.
              </p>
            </div>
          </div>
        )}

        {/* Security Rule Highlights */}
        <div className="mt-4 rounded-2xl border border-pink-200/60 bg-white/70 p-3.5 text-xs text-slate-700 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-rose-200 space-y-1.5">
          <div className="flex items-center space-x-2 font-bold text-pink-600 dark:text-rose-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Arquitetura de Segurança Stripe</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-600 dark:text-rose-200/70">
            <li><strong>STRIPE_SECRET_KEY:</strong> Mantida estritamente privada no backend FastAPI/Node.</li>
            <li><strong>Frontend Seguro:</strong> O navegador nunca acessa chaves privadas de pagamento.</li>
            <li><strong>Redirecionamento Direto:</strong> O backend retorna apenas a URL oficial do Checkout.</li>
            <li><strong>Sincronização Webhook:</strong> Evento atualiza a tabela <code className="font-mono">subscriptions</code> via Supabase Service Role.</li>
          </ul>
        </div>

        {/* Plan Selector */}
        <div className="mt-5 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-rose-200">
            Selecione seu Plano Sakura Pro:
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPlan('monthly')}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedPlan === 'monthly'
                  ? 'border-pink-500 bg-pink-50/80 shadow-xs dark:border-pink-500 dark:bg-pink-950/30'
                  : 'border-pink-100/80 bg-white/60 hover:bg-pink-50/30 dark:border-zinc-800 dark:bg-zinc-800/40'
              }`}
            >
              <div className="text-xs font-bold text-slate-800 dark:text-rose-100">Mensal</div>
              <div className="text-lg font-extrabold text-pink-600 dark:text-pink-400 mt-1">R$ 14,90<span className="text-[10px] font-normal text-slate-500">/mês</span></div>
              <div className="text-[10px] text-slate-500 dark:text-rose-200/60 mt-1">Flexibilidade total sem fidelidade</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan('yearly')}
              className={`relative rounded-2xl border p-4 text-left transition ${
                selectedPlan === 'yearly'
                  ? 'border-pink-500 bg-pink-50/80 shadow-xs dark:border-pink-500 dark:bg-pink-950/30'
                  : 'border-pink-100/80 bg-white/60 hover:bg-pink-50/30 dark:border-zinc-800 dark:bg-zinc-800/40'
              }`}
            >
              <span className="absolute -top-2 -right-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                Economize 80%
              </span>
              <div className="text-xs font-bold text-slate-800 dark:text-rose-100">Anual</div>
              <div className="text-lg font-extrabold text-pink-600 dark:text-pink-400 mt-1">R$ 29,00<span className="text-[10px] font-normal text-slate-500">/ano</span></div>
              <div className="text-[10px] text-slate-500 dark:text-rose-200/60 mt-1">Apenas R$ 2,41 por mês</div>
            </button>
          </div>

          {/* Features list */}
          <div className="rounded-2xl border border-pink-100/80 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-800/60 space-y-2">
            <div className="text-xs font-bold text-slate-800 dark:text-rose-100 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-pink-500" />
              Recursos do Plano Sakura Pro
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-rose-200/80">
              <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-pink-500 shrink-0" /> Sincronização em Nuvem</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-pink-500 shrink-0" /> Quebra com Gemini AI</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-pink-500 shrink-0" /> Relatórios de Produtividade</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-pink-500 shrink-0" /> Insígnias Exclusivas</div>
            </div>
          </div>

          {/* User Email Info */}
          {user && (
            <div className="text-[11px] text-slate-500 dark:text-rose-200/60 flex items-center justify-between px-1">
              <span>Checkout vinculado ao usuário:</span>
              <span className="font-bold text-slate-700 dark:text-rose-200">{user.email}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 space-y-1">
              <div className="flex items-center space-x-2 font-bold">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                <span>Erro ao Iniciar Checkout</span>
              </div>
              <p className="text-[11px]">{error}</p>
            </div>
          )}

          {/* Checkout Submit Button */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:opacity-95 py-3.5 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Gerando Sessão do Stripe Checkout...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Ir para o Stripe Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
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
