import React from 'react';
import { Flame, Moon, Sun, Flower, Trophy, Sparkles, Target, CheckCircle2, Database, CreditCard } from 'lucide-react';
import { LevelInfo } from '../types';

interface HeaderProps {
  streakDays: number;
  completedTasksToday: number;
  totalTasksToday: number;
  xpEarnedToday: number;
  currentLevelInfo: LevelInfo;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sakuraActive: boolean;
  toggleSakura: () => void;
  onOpenLevelModal: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenStripeModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streakDays,
  completedTasksToday,
  totalTasksToday,
  xpEarnedToday,
  currentLevelInfo,
  isDarkMode,
  toggleDarkMode,
  sakuraActive,
  toggleSakura,
  onOpenLevelModal,
  onOpenSupabaseModal,
  onOpenStripeModal,
}) => {
  const dailyProgressPercent =
    totalTasksToday > 0 ? Math.round((completedTasksToday / totalTasksToday) * 100) : 0;

  return (
    <header
      id="app-main-header"
      className="sticky top-0 z-30 w-full border-b backdrop-blur-[12px] backdrop-saturate-[180%] transition-colors duration-300 bg-white/60 dark:bg-zinc-900/60 border-pink-100/60 dark:border-zinc-800/60 px-6 py-4 shadow-2xs"
    >
      <div className="mx-auto max-w-6xl">
        {/* Top bar: Brand + Progress + Quick Stats */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Logo Brand */}
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-50 border border-pink-100 text-pink-400 shadow-xs dark:bg-zinc-800 dark:border-zinc-700">
              <span className="text-2xl font-serif">🌸</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-serif tracking-tighter text-pink-400 dark:text-pink-300">
                  SakuraFocus
                </h1>
                <button
                  onClick={onOpenLevelModal}
                  className="rounded-full bg-pink-50 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider text-pink-700 border border-pink-100 hover:bg-pink-100 transition dark:bg-rose-950 dark:border-rose-900 dark:text-rose-300"
                >
                  {currentLevelInfo.kanji} Nível {currentLevelInfo.level}
                </button>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-zinc-400 font-semibold">
                Serenidade em cada ação
              </p>
            </div>
          </div>

          {/* Center Daily Progress Bar */}
          <div className="flex-1 max-w-md mx-0 lg:mx-6">
            <div className="flex justify-between mb-1.5 text-[10px] uppercase tracking-widest text-gray-500 dark:text-zinc-400 font-semibold">
              <span>Progresso Diário</span>
              <span className="text-pink-500 font-bold">{dailyProgressPercent}% Concluído</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 rounded-full transition-all duration-500"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Right Stats & Toggles */}
          <div className="flex items-center justify-between lg:justify-end gap-6">
            <div className="flex items-center gap-5">
              <div id="header-streak-card" className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Dias de Batalha</p>
                <p className="text-2xl font-serif flex items-center justify-end gap-1.5 text-zinc-800 dark:text-zinc-100">
                  <span className="text-orange-400 text-lg">🔥</span> {streakDays}
                </p>
              </div>

              <div className="h-10 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block" />

              <div id="header-quick-goals-summary" className="text-right hidden sm:block">
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-0.5">Metas Hoje</p>
                <p className="text-2xl font-serif text-zinc-800 dark:text-zinc-100">
                  {String(completedTasksToday).padStart(2, '0')}/{String(totalTasksToday).padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center space-x-1.5 border-l border-gray-200/80 dark:border-zinc-800 pl-4">
              <button
                id="header-stripe-btn"
                onClick={onOpenStripeModal}
                className="p-2 rounded-xl text-pink-600 bg-pink-50/80 border border-pink-200 hover:bg-pink-100/90 transition dark:bg-pink-950/60 dark:border-pink-800 dark:text-pink-300"
                title="Stripe Checkout & Sakura Pro"
              >
                <CreditCard className="h-4 w-4" />
              </button>

              <button
                id="header-supabase-btn"
                onClick={onOpenSupabaseModal}
                className="p-2 rounded-xl text-emerald-600 bg-emerald-50/70 border border-emerald-100 hover:bg-emerald-100/80 transition dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300"
                title="Login no Banco de Dados"
              >
                <Database className="h-4 w-4" />
              </button>

              <button
                id="header-level-btn"
                onClick={onOpenLevelModal}
                className="p-2 rounded-xl text-amber-500 bg-pink-50/60 border border-pink-100 hover:bg-pink-100/80 transition dark:bg-zinc-800 dark:border-zinc-700"
                title="Ver troféus e níveis"
              >
                <Trophy className="h-4 w-4" />
              </button>

              <button
                id="header-sakura-toggle"
                onClick={toggleSakura}
                className={`p-2 rounded-xl text-xs transition border ${
                  sakuraActive
                    ? 'bg-pink-100/80 border-pink-200 text-pink-600 dark:bg-pink-950 dark:border-pink-800 dark:text-pink-300'
                    : 'bg-white border-gray-100 text-gray-400 hover:bg-pink-50 dark:bg-zinc-800 dark:border-zinc-700'
                }`}
                title={sakuraActive ? 'Pétalas ativas (clique para pausar)' : 'Ativar pétalas de Sakura'}
              >
                <Flower className={`h-4 w-4 ${sakuraActive ? 'animate-pulse' : ''}`} />
              </button>

              <button
                id="header-theme-toggle"
                onClick={toggleDarkMode}
                className="p-2 rounded-xl border border-gray-100 bg-white text-gray-600 hover:bg-pink-50 transition dark:bg-zinc-800 dark:border-zinc-700 dark:text-amber-300"
                title={isDarkMode ? 'Modo Claro Zen' : 'Modo Escuro'}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-indigo-600" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
