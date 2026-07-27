import React from 'react';
import { X, Trophy, Crown, CheckCircle2, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { LEVEL_SYSTEM } from '../data/initialData';
import { LevelInfo } from '../types';

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevelInfo: LevelInfo;
  totalXp: number;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  onClose,
  currentLevelInfo,
  totalXp,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[32px] border border-pink-100/80 bg-white/80 p-6 sm:p-8 shadow-2xl backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/80">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-50 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Trophy className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-serif font-bold text-gray-800 dark:text-zinc-100">
                Jornada dos 10 Níveis Zen
              </h2>
              <p className="text-xs text-gray-400">
                Seu XP atual: <strong className="text-amber-500">{totalXp} XP</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-pink-50 hover:text-gray-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Level List Grid */}
        <div className="mt-4 space-y-2.5">
          {LEVEL_SYSTEM.map((lvl) => {
            const isUnlocked = currentLevelInfo.level >= lvl.level;
            const isCurrent = currentLevelInfo.level === lvl.level;

            return (
              <div
                key={lvl.level}
                className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                  isCurrent
                    ? 'border-amber-300 bg-amber-50/80 shadow-xs dark:bg-amber-950/40 dark:border-amber-600'
                    : isUnlocked
                    ? 'border-pink-100 bg-pink-50/30 dark:border-zinc-800 dark:bg-zinc-800/20'
                    : 'border-gray-100 bg-gray-50/50 opacity-60 dark:border-zinc-800 dark:bg-zinc-900/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-sm ${
                      isCurrent
                        ? 'bg-amber-400 text-white shadow-xs'
                        : isUnlocked
                        ? 'bg-pink-400 text-white'
                        : 'bg-gray-200 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500'
                    }`}
                  >
                    {lvl.level === 10 ? <Crown className="h-5 w-5" /> : lvl.kanji}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-600 dark:text-pink-300">
                        Nível {lvl.level}
                      </span>
                      {isCurrent && (
                        <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          Nível Atual
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">
                      {lvl.title}
                    </h4>
                    <p className="text-xs text-gray-400">{lvl.perk}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
                    {lvl.minXp} XP
                  </span>
                  <div className="mt-0.5 text-[10px] text-gray-400">
                    {isUnlocked ? (
                      <span className="text-pink-500 font-bold flex items-center justify-end gap-0.5">
                        <CheckCircle2 className="h-3 w-3" /> Alcançado
                      </span>
                    ) : (
                      <span className="flex items-center justify-end gap-0.5">
                        <Lock className="h-3 w-3" /> Bloqueado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-pink-400 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-pink-500 shadow-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
