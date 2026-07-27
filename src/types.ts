export type TaskCategory = 'Estudo' | 'Trabalho' | 'Saúde' | 'Mente' | 'Casa' | 'Geral';

export type TaskDifficulty = 'Fácil' | 'Média' | 'Épica';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  difficulty: TaskDifficulty;
  xpReward: number;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  estimatedMinutes?: number;
  subtasks: SubTask[];
}

export interface LevelInfo {
  level: number;
  title: string;
  kanji: string;
  minXp: number;
  maxXp: number;
  perk: string;
  iconName: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'tasks' | 'fuji' | 'level' | 'special';
  requiredCount: number;
  currentCount: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpBonus: number;
}

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  completedAt: string;
  type: 'foco' | 'pausa_curta' | 'pausa_longa';
  xpEarned: number;
}

export interface ZenQuote {
  quote: string;
  author: string;
  kanji: string;
  kanjiMeaning: string;
  mood?: string;
}

export interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  time: string;
  enabled: boolean;
  type: 'streak' | 'morning' | 'break' | 'motivational';
}

export interface UserStats {
  totalXp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  tasksCompletedCount: number;
  pomodoroMinutesTotal: number;
  pomodoroSessionsCount: number;
  history: {
    date: string; // YYYY-MM-DD
    tasksCompleted: number;
    xpEarned: number;
    pomodoroMinutes: number;
  }[];
}
