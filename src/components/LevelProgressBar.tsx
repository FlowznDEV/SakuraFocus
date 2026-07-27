import React from 'react';
import { LevelInfo } from '../types';
import { LEVEL_SYSTEM } from '../data/initialData';
import { Trophy, Crown, Sparkles, ChevronRight, Award } from 'lucide-react';

interface LevelProgressBarProps {
  totalXp: number;
  currentLevelInfo: LevelInfo;
  onOpenLevelModal: () => void;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  totalXp,
  currentLevelInfo,
  onOpenLevelModal,
}) => {
  const isMaxLevel = currentLevelInfo.level >= 10;
  const currentLevelMinXp = currentLevelInfo.minXp;
  const currentLevelMaxXp = currentLevelInfo.maxXp;

  const xpInCurrentLevel = Math.max(0, totalXp - currentLevelMinXp);
  const xpNeededForLevel = currentLevelMaxXp - currentLevelMinXp;

  const progressPercent = isMaxLevel
    ? 100
    : Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)));

  const xpToNextLevel = isMaxLevel ? 0 : Math.max(0, currentLevelMaxXp - totalXp);

  return (
    <div
      id="level-progress-bar-card"
      className="rounded-[32px] border border-pink-100/80 bg-white/50 p-6 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:bg-zinc-900/50 dark:border-zinc-800/80"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Nível Atual</p>
          <h3 className="text-3xl sm:text-4xl font-serif text-zinc-900 dark:text-zinc-100">
            {String(currentLevelInfo.level).padStart(2, '0')}{' '}
            <span className="text-lg text-pink-300 font-normal">/ 10</span>
          </h3>
          <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 mt-0.5">
            {currentLevelInfo.title}
          </p>
        </div>

        <button
          onClick={onOpenLevelModal}
          className="w-11 h-11 bg-pink-50 rounded-full flex items-center justify-center text-pink-400 hover:bg-pink-100 transition border border-pink-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-pink-300"
          title="Ver todos os níveis"
        >
          {isMaxLevel ? (
            <Crown className="h-5 w-5 text-amber-500" />
          ) : (
            <span className="text-lg font-serif">🌸</span>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-400 mb-2">
        <span>
          {isMaxLevel ? (
            <strong className="text-emerald-600 font-bold">Nível Máximo Alcançado!</strong>
          ) : (
            <>
              Faltam <span className="font-bold text-pink-600 dark:text-pink-400">{xpToNextLevel} XP</span> para o Nível {currentLevelInfo.level + 1}
            </>
          )}
        </span>
        <span className="font-bold text-pink-400">{progressPercent}%</span>
      </div>

      {/* Thin Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-pink-400 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Perk info */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 dark:text-zinc-400 pt-2 border-t border-gray-50 dark:border-zinc-800">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-pink-400" />
          <span>Vantagem: {currentLevelInfo.perk}</span>
        </span>
        <span className="font-bold text-gray-500 dark:text-zinc-300">{totalXp} Total XP</span>
      </div>
    </div>
  );
};
