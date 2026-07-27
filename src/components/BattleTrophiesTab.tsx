import React from 'react';
import { Badge, UserStats } from '../types';
import { Trophy, Shield, Award, Flame, CheckCircle2, Lock, Sparkles, Swords, Crown, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BattleTrophiesTabProps {
  badges: Badge[];
  userStats: UserStats;
  onClaimBadgeReward: (badgeId: string, xpBonus: number) => void;
}

export const BattleTrophiesTab: React.FC<BattleTrophiesTabProps> = ({
  badges,
  userStats,
  onClaimBadgeReward,
}) => {
  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  // Calculate current week active days
  const todayDate = new Date().toISOString().split('T')[0];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const handleClaim = (b: Badge) => {
    if (b.unlocked) return;
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#FFC0CB', '#FF69B4', '#10B981'],
    });
    onClaimBadgeReward(b.id, b.xpBonus);
  };

  return (
    <div id="battle-trophies-tab-container" className="space-y-6">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-[32px] border border-pink-100/80 bg-white/50 p-6 sm:p-8 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:bg-zinc-900/50 dark:border-zinc-800/80">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-pink-100/80 px-3 py-1 text-xs font-bold text-pink-700 dark:bg-pink-950 dark:text-pink-200">
              <Swords className="h-3.5 w-3.5 text-pink-500" />
              <span>Desafios & Conquistas Semanal</span>
            </div>
            <h2 className="text-2xl font-serif text-gray-800 sm:text-3xl dark:text-zinc-100">
              Sistema de Batalhas & Troféus
            </h2>
            <p className="text-xs text-gray-400 max-w-md">
              Desbloqueie emblemas sagrados cumprindo desafios semanais de disciplina, foco e consistência.
            </p>
          </div>

          {/* Trophy Count Badge */}
          <div className="flex items-center space-x-3 rounded-2xl bg-white p-4 shadow-xs border border-pink-100 dark:bg-zinc-800 dark:border-zinc-700">
            <Trophy className="h-8 w-8 text-amber-400 animate-bounce" />
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Emblemas Obtidos</p>
              <p className="text-2xl font-serif text-gray-800 dark:text-zinc-100">
                {unlockedCount} <span className="text-sm font-sans text-pink-300">/ {badges.length}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Consistency Battle Heatmap / Matrix */}
      <div className="rounded-[32px] border border-pink-100/80 bg-white/50 p-6 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between pb-3 border-b border-pink-50 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-pink-400" />
            <h3 className="text-sm font-serif font-bold text-gray-800 dark:text-zinc-100">
              Matriz de Consistência Semanal
            </h3>
          </div>
          <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
            <Flame className="h-3.5 w-3.5" /> {userStats.streakDays} Dias de Sequência
          </span>
        </div>

        {/* 7 Days Grid */}
        <div className="mt-4 grid grid-cols-7 gap-2">
          {daysOfWeek.map((day, idx) => {
            const isCompleted = idx < Math.min(7, userStats.streakDays % 7 || (userStats.streakDays > 0 ? 7 : 0));
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center border transition ${
                  isCompleted
                    ? 'border-pink-200 bg-pink-50 text-pink-900 dark:border-pink-900 dark:bg-pink-950 dark:text-pink-200'
                    : 'border-gray-100 bg-gray-50/50 text-gray-400 dark:border-zinc-800 dark:bg-zinc-800/40'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest">{day}</span>
                <div className="mt-1.5 flex h-7 w-7 items-center justify-center rounded-full">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-pink-500" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-gray-200 dark:bg-zinc-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Emblem / Trophy Cabinet */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-serif font-bold text-gray-800 dark:text-zinc-100 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" />
            Galeria de Troféus & Emblemas
          </h3>
          <span className="text-xs text-gray-400">
            Ganhe XP ao desbloquear novos troféus
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => {
            const isUnlocked = b.unlocked || b.currentCount >= b.requiredCount;
            const progressPct = Math.min(100, Math.round((b.currentCount / b.requiredCount) * 100));

            return (
              <div
                key={b.id}
                className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                  isUnlocked
                    ? 'border-pink-200 bg-white shadow-xs dark:border-pink-900 dark:bg-zinc-900'
                    : 'border-pink-50 bg-gray-50/40 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isUnlocked
                          ? 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-300 dark:bg-zinc-800 dark:text-zinc-600'
                      }`}
                    >
                      {isUnlocked ? (
                        <Trophy className="h-5 w-5" />
                      ) : (
                        <Lock className="h-5 w-5" />
                      )}
                    </div>

                    <span className="flex items-center space-x-1 rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-bold text-pink-600 border border-pink-100 dark:bg-pink-950 dark:border-pink-900 dark:text-pink-300">
                      <Sparkles className="h-3 w-3 text-pink-400" />
                      <span>+{b.xpBonus} XP</span>
                    </span>
                  </div>

                  <h4 className="mt-3 text-sm font-bold text-gray-800 dark:text-zinc-100">
                    {b.title}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Bottom Progress or Claim State */}
                <div className="mt-4 pt-3 border-t border-pink-50 dark:border-zinc-800">
                  {isUnlocked ? (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1 text-xs font-bold text-pink-600 dark:text-pink-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Desbloqueado!</span>
                      </span>

                      {!b.unlocked && b.currentCount >= b.requiredCount && (
                        <button
                          onClick={() => handleClaim(b)}
                          className="rounded-full bg-pink-400 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-pink-500"
                        >
                          Resgatar XP
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="mb-1 flex justify-between text-[10px] uppercase font-bold text-gray-400">
                        <span>Progresso</span>
                        <span>
                          {b.currentCount} / {b.requiredCount}
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-pink-400 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
