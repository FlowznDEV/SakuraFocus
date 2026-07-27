import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GeminiQuoteCard } from './components/GeminiQuoteCard';
import { LevelProgressBar } from './components/LevelProgressBar';
import { TaskTab } from './components/TaskTab';
import { MonteFujiTab } from './components/MonteFujiTab';
import { BattleTrophiesTab } from './components/BattleTrophiesTab';
import { StatsNotificationsTab } from './components/StatsNotificationsTab';
import { AddTaskModal } from './components/AddTaskModal';
import { LevelUpModal } from './components/LevelUpModal';
import { SakuraCanvas } from './components/SakuraCanvas';
import { StripeCheckoutModal } from './components/StripeCheckoutModal';

import { Task, UserStats, Badge, ZenQuote, NotificationSetting, LevelInfo } from './types';
import {
  INITIAL_TASKS,
  INITIAL_BADGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_QUOTES,
  LEVEL_SYSTEM,
} from './data/initialData';

import { CheckSquare, Mountain, Trophy, BarChart2, Sparkles, Moon, Sun } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation Active Tab
  const [activeTab, setActiveTab] = useState<'tasks' | 'fuji' | 'trophies' | 'stats'>('tasks');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('sakurafocus_darkmode');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Sakura Petals Animation Active State
  const [sakuraActive, setSakuraActive] = useState<boolean>(() => {
    const saved = localStorage.getItem('sakurafocus_sakura');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Zen Focus Mode State
  const [isZenFocusActive, setIsZenFocusActive] = useState<boolean>(false);

  // User Stats & Gamification State (Default starting from level 1 / 0 XP / 0 streak)
  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('sakurafocus_stats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      totalXp: 0,
      level: 1,
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      tasksCompletedCount: 0,
      pomodoroMinutesTotal: 0,
      pomodoroSessionsCount: 0,
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          tasksCompleted: 0,
          xpEarned: 0,
          pomodoroMinutes: 0,
        },
      ],
    };
  });

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('sakurafocus_tasks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_TASKS;
  });

  // Badges State
  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('sakurafocus_badges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_BADGES;
  });

  // Current Zen Quote
  const [currentQuote, setCurrentQuote] = useState<ZenQuote>(() => {
    const saved = localStorage.getItem('sakurafocus_quote');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_QUOTES[0];
  });

  // Notifications Settings State
  const [notifications, setNotifications] = useState<NotificationSetting[]>(() => {
    const saved = localStorage.getItem('sakurafocus_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState<boolean>(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(() => {
    return localStorage.getItem('sakurafocus_is_subscribed') === 'true';
  });

  const handleConfirmPaid = () => {
    setIsSubscribed(true);
    localStorage.setItem('sakurafocus_is_subscribed', 'true');
    setIsStripeModalOpen(false);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('sakurafocus_darkmode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('sakurafocus_sakura', JSON.stringify(sakuraActive));
  }, [sakuraActive]);

  useEffect(() => {
    localStorage.setItem('sakurafocus_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('sakurafocus_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('sakurafocus_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('sakurafocus_quote', JSON.stringify(currentQuote));
  }, [currentQuote]);

  useEffect(() => {
    localStorage.setItem('sakurafocus_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Clean Initial Reset for fresh onboarding (0 XP, Level 1, 0 streak days)
  useEffect(() => {
    const isResetDone = localStorage.getItem('sakurafocus_reset_v6');
    if (!isResetDone) {
      const resetStats: UserStats = {
        totalXp: 0,
        level: 1,
        streakDays: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        tasksCompletedCount: 0,
        pomodoroMinutesTotal: 0,
        pomodoroSessionsCount: 0,
        history: [
          {
            date: new Date().toISOString().split('T')[0],
            tasksCompleted: 0,
            xpEarned: 0,
            pomodoroMinutes: 0,
          },
        ],
      };
      const resetTasks = INITIAL_TASKS.map((t) => ({
        ...t,
        completed: false,
        completedAt: undefined,
      }));
      const resetBadges = INITIAL_BADGES.map((b) => ({
        ...b,
        currentCount: 0,
        unlocked: false,
        unlockedAt: undefined,
      }));

      setUserStats(resetStats);
      setTasks(resetTasks);
      setBadges(resetBadges);

      localStorage.setItem('sakurafocus_stats', JSON.stringify(resetStats));
      localStorage.setItem('sakurafocus_tasks', JSON.stringify(resetTasks));
      localStorage.setItem('sakurafocus_badges', JSON.stringify(resetBadges));
      localStorage.setItem('sakurafocus_reset_v6', 'true');
    }
  }, []);

  // Compute Current Level Info based on Total XP
  const getCurrentLevelInfo = (): LevelInfo => {
    const totalXp = userStats.totalXp;
    let foundLevel = LEVEL_SYSTEM[0];
    for (const lvl of LEVEL_SYSTEM) {
      if (totalXp >= lvl.minXp) {
        foundLevel = lvl;
      }
    }
    return foundLevel;
  };

  const currentLevelInfo = getCurrentLevelInfo();

  // Helper: Award XP and Check Level Up + Badges
  const addXp = (amount: number, isTask = false, isPomodoro = false) => {
    const newTotalXp = userStats.totalXp + amount;
    const oldLevel = currentLevelInfo.level;

    // Check new level
    let newLevel = 1;
    for (const lvl of LEVEL_SYSTEM) {
      if (newTotalXp >= lvl.minXp) {
        newLevel = lvl.level;
      }
    }

    // Trigger celebratory particles on Level Up!
    if (newLevel > oldLevel) {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#FFC0CB', '#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
      setTimeout(() => {
        alert(`🌸 PARABÉNS! Você subiu para o Nível ${newLevel}: ${LEVEL_SYSTEM[newLevel - 1].title}!`);
      }, 300);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newTasksCount = isTask ? userStats.tasksCompletedCount + 1 : userStats.tasksCompletedCount;

    // Update stats
    setUserStats((prev) => {
      const historyIndex = prev.history.findIndex((h) => h.date === todayStr);
      let updatedHistory = [...prev.history];

      if (historyIndex >= 0) {
        updatedHistory[historyIndex] = {
          ...updatedHistory[historyIndex],
          xpEarned: updatedHistory[historyIndex].xpEarned + amount,
          tasksCompleted: isTask
            ? updatedHistory[historyIndex].tasksCompleted + 1
            : updatedHistory[historyIndex].tasksCompleted,
        };
      } else {
        updatedHistory.push({
          date: todayStr,
          xpEarned: amount,
          tasksCompleted: isTask ? 1 : 0,
          pomodoroMinutes: isPomodoro ? 25 : 0,
        });
      }

      return {
        ...prev,
        totalXp: newTotalXp,
        level: newLevel,
        tasksCompletedCount: newTasksCount,
        history: updatedHistory,
      };
    });

    // Check badge unlocks
    updateBadgesProgress(newTasksCount, newTotalXp, newLevel, userStats.pomodoroSessionsCount);
  };

  const updateBadgesProgress = (
    tasksCompleted: number,
    totalXp: number,
    level: number,
    fujiSessions: number
  ) => {
    setBadges((prevBadges) =>
      prevBadges.map((badge) => {
        let currentCount = badge.currentCount;
        if (badge.category === 'tasks') {
          currentCount = tasksCompleted;
        } else if (badge.category === 'streak') {
          currentCount = userStats.streakDays;
        } else if (badge.category === 'fuji') {
          currentCount = fujiSessions;
        } else if (badge.category === 'level') {
          currentCount = level;
        }

        const isUnlockedNow = currentCount >= badge.requiredCount;
        return {
          ...badge,
          currentCount,
          unlocked: badge.unlocked || isUnlockedNow,
          unlockedAt: !badge.unlocked && isUnlockedNow ? new Date().toISOString() : badge.unlockedAt,
        };
      })
    );
  };

  // Task Handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            addXp(t.xpReward, true, false);
          }
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          return { ...t, subtasks: updatedSubtasks };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Pomodoro Focus Completion Handler
  const handleCompleteFocusSession = (minutes: number, xpEarned: number) => {
    const newPomodoroTotal = userStats.pomodoroMinutesTotal + minutes;
    const newPomodoroSessions = userStats.pomodoroSessionsCount + 1;

    setUserStats((prev) => ({
      ...prev,
      pomodoroMinutesTotal: newPomodoroTotal,
      pomodoroSessionsCount: newPomodoroSessions,
    }));

    addXp(xpEarned, false, true);
  };

  // Claim Badge Bonus
  const handleClaimBadgeReward = (badgeId: string, xpBonus: number) => {
    setBadges((prev) =>
      prev.map((b) => (b.id === badgeId ? { ...b, unlocked: true } : b))
    );
    addXp(xpBonus, false, false);
  };

  // Calculate Header Summary & Paywall Lock state
  const todayStr = new Date().toISOString().split('T')[0];
  const completedTodayCount = tasks.filter((t) => t.completed).length;
  const totalTodayCount = tasks.length;
  const todayHistory = userStats.history.find((h) => h.date === todayStr);
  const xpEarnedToday = todayHistory ? todayHistory.xpEarned : 0;

  const isPaywallLocked = completedTodayCount >= 3 && !isSubscribed;

  // Auto-trigger paywall screen when user completes 3 tasks today
  useEffect(() => {
    if (isPaywallLocked) {
      setIsStripeModalOpen(true);
    }
  }, [isPaywallLocked]);

  return (
    <div className="relative min-h-screen bg-[#FDFBFB] text-[#4A4A4A] transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100 font-sans selection:bg-pink-200 selection:text-pink-900">
      {/* Falling Sakura Petals Background Overlay */}
      <SakuraCanvas active={sakuraActive} isDarkMode={isDarkMode} />

      {/* Main App Layout */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Floating Bar when Zen Focus Mode is active */}
        {isZenFocusActive && (
          <div className="sticky top-4 z-50 mx-auto max-w-sm px-4 pt-3">
            <div className="flex items-center justify-between gap-3 rounded-full border border-pink-200/80 bg-white/75 px-5 py-2.5 shadow-xl backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/75">
              <div className="flex items-center space-x-2 text-xs font-bold text-pink-700 dark:text-pink-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                </span>
                <span>Modo Foco Zen Ativo 🧘</span>
              </div>
              <button
                onClick={() => setIsZenFocusActive(false)}
                className="rounded-full bg-pink-400 hover:bg-pink-500 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs transition active:scale-95"
              >
                Sair do Zen
              </button>
            </div>
          </div>
        )}

        {/* Top Header (Hidden in Zen Focus Mode) */}
        {!isZenFocusActive && (
          <Header
            streakDays={userStats.streakDays}
            completedTasksToday={completedTodayCount}
            totalTasksToday={totalTodayCount}
            xpEarnedToday={xpEarnedToday}
            currentLevelInfo={currentLevelInfo}
            isDarkMode={isDarkMode}
            toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            sakuraActive={sakuraActive}
            toggleSakura={() => setSakuraActive(!sakuraActive)}
            onOpenLevelModal={() => setIsLevelModalOpen(true)}
            onOpenStripeModal={() => setIsStripeModalOpen(true)}
          />
        )}

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 space-y-6">
          {/* Gemini AI Motivational Banner (Hidden in Zen Focus Mode) */}
          {!isZenFocusActive && (
            <GeminiQuoteCard
              currentQuote={currentQuote}
              onUpdateQuote={(q) => setCurrentQuote(q)}
              level={currentLevelInfo.level}
              streak={userStats.streakDays}
              completedToday={completedTodayCount}
              totalToday={totalTodayCount}
            />
          )}

          {/* Level Progress Bar (Hidden in Zen Focus Mode) */}
          {!isZenFocusActive && (
            <LevelProgressBar
              totalXp={userStats.totalXp}
              currentLevelInfo={currentLevelInfo}
              onOpenLevelModal={() => setIsLevelModalOpen(true)}
            />
          )}

          {/* Primary Navigation Tabs (Hidden in Zen Focus Mode) */}
          {!isZenFocusActive && (
            <nav className="flex items-center space-x-2 rounded-full border border-pink-100/80 bg-white/50 p-1.5 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:bg-zinc-900/50 dark:border-zinc-800/80">
              <button
                id="tab-btn-tasks"
                onClick={() => setActiveTab('tasks')}
                className={`flex flex-1 items-center justify-center space-x-2 rounded-full py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
                  activeTab === 'tasks'
                    ? 'bg-pink-400 text-white shadow-md shadow-pink-100 dark:bg-pink-600 dark:shadow-none'
                    : 'text-gray-500 hover:bg-pink-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tarefas</span>
              </button>

              <button
                id="tab-btn-fuji"
                onClick={() => setActiveTab('fuji')}
                className={`flex flex-1 items-center justify-center space-x-2 rounded-full py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
                  activeTab === 'fuji'
                    ? 'bg-pink-400 text-white shadow-md shadow-pink-100 dark:bg-pink-600 dark:shadow-none'
                    : 'text-gray-500 hover:bg-pink-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <Mountain className="h-4 w-4" />
                <span>Monte Fuji</span>
              </button>

              <button
                id="tab-btn-trophies"
                onClick={() => setActiveTab('trophies')}
                className={`flex flex-1 items-center justify-center space-x-2 rounded-full py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
                  activeTab === 'trophies'
                    ? 'bg-pink-400 text-white shadow-md shadow-pink-100 dark:bg-pink-600 dark:shadow-none'
                    : 'text-gray-500 hover:bg-pink-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Troféus</span>
              </button>

              <button
                id="tab-btn-stats"
                onClick={() => setActiveTab('stats')}
                className={`flex flex-1 items-center justify-center space-x-2 rounded-full py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider transition ${
                  activeTab === 'stats'
                    ? 'bg-pink-400 text-white shadow-md shadow-pink-100 dark:bg-pink-600 dark:shadow-none'
                    : 'text-gray-500 hover:bg-pink-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Estatísticas</span>
                <span className="sm:hidden">Stats</span>
              </button>
            </nav>
          )}

          {/* Active Tab View Rendering */}
          <div className="pt-2 space-y-6">
            {(activeTab === 'tasks' && !isZenFocusActive) && (
              <TaskTab
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onToggleSubtask={handleToggleSubtask}
                onDeleteTask={handleDeleteTask}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            )}

            {(activeTab === 'fuji' || isZenFocusActive) && (
              <MonteFujiTab
                onCompleteFocusSession={handleCompleteFocusSession}
                isZenFocusActive={isZenFocusActive}
                onToggleZenFocus={(active) => {
                  setIsZenFocusActive(active);
                  if (active) setActiveTab('fuji');
                }}
              />
            )}

            {(activeTab === 'trophies' && !isZenFocusActive) && (
              <BattleTrophiesTab
                badges={badges}
                userStats={userStats}
                completedTasksCount={completedTodayCount}
                onClaimBadgeReward={handleClaimBadgeReward}
              />
            )}

            {(activeTab === 'stats' && !isZenFocusActive) && (
              <>
                <StatsNotificationsTab
                  userStats={userStats}
                  notifications={notifications}
                  onToggleNotification={(id) =>
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n))
                    )
                  }
                  onUpdateNotificationTime={(id, newTime) =>
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === id ? { ...n, time: newTime } : n))
                    )
                  }
                />
              </>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-rose-100 bg-white/60 py-4 text-center text-xs text-rose-800/80 backdrop-blur-xs dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <div className="mx-auto max-w-6xl px-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
            <p className="flex items-center space-x-1 font-medium">
              <span>SakuraFocus • Foco Absoluto e Serenidade Zen</span>
            </p>
            <p className="text-[11px] text-zinc-500">
              Kaizen • Melhoria Contínua • Nível {currentLevelInfo.level} de 10
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
      />

      <LevelUpModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        currentLevelInfo={currentLevelInfo}
        totalXp={userStats.totalXp}
      />

      <StripeCheckoutModal
        isOpen={isStripeModalOpen || isPaywallLocked}
        onClose={() => setIsStripeModalOpen(false)}
        isLocked={isPaywallLocked}
        onConfirmPaid={handleConfirmPaid}
        user={null}
      />
    </div>
  );

}
