import React, { useState } from 'react';
import { Task, TaskCategory } from '../types';
import { TaskItem } from './TaskItem';
import { Plus, Search, Filter, CheckCheck, Sparkles, Flower2 } from 'lucide-react';

interface TaskTabProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenAddModal: () => void;
}

export const TaskTab: React.FC<TaskTabProps> = ({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onDeleteTask,
  onOpenAddModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'Todas' | 'Pendentes' | 'Concluídas'>('Pendentes');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['Todas', 'Estudo', 'Trabalho', 'Saúde', 'Mente', 'Casa', 'Geral'];

  const filteredTasks = tasks.filter((t) => {
    const matchesCategory = selectedCategory === 'Todas' || t.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'Todas'
        ? true
        : selectedStatus === 'Pendentes'
        ? !t.completed
        : t.completed;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div id="tasks-tab-container" className="space-y-4">
      {/* Top Header Controls: Search + Add Task Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarefas do dia..."
            className="w-full rounded-full border border-pink-100 bg-white pl-11 pr-4 py-2.5 text-xs sm:text-sm font-medium text-gray-700 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-pink-950 shadow-2xs"
          />
        </div>

        <button
          id="btn-open-add-task-modal"
          onClick={onOpenAddModal}
          className="flex items-center justify-center space-x-2 rounded-full bg-pink-400 hover:bg-pink-500 px-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-widest text-white shadow-md shadow-pink-100 transition active:scale-95 dark:shadow-none"
        >
          <Plus className="h-4 w-4" />
          <span>Nova Tarefa (+XP)</span>
        </button>
      </div>

      {/* Filter Bar: Status tabs + Category chips */}
      <div className="flex flex-col gap-2 rounded-[28px] border border-pink-100/80 bg-white/50 p-4 shadow-sm backdrop-blur-[12px] backdrop-saturate-[180%] dark:bg-zinc-900/50 dark:border-zinc-800/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-50 pb-2.5 dark:border-zinc-800">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1">
            {(['Pendentes', 'Concluídas', 'Todas'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                  selectedStatus === st
                    ? 'bg-pink-400 text-white shadow-2xs dark:bg-pink-600'
                    : 'bg-gray-50 text-gray-500 hover:bg-pink-50 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {st} {st === 'Pendentes' ? `(${pendingCount})` : st === 'Concluídas' ? `(${completedCount})` : `(${tasks.length})`}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium text-gray-400">
            {pendingCount === 0 ? '🎉 Tudo concluído!' : `${pendingCount} tarefas pendentes`}
          </span>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1 uppercase tracking-wider">
            <Filter className="h-3 w-3 text-pink-400" /> Categoria:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-pink-100 text-pink-700 font-bold dark:bg-pink-950 dark:text-pink-200'
                  : 'bg-gray-50 text-gray-500 hover:bg-pink-50 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map((t) => (
            <TaskItem
              key={t.id}
              task={t}
              onToggleTask={onToggleTask}
              onToggleSubtask={onToggleSubtask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-rose-200 bg-white/50 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-100 text-rose-500 dark:bg-rose-950 dark:text-rose-300">
            <Flower2 className="h-8 w-8 animate-pulse" />
          </div>
          <h3 className="mt-4 text-base font-bold text-zinc-800 dark:text-zinc-100">
            {selectedStatus === 'Pendentes' && pendingCount === 0
              ? 'Todas as tarefas de hoje foram cumpridas com mestria!'
              : 'Nenhuma tarefa encontrada neste filtro'}
          </h3>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm">
            {selectedStatus === 'Pendentes' && pendingCount === 0
              ? 'Aproveite o momento de calmaria ou adicione uma nova meta para ganhar mais XP e subir de nível.'
              : 'Tente alterar os filtros ou adicione uma nova tarefa para continuar a sua jornada.'}
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 flex items-center space-x-1.5 rounded-2xl bg-rose-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-600"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Tarefa</span>
          </button>
        </div>
      )}
    </div>
  );
};
