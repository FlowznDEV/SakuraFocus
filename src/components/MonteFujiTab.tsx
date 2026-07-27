import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Mountain, Coffee, CheckCircle2, Music, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MonteFujiTabProps {
  onCompleteFocusSession: (minutes: number, xpEarned: number) => void;
  isZenFocusActive?: boolean;
  onToggleZenFocus?: (active: boolean) => void;
}

type TimerMode = 'foco' | 'pausa_curta' | 'pausa_longa';

export const MonteFujiTab: React.FC<MonteFujiTabProps> = ({
  onCompleteFocusSession,
  isZenFocusActive = false,
  onToggleZenFocus,
}) => {
  const [mode, setMode] = useState<TimerMode>('foco');
  const [targetMinutes, setTargetMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessionsToday, setCompletedSessionsToday] = useState<number>(0);

  // Ambient sound generator state
  const [soundType, setSoundType] = useState<'rain' | 'bell' | 'wind' | 'stream' | 'none'>('none');
  const [volume, setVolume] = useState<number>(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<{ source?: AudioNode; gain?: GainNode }>({});

  const modeConfigs: Record<TimerMode, { title: string; defaultMin: number; xp: number }> = {
    foco: { title: 'Foco Profundo', defaultMin: 25, xp: 30 },
    pausa_curta: { title: 'Pausa Curta', defaultMin: 5, xp: 5 },
    pausa_longa: { title: 'Pausa Longa', defaultMin: 15, xp: 10 },
  };

  // Sound Synthesizer via Web Audio API (no external asset downloads required!)
  const stopAmbientSound = () => {
    if (activeNodesRef.current.source) {
      try {
        (activeNodesRef.current.source as any).stop?.();
        activeNodesRef.current.source.disconnect();
      } catch (e) {}
      activeNodesRef.current.source = undefined;
    }
  };

  const playAmbientSound = (type: 'rain' | 'bell' | 'wind' | 'stream' | 'none') => {
    stopAmbientSound();
    if (type === 'none') return;

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === 'rain' || type === 'wind' || type === 'stream') {
        // Pink/White noise generator for rain or wind
        const bufferSize = ctx.sampleRate * 3;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Filter for specific ambient feel
        const filter = ctx.createBiquadFilter();
        if (type === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1000, ctx.currentTime);
        } else if (type === 'wind') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, ctx.currentTime);
          filter.Q.setValueAtTime(3, ctx.currentTime);
        } else {
          // stream
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(1500, ctx.currentTime);
        }

        whiteNoise.connect(filter);
        filter.connect(masterGain);
        whiteNoise.start();

        activeNodesRef.current = { source: whiteNoise, gain: masterGain };
      } else if (type === 'bell') {
        // Singing bowl / Zen bell chime interval
        const playBellChime = () => {
          if (!audioCtxRef.current) return;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(432, ctx.currentTime); // 432 Hz Zen frequency

          gain.gain.setValueAtTime(volume * 0.8, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 4.5);
        };

        playBellChime();
        const bellInterval = setInterval(playBellChime, 10000);
        activeNodesRef.current = {
          source: {
            stop: () => clearInterval(bellInterval),
            disconnect: () => {},
          } as any,
          gain: masterGain,
        };
      }
    } catch (err) {
      console.error('Erro ao tocar áudio ambiental:', err);
    }
  };

  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  // Timer Tick Effect
  useEffect(() => {
    let interval: any = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      stopAmbientSound();

      // Session finished celebration
      const xpEarned = modeConfigs[mode].xp;
      onCompleteFocusSession(targetMinutes, xpEarned);

      if (mode === 'foco') {
        setCompletedSessionsToday((prev) => prev + 1);
        confetti({
          particleCount: 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFC0CB', '#FFB6C1', '#F59E0B', '#10B981'],
        });
        alert(`🌸 Sessão do Monte Fuji Concluída! Você ganhou +${xpEarned} XP por se manter em Foco Profundo.`);
      } else {
        alert('🍃 Pausa concluída. Pronto para retomar a mente serena?');
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSwitchMode = (newMode: TimerMode, newMins?: number) => {
    setIsRunning(false);
    stopAmbientSound();
    setMode(newMode);
    const mins = newMins || modeConfigs[newMode].defaultMin;
    setTargetMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const handleToggleTimer = () => {
    if (!isRunning && soundType !== 'none') {
      playAmbientSound(soundType);
    } else if (isRunning) {
      stopAmbientSound();
    }
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    if (nextRunning) {
      onToggleZenFocus?.(true);
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    stopAmbientSound();
    setTimeLeft(targetMinutes * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = targetMinutes * 60;
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  return (
    <div id="monte-fuji-tab-container" className="space-y-6">
      {/* Top Banner: Mount Fuji Visual Artwork */}
      <div className="relative overflow-hidden rounded-[32px] border border-pink-100/80 bg-white/50 p-6 sm:p-8 text-center shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
        {/* Mount Fuji SVG Backdrop Illustration */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center opacity-30 dark:opacity-20">
          <svg className="h-32 w-full max-w-lg" viewBox="0 0 500 200" fill="none">
            {/* Sun */}
            <circle cx="250" cy="80" r="45" fill="#F43F5E" opacity="0.4" />
            {/* Mount Fuji Base */}
            <path d="M50 200 L250 50 L450 200 Z" fill="#475569" />
            {/* Fuji Snow Cap */}
            <path d="M200 87.5 L250 50 L300 87.5 L280 95 L260 85 L250 100 L240 85 L220 95 Z" fill="#FFFFFF" />
            {/* Clouds */}
            <path d="M100 120 Q120 100 140 120 T180 120 Q190 140 150 140 H110 Q90 140 100 120 Z" fill="#CBD5E1" opacity="0.6" />
            <path d="M320 130 Q340 110 360 130 T400 130 Q410 150 370 150 H330 Q310 150 320 130 Z" fill="#CBD5E1" opacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 mx-auto max-w-md">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-pink-100/80 px-3 py-1 text-xs font-bold text-pink-700 dark:bg-pink-950 dark:text-pink-200">
            <Mountain className="h-3.5 w-3.5 text-pink-500" />
            <span>富士山 • Cronômetro de Foco</span>
          </div>
          <h2 className="mt-2 text-2xl font-serif text-gray-800 dark:text-rose-100 sm:text-3xl">
            Sessão de Foco Zen
          </h2>
          <p className="mt-1 text-xs text-gray-400 dark:text-zinc-400">
            Mantenha a mente serena. Cada sessão de estudo converte seu tempo em XP.
          </p>

          {/* Mode Selector Buttons */}
          <div className="mt-5 flex items-center justify-center space-x-1.5 rounded-full bg-pink-50/70 p-1.5 border border-pink-100 dark:bg-zinc-800 dark:border-zinc-700">
            {(['foco', 'pausa_curta', 'pausa_longa'] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleSwitchMode(m)}
                className={`flex-1 rounded-full py-2 text-xs font-bold uppercase tracking-wider transition ${
                  mode === m
                    ? 'bg-pink-400 text-white shadow-xs dark:bg-pink-600'
                    : 'text-gray-500 hover:bg-pink-100/50 dark:text-zinc-300 dark:hover:bg-zinc-700'
                }`}
              >
                {modeConfigs[m].title}
              </button>
            ))}
          </div>

          {/* Custom Time Presets for Focus Mode */}
          {mode === 'foco' && (
            <div className="mt-3 flex items-center justify-center space-x-2 text-xs">
              <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Duração:</span>
              {[15, 25, 45, 60].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSwitchMode('foco', mins)}
                  className={`rounded-full px-3 py-1 font-bold text-xs transition ${
                    targetMinutes === mins
                      ? 'bg-pink-100 text-pink-700 font-bold dark:bg-pink-950 dark:text-pink-200'
                      : 'bg-white text-gray-500 hover:bg-pink-50 border border-pink-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          )}

          {/* Main Minimalist Timer Display */}
          <div className="my-8 flex flex-col items-center justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border-4 border-pink-100 bg-white shadow-xs dark:border-zinc-700 dark:bg-zinc-900">
              {/* Progress Ring Overlay */}
              <svg className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="112"
                  cy="112"
                  r="102"
                  className="stroke-pink-50 dark:stroke-zinc-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="112"
                  cy="112"
                  r="102"
                  className="stroke-pink-400 dark:stroke-pink-500 transition-all duration-500"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 102}
                  strokeDashoffset={2 * Math.PI * 102 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                />
              </svg>

              {/* Timer Digits */}
              <div className="relative z-10 text-center">
                <span className="text-5xl font-serif font-bold text-gray-800 dark:text-zinc-100">
                  {formattedTime}
                </span>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-pink-400">
                  {isRunning ? '🌸 Mente em Foco...' : 'Pausado'}
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Start/Pause + Reset + Zen Focus Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="btn-timer-toggle"
              onClick={handleToggleTimer}
              className={`flex items-center space-x-2 rounded-full px-8 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-white shadow-md shadow-pink-100 transition active:scale-95 ${
                isRunning
                  ? 'bg-amber-400 hover:bg-amber-500'
                  : 'bg-pink-400 hover:bg-pink-500'
              }`}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
              <span>{isRunning ? 'Pausar' : 'Iniciar Foco'}</span>
            </button>

            <button
              id="btn-timer-reset"
              onClick={handleResetTimer}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-white text-gray-400 shadow-2xs transition hover:bg-pink-50 hover:text-pink-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              title="Reiniciar Cronômetro"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              id="btn-toggle-zen-mode"
              onClick={() => onToggleZenFocus?.(!isZenFocusActive)}
              className={`flex items-center space-x-1.5 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-widest border transition ${
                isZenFocusActive
                  ? 'border-pink-300 bg-pink-100 text-pink-800 shadow-xs dark:bg-pink-950 dark:border-pink-800 dark:text-pink-200'
                  : 'border-pink-100 bg-white/80 text-gray-600 hover:bg-pink-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
              title="Oculta o header e navegação para foco total"
            >
              <span>{isZenFocusActive ? 'Sair do Modo Zen 🧘' : 'Modo Foco Zen 🧘'}</span>
            </button>
          </div>

          {/* Today's Pomodoro Counter */}
          <div className="mt-6 flex items-center justify-center space-x-2 text-xs font-medium text-gray-500 dark:text-zinc-300">
            <Sparkles className="h-4 w-4 text-pink-400" />
            <span>Sessões concluídas hoje: <strong className="text-pink-500">{completedSessionsToday}</strong></span>
          </div>
        </div>
      </div>

      {/* Ambient Sound Player Section */}
      <div className="rounded-[32px] border border-pink-100/80 bg-white/50 p-6 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Music className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Sons Ambientais Zen para Estudo
            </h3>
          </div>
          <span className="text-xs font-medium text-zinc-500">Web Audio Sintetizado</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { id: 'rain', label: '🌧️ Chuva em Kyoto' },
            { id: 'bell', label: '🎐 Sino de Templo' },
            { id: 'wind', label: '🎋 Bambuzais' },
            { id: 'stream', label: '🌊 Rio Zen' },
          ].map((snd) => (
            <button
              key={snd.id}
              onClick={() => {
                const nextType = soundType === snd.id ? 'none' : (snd.id as any);
                setSoundType(nextType);
                playAmbientSound(nextType);
              }}
              className={`rounded-2xl border p-3 text-xs font-bold transition text-left ${
                soundType === snd.id
                  ? 'border-rose-400 bg-rose-100/90 text-rose-900 dark:bg-rose-950 dark:text-rose-200'
                  : 'border-rose-100 bg-rose-50/50 text-zinc-700 hover:bg-rose-100/50 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{snd.label}</span>
                {soundType === snd.id && <Sparkles className="h-3.5 w-3.5 text-rose-500 animate-spin" />}
              </div>
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        {soundType !== 'none' && (
          <div className="mt-4 flex items-center space-x-3 rounded-2xl bg-rose-50 p-3 dark:bg-zinc-800">
            <button
              onClick={() => {
                const newVol = volume > 0 ? 0 : 0.3;
                setVolume(newVol);
                if (activeNodesRef.current.gain) {
                  activeNodesRef.current.gain.gain.setValueAtTime(
                    newVol,
                    audioCtxRef.current?.currentTime || 0
                  );
                }
              }}
              className="text-rose-600 dark:text-rose-400"
            >
              {volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => {
                const newVol = parseFloat(e.target.value);
                setVolume(newVol);
                if (activeNodesRef.current.gain) {
                  activeNodesRef.current.gain.gain.setValueAtTime(
                    newVol,
                    audioCtxRef.current?.currentTime || 0
                  );
                }
              }}
              className="flex-1 accent-rose-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};
