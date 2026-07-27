import React, { useState } from 'react';
import { Sparkles, RefreshCw, Quote, Compass, Feather, ShieldCheck, HeartHandshake } from 'lucide-react';
import { ZenQuote } from '../types';

interface GeminiQuoteCardProps {
  currentQuote: ZenQuote;
  onUpdateQuote: (newQuote: ZenQuote) => void;
  level: number;
  streak: number;
  completedToday: number;
  totalToday: number;
}

export const GeminiQuoteCard: React.FC<GeminiQuoteCardProps> = ({
  currentQuote,
  onUpdateQuote,
  level,
  streak,
  completedToday,
  totalToday,
}) => {
  const [selectedMood, setSelectedMood] = useState<'foco' | 'bushido' | 'calmaria' | 'gentileza'>('foco');
  const [loading, setLoading] = useState<boolean>(false);

  const moods = [
    { id: 'foco', label: 'Foco Samurai', icon: Compass },
    { id: 'bushido', label: 'Disciplina Bushido', icon: ShieldCheck },
    { id: 'calmaria', label: 'Calmaria Zen', icon: Feather },
    { id: 'gentileza', label: 'Gentileza Kaizen', icon: HeartHandshake },
  ] as const;

  const handleGenerateQuote = async (moodOverride?: 'foco' | 'bushido' | 'calmaria' | 'gentileza') => {
    const moodToUse = moodOverride || selectedMood;
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood: moodToUse,
          level,
          streak,
          completedToday,
          totalToday,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.quote) {
          onUpdateQuote({
            quote: data.quote,
            author: data.author || 'Mestre Zen',
            kanji: data.kanji || '集中',
            kanjiMeaning: data.kanjiMeaning || 'Foco',
            mood: moodToUse,
          });
        }
      }
    } catch (err) {
      console.error('Erro ao chamar Gemini quote:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="gemini-quote-card"
      className="relative overflow-hidden rounded-[28px] border border-pink-100/80 bg-white/50 p-4 sm:p-5 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] transition dark:border-zinc-800/80 dark:bg-zinc-900/50"
    >
      {/* Background Japanese Watermark / Kanji Accent */}
      <div className="pointer-events-none absolute -right-3 -top-5 text-7xl font-serif text-pink-200/40 dark:text-rose-950/40 select-none">
        {currentQuote.kanji || '櫻'}
      </div>

      <div className="relative z-10">
        {/* Header line: Gemini badge + Mood selector */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 dark:text-pink-300">
              Sabedoria Zen (Gemini IA)
            </span>
          </div>

          {/* Mood chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {moods.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMood === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMood(m.id);
                    handleGenerateQuote(m.id);
                  }}
                  disabled={loading}
                  className={`flex items-center space-x-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                    isSelected
                      ? 'bg-pink-400 text-white shadow-xs dark:bg-pink-600'
                      : 'bg-white/80 text-gray-600 hover:bg-pink-100/60 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Quote Content */}
        <div className="my-1.5 flex items-start space-x-3">
          <Quote className="h-6 w-6 flex-shrink-0 text-pink-300 dark:text-pink-800 rotate-180 mt-1" />
          <div className="flex-1">
            <p className="text-sm sm:text-base italic font-serif text-pink-900 dark:text-zinc-100 leading-relaxed tracking-wide">
              "{currentQuote.quote}"
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-pink-700 dark:text-pink-300">
                — {currentQuote.author}
              </span>
              {currentQuote.kanji && (
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-pink-600 border border-pink-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-pink-300">
                  {currentQuote.kanji} ({currentQuote.kanjiMeaning})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Refresh Frase */}
        <div className="mt-2.5 flex justify-end">
          <button
            id="btn-generate-zen-quote"
            onClick={() => handleGenerateQuote()}
            disabled={loading}
            className="flex items-center space-x-1.5 rounded-full border border-pink-200/80 bg-white px-3 py-1 text-xs font-semibold text-pink-600 shadow-2xs hover:bg-pink-50 transition disabled:opacity-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-pink-300"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin text-pink-500' : ''}`} />
            <span>{loading ? 'Consultando IA...' : 'Nova Frase Zen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
