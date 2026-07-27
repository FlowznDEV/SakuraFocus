import React, { useState } from 'react';
import { Task } from '../types';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
  ListTodo,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskItemProps {
  task: Task;
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
}) => {
  const [expanded, setExpanded] = useState<boolean>(task.subtasks.length > 0 && !task.completed);
  const [showXpFloat, setShowXpFloat] = useState<boolean>(false);

  const handleTaskCheck = () => {
    if (!task.completed) {
      // Trigger sakura colored confetti explosion
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FFC0CB', '#FFB6C1', '#FF69B4', '#FFD1DC', '#FCE4EC'],
      });
      setShowXpFloat(true);
      setTimeout(() => setShowXpFloat(false), 2000);
    }
    onToggleTask(task.id);
  };

  const categoryColors: Record<string, string> = {
    Estudo: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    Trabalho: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    Saúde: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    Mente: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    Casa: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    Geral: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
  };

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

  return (
    <div
      id={`task-item-${task.id}`}
      className={`relative overflow-hidden rounded-[24px] border p-4.5 transition-all duration-300 backdrop-blur-[12px] backdrop-saturate-[180%] ${
        task.completed
          ? 'border-pink-100/60 bg-white/30 opacity-60 dark:border-zinc-800/60 dark:bg-zinc-900/30'
          : 'border-pink-100/80 bg-white/60 shadow-xs hover:border-pink-300 dark:border-zinc-800/80 dark:bg-zinc-900/60'
      }`}
    >
      {/* Floating XP Gain Badge Animation */}
      {showXpFloat && (
        <div className="pointer-events-none absolute right-4 top-2 z-20 animate-bounce rounded-full bg-pink-400 px-3 py-1 text-xs font-bold text-white shadow-md">
          +{task.xpReward} XP GANHO! 🌸
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        {/* Left Checkbox & Task details */}
        <div className="flex items-start space-x-3.5 flex-1 min-w-0">
          <button
            onClick={handleTaskCheck}
            className="mt-0.5 flex-shrink-0 transition hover:scale-105"
            title={task.completed ? 'Marcar como não concluída' : 'Concluir tarefa'}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.completed
                ? 'border-pink-400 bg-pink-400 text-white'
                : 'border-pink-200 hover:border-pink-300 bg-white dark:bg-zinc-800 dark:border-zinc-700'
            }`}>
              {task.completed ? (
                <CheckCircle2 className="h-4 w-4 text-white" />
              ) : (
                <div className="w-2.5 h-2.5 bg-pink-200 rounded-full opacity-0 hover:opacity-100 transition-opacity" />
              )}
            </div>
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  categoryColors[task.category] || categoryColors.Geral
                }`}
              >
                {task.category}
              </span>

              <span className="text-[10px] text-pink-400 font-bold tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                +{task.xpReward} XP
              </span>

              {task.estimatedMinutes && (
                <span className="flex items-center space-x-1 text-[11px] font-medium text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedMinutes} min</span>
                </span>
              )}
            </div>

            <h3
              className={`mt-1.5 text-sm sm:text-base font-medium leading-snug break-words ${
                task.completed
                  ? 'line-through text-gray-400 dark:text-zinc-500'
                  : 'text-[#4A4A4A] dark:text-zinc-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Subtasks summary tag */}
            {task.subtasks.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-2 flex items-center space-x-1 text-xs font-semibold text-pink-500 hover:underline"
              >
                <ListTodo className="h-3.5 w-3.5" />
                <span>
                  Passos: {completedSubtasks}/{task.subtasks.length} concluídos
                </span>
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onDeleteTask(task.id)}
            className="rounded-full p-1.5 text-gray-300 hover:text-red-500 hover:bg-pink-50 transition dark:hover:bg-zinc-800"
            title="Excluir tarefa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Subtasks List */}
      {expanded && task.subtasks.length > 0 && (
        <div className="mt-3 space-y-2 border-t border-pink-50 pt-3 dark:border-zinc-800">
          {task.subtasks.map((st) => (
            <div
              key={st.id}
              onClick={() => onToggleSubtask(task.id, st.id)}
              className="flex items-center space-x-2.5 cursor-pointer rounded-xl bg-pink-50/40 p-2 text-xs transition hover:bg-pink-100/60 dark:bg-zinc-800/60 dark:hover:bg-zinc-800"
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border transition ${
                  st.completed
                    ? 'border-pink-400 bg-pink-400 text-white'
                    : 'border-pink-200 bg-white dark:border-zinc-600'
                }`}
              >
                {st.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
              </div>
              <span
                className={`flex-1 font-medium ${
                  st.completed
                    ? 'line-through text-gray-400 dark:text-zinc-500'
                    : 'text-gray-700 dark:text-zinc-200'
                }`}
              >
                {st.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
