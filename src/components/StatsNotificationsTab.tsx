import React, { useState } from 'react';
import { UserStats, NotificationSetting } from '../types';
import {
  Bell,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Send,
  Sliders,
  BellOff,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface StatsNotificationsTabProps {
  userStats: UserStats;
  notifications: NotificationSetting[];
  onToggleNotification: (id: string) => void;
  onUpdateNotificationTime: (id: string, newTime: string) => void;
}

export const StatsNotificationsTab: React.FC<StatsNotificationsTabProps> = ({
  userStats,
  notifications,
  onToggleNotification,
  onUpdateNotificationTime,
}) => {
  const [testToast, setTestToast] = useState<string | null>(null);

  // Chart 1: Historical XP Progression Data
  const chartData = userStats.history.length > 0
    ? userStats.history.map((h) => ({
        data: h.date.slice(5), // MM-DD
        XP: h.xpEarned,
        Tarefas: h.tasksCompleted,
        FocoMin: h.pomodoroMinutes,
      }))
    : [
        { data: 'Seg', XP: 40, Tarefas: 2, FocoMin: 25 },
        { data: 'Ter', XP: 75, Tarefas: 3, FocoMin: 50 },
        { data: 'Qua', XP: 110, Tarefas: 4, FocoMin: 25 },
        { data: 'Qui', XP: 90, Tarefas: 3, FocoMin: 45 },
        { data: 'Sex', XP: 140, Tarefas: 5, FocoMin: 60 },
        { data: 'Sáb', XP: 80, Tarefas: 2, FocoMin: 30 },
        { data: 'Hoje', XP: userStats.totalXp, Tarefas: userStats.tasksCompletedCount, FocoMin: userStats.pomodoroMinutesTotal },
      ];

  // Chart 2: Category Distribution
  const pieData = [
    { name: 'Estudo', value: 40, color: '#3B82F6' },
    { name: 'Trabalho', value: 25, color: '#A855F7' },
    { name: 'Saúde', value: 15, color: '#10B981' },
    { name: 'Mente', value: 20, color: '#F43F5E' },
  ];

  const handleTestNotification = (notif: NotificationSetting) => {
    // Attempt browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`SakuraFocus • ${notif.title}`, {
        body: notif.description,
        icon: '/favicon.ico',
      });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(`SakuraFocus • ${notif.title}`, {
            body: notif.description,
          });
        }
      });
    }

    // In-app visual toast fallback
    setTestToast(`Notificação disparada: "${notif.title}" - ${notif.description}`);
    setTimeout(() => setTestToast(null), 4000);
  };

  return (
    <div id="stats-notifications-tab-container" className="space-y-6">
      {/* Toast Notification Alert */}
      {testToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 rounded-full bg-pink-500 px-5 py-3 text-white shadow-xl animate-bounce">
          <Bell className="h-5 w-5 text-pink-200" />
          <span className="text-xs font-bold">{testToast}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-pink-100/80 bg-white/50 p-5 shadow-2xs backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-2 text-pink-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total XP</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-serif text-gray-800 dark:text-zinc-100">
            {userStats.totalXp}
          </p>
        </div>

        <div className="rounded-2xl border border-pink-100/80 bg-white/50 p-5 shadow-2xs backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-2 text-pink-400">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tarefas Feitas</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-serif text-gray-800 dark:text-zinc-100">
            {userStats.tasksCompletedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-pink-100/80 bg-white/50 p-5 shadow-2xs backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-2 text-amber-400">
            <Clock className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Minutos no Fuji</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-serif text-gray-800 dark:text-zinc-100">
            {userStats.pomodoroMinutesTotal} <span className="text-xs font-sans text-gray-400">min</span>
          </p>
        </div>

        <div className="rounded-2xl border border-pink-100/80 bg-white/50 p-5 shadow-2xs backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <div className="flex items-center space-x-2 text-orange-400">
            <Flame className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Sequência</span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-serif text-gray-800 dark:text-zinc-100">
            {userStats.streakDays} <span className="text-xs font-sans text-gray-400">dias</span>
          </p>
        </div>
      </div>

      {/* Visual Chart 1: XP Evolution */}
      <div className="rounded-[32px] border border-pink-100/80 bg-white/50 p-6 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between pb-3 border-b border-pink-50 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-pink-400" />
            <h3 className="text-sm font-serif font-bold text-gray-800 dark:text-zinc-100">
              Evolução de XP e Foco na Semana
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estatísticas Visuais</span>
        </div>

        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F472B6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#F472B6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="data" stroke="#A1A1AA" fontSize={11} />
              <YAxis stroke="#A1A1AA" fontSize={11} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="XP"
                stroke="#F472B6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorXp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Intelligent Notifications Manager */}
      <div className="rounded-[32px] border border-pink-100/80 bg-white/50 p-6 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between pb-3 border-b border-pink-50 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-pink-400" />
            <h3 className="text-sm font-serif font-bold text-gray-800 dark:text-zinc-100">
              Notificações Motivacionais Inteligentes
            </h3>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-pink-500">
            Customizáveis
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-400 dark:text-zinc-400">
          Ative alertas gentis nos horários ideais para manter seu engajamento e proteger a sua sequência de tarefas.
        </p>

        <div className="mt-4 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="flex flex-col gap-3 rounded-2xl border border-pink-50 bg-pink-50/30 p-4 transition sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-800/40"
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => onToggleNotification(n.id)}
                  className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full transition ${
                    n.enabled
                      ? 'bg-pink-400 text-white shadow-xs'
                      : 'bg-gray-200 text-gray-400 dark:bg-zinc-700'
                  }`}
                >
                  {n.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                </button>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-100">
                    {n.title}
                  </h4>
                  <p className="text-xs text-gray-400 max-w-md">{n.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-end sm:self-center">
                {/* Time picker */}
                <input
                  type="time"
                  value={n.time}
                  onChange={(e) => onUpdateNotificationTime(n.id, e.target.value)}
                  className="rounded-full border border-pink-100 bg-white px-3 py-1 text-xs font-bold text-gray-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                />

                <button
                  onClick={() => handleTestNotification(n)}
                  className="flex items-center space-x-1 rounded-full bg-white border border-pink-100 px-3 py-1 text-xs font-semibold text-pink-600 transition hover:bg-pink-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-pink-300"
                  title="Testar Notificação Agora"
                >
                  <Send className="h-3 w-3" />
                  <span>Testar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
