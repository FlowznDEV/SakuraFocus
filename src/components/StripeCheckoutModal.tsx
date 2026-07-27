import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, ShieldCheck, Sparkles, ExternalLink, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLocked?: boolean;
  onConfirmPaid?: () => void;
  user?: {
    id: string;
    email: string;
  } | null;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  isLocked = false,
  onConfirmPaid,
  user,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingDb, setCheckingDb] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<boolean>(false);
  const [dbMessage, setDbMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const checkDatabasePayment = async () => {
    setCheckingDb(true);
    setDbMessage(null);
    try {
      const emailQuery = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const response = await fetch(`/api/check-subscription${emailQuery}`);
      
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Resposta não-JSON ao consultar o banco de dados:', text);
        setDbMessage({
          type: 'info',
          text: 'Ainda não foi encontrado nenhum pagamento ativo no banco de dados. Se você acabou de pagar, aguarde alguns segundos e clique em verificar novamente.'
        });
        return;
      }

      const data = await response.json();

      if (data.subscribed) {
        setDbMessage({
          type: 'success',
          text: 'Pagamento verificado no banco de dados Supabase! Seu acesso ao Sakura Pro foi liberado com sucesso.'
        });
        if (onConfirmPaid) {
          onConfirmPaid();
        }
      } else {
        setDbMessage({
          type: 'info',
          text: data.error
            ? `Erro de consulta no banco: ${data.error}. Nenhum registro de pagamento ativo encontrado.`
            : 'Nenhum registro de pagamento ativo foi encontrado na tabela "subscriptions" do Supabase até o momento. Se já realizou o pagamento via Stripe, aguarde a atualização do webhook e clique em verificar novamente.'
        });
      }
    } catch (err: any) {
      setDbMessage({
        type: 'error',
        text: 'Erro ao consultar o banco de dados do Supabase: ' + (err.message || String(err))
      });
    } finally {
      setCheckingDb(false);
    }
  };

  useEffect(() => {
    // Check URL parameters for Checkout return status
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      setCheckoutSuccess(true);
      checkDatabasePayment();
    }
  }, []);

  if (!isOpen) return null;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    const planName = 'Sakura Pro - Plano Único';
    const amount = 3700; // R$ 37,00 em centavos
    const directStripePaymentLink = 'https://buy.stripe.com/3cI4gy2W34zp413avp7Vm02';

    try {
      // Chama o endpoint /create-checkout
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

      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      // Se a chave da Stripe do servidor falhar por IP ou autorização, usa o link direto da Stripe
      console.warn('Sessão backend falhou ou restrição de IP, redirecionando para link direto da Stripe:', data.detail || data.error);
      window.open(directStripePaymentLink, '_blank', 'noopener,noreferrer');
      setLoading(false);
    } catch (err: any) {
      console.warn('Erro ao conectar ao servidor de checkout, usando link direto da Stripe:', err);
      window.open(directStripePaymentLink, '_blank', 'noopener,noreferrer');
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
              <h2 className="text-lg font-bold text-slate-800 dark:text-rose-100">
                {isLocked ? '🔒 Limite Gratuito Atingido (3/3)' : 'Sakura Pro & Stripe Checkout'}
              </h2>
              <p className="text-xs text-pink-700/70 dark:text-rose-200/60 font-medium">
                {isLocked
                  ? 'Assine o Sakura Pro para desbloquear o acesso total ao aplicativo'
                  : 'Acesso Vitalício e Ilimitado ao Sakura Pro'}
              </p>
            </div>
          </div>
          {!isLocked && (
            <button
              onClick={onClose}
              className="rounded-full p-2 text-rose-400 hover:bg-pink-100/80 dark:text-rose-300 dark:hover:bg-zinc-800 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Locked Banner */}
        {isLocked && (
          <div className="mt-4 rounded-2xl border border-pink-300/80 bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white shadow-md">
            <div className="flex items-start space-x-3">
              <Lock className="h-5 w-5 shrink-0 mt-0.5 text-amber-300" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-sm">Acesso Bloqueado!</p>
                <p className="opacity-95">
                  Você concluiu 3 tarefas gratuitas hoje. Para continuar utilizando o SakuraFocus e ter acesso ilimitado, realize o pagamento do plano Sakura Pro.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Database verification message banner */}
        {dbMessage && (
          <div
            className={`mt-4 rounded-2xl border p-4 text-xs flex items-start space-x-3 ${
              dbMessage.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200'
                : dbMessage.type === 'error'
                ? 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200'
                : 'border-blue-300 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200'
            }`}
          >
            {dbMessage.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {dbMessage.type === 'success' ? 'Pagamento Confirmado no Supabase!' : 'Verificação do Banco de Dados'}
              </p>
              <p className="text-[11px] mt-0.5 opacity-90">{dbMessage.text}</p>
            </div>
          </div>
        )}

        {/* Success Alert if coming back from Stripe */}
        {checkoutSuccess && !dbMessage && (
          <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/90 p-4 text-xs text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-200">Retorno do Checkout do Stripe</p>
              <p className="text-[11px] mt-0.5 text-emerald-800/80 dark:text-emerald-300/80">
                Consultando a tabela <code className="font-mono bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded">subscriptions</code> no Supabase para validar a confirmação do webhook...
              </p>
            </div>
          </div>
        )}

        {/* Plan Section - Plano Único */}
        <div className="mt-5 space-y-3">
          <div className="relative rounded-2xl border border-pink-500 bg-pink-50/80 p-5 text-left shadow-xs dark:border-pink-500 dark:bg-pink-950/30">
            <span className="absolute -top-2.5 right-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs">
              Acesso Vitalício
            </span>
            <div className="text-sm font-bold text-slate-800 dark:text-rose-100">Sakura Pro - Plano Único</div>
            <div className="text-2xl font-extrabold text-pink-600 dark:text-pink-400 mt-1">
              R$ 37,00 <span className="text-xs font-normal text-slate-500 dark:text-rose-200/70">(pago uma única vez)</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-rose-200/80 mt-1">
              Pagamento único sem mensalidades ou cobranças recorrentes.
            </div>
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

          {/* Checkout Submit Button & Direct Link */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:opacity-95 py-3.5 text-xs font-bold text-white transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Redirecionando para o Stripe...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Ir para o Stripe Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <a
              href="https://buy.stripe.com/3cI4gy2W34zp413avp7Vm02"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-1.5 rounded-2xl border border-pink-200 bg-white/80 hover:bg-pink-50 py-2.5 text-xs font-bold text-pink-700 transition dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-rose-200 dark:hover:bg-zinc-800"
            >
              <span>Abrir Checkout em Nova Aba (Direct Link)</span>
              <ExternalLink className="h-3.5 w-3.5 text-pink-500" />
            </a>

            {/* Verification Button against Supabase Database */}
            <button
              type="button"
              onClick={checkDatabasePayment}
              disabled={checkingDb}
              className="w-full flex items-center justify-center space-x-2 rounded-2xl border border-pink-300 bg-pink-50/80 hover:bg-pink-100/80 py-2.5 text-xs font-bold text-pink-800 transition dark:border-pink-800 dark:bg-zinc-800 dark:text-rose-200 dark:hover:bg-zinc-700 disabled:opacity-50"
            >
              {checkingDb ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando Banco de Dados...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                  <span>Verificar Status do Pagamento no Banco de Dados</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        {!isLocked && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-pink-100/80 hover:bg-pink-200/80 px-5 py-2.5 text-xs font-bold text-pink-800 dark:bg-zinc-800 dark:text-rose-200 dark:hover:bg-zinc-700 transition"
            >
              Fechar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
