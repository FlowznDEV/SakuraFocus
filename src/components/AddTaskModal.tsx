import React, { useState } from 'react';
import { X, Plus, Sparkles, Wand2, Clock, ShieldAlert } from 'lucide-react';
import { Task, TaskCategory, TaskDifficulty } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAddTask }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Estudo');
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('Fácil');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(15);
  const [subtaskInputs, setSubtaskInputs] = useState<string[]>(['', '']);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  if (!isOpen) return null;

  const xpByDifficulty: Record<TaskDifficulty, number> = {
    'Fácil': 20,
    'Média': 35,
    'Épica': 50,
  };

  const handleAiBreakdown = async () => {
    if (!title.trim()) {
      alert('Por favor, digite o título da tarefa primeiro para a IA desmembrar.');
      return;
    }

    setLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: title, category }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.subtasks && Array.isArray(data.subtasks)) {
          setSubtaskInputs(data.subtasks);
        }
      }
    } catch (err) {
      console.error('Erro ao quebrar tarefa com IA:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddSubtaskInput = () => {
    setSubtaskInputs([...subtaskInputs, '']);
  };

  const handleSubtaskChange = (index: number, val: string) => {
    const updated = [...subtaskInputs];
    updated[index] = val;
    setSubtaskInputs(updated);
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtaskInputs(subtaskInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const subtasks = subtaskInputs
      .filter((s) => s.trim().length > 0)
      .map((s, idx) => ({
        id: `st-${Date.now()}-${idx}`,
        title: s.trim(),
        completed: false,
      }));

    onAddTask({
      title: title.trim(),
      category,
      difficulty,
      xpReward: xpByDifficulty[difficulty],
      estimatedMinutes: Number(estimatedMinutes) || 15,
      subtasks,
    });

    // Reset form
    setTitle('');
    setCategory('Estudo');
    setDifficulty('Fácil');
    setEstimatedMinutes(15);
    setSubtaskInputs(['', '']);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-[32px] border border-pink-100/80 bg-white/80 p-6 shadow-2xl backdrop-blur-[12px] backdrop-saturate-[180%] dark:border-zinc-800/80 dark:bg-zinc-900/80">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
              <Plus className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Nova Tarefa de Foco
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-rose-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Título da Tarefa *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Estudar 2 capítulos de Matemática..."
              className="mt-1 w-full rounded-2xl border border-rose-200 bg-rose-50/50 p-3 text-sm font-medium text-zinc-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-rose-900"
            />
          </div>

          {/* AI Micro-Breakdown Trigger Button */}
          <div className="flex items-center justify-between rounded-2xl bg-rose-50 p-3 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50">
            <div className="flex items-center space-x-2">
              <Wand2 className="h-4 w-4 text-rose-500" />
              <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                Foco TDAH: IA Desmembrar em 3 Micro-Passos
              </span>
            </div>
            <button
              type="button"
              onClick={handleAiBreakdown}
              disabled={loadingAi || !title.trim()}
              className="flex items-center space-x-1 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-600 disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              <span>{loadingAi ? 'Gerando...' : 'Gerar com Gemini'}</span>
            </button>
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="mt-1 w-full rounded-2xl border border-rose-200 bg-white p-2.5 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="Estudo">📚 Estudo</option>
                <option value="Trabalho">💼 Trabalho</option>
                <option value="Saúde">🧘 Saúde</option>
                <option value="Mente">🧠 Mente</option>
                <option value="Casa">🏠 Casa</option>
                <option value="Geral">🎯 Geral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Dificuldade (Recompensa XP)
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as TaskDifficulty)}
                className="mt-1 w-full rounded-2xl border border-rose-200 bg-white p-2.5 text-sm font-medium text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="Fácil">🌱 Fácil (+20 XP)</option>
                <option value="Média">🌿 Média (+35 XP)</option>
                <option value="Épica">🌸 Épica (+50 XP)</option>
              </select>
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Tempo Estimado (minutos)
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <Clock className="h-4 w-4 text-zinc-400" />
              <input
                type="number"
                min={1}
                max={240}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-28 rounded-2xl border border-rose-200 bg-white p-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              />
              <span className="text-xs text-zinc-500">minutos de foco</span>
            </div>
          </div>

          {/* Subtasks / Micro-Steps */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Micro-Passos de Ação (Subtarefas)
              </label>
              <button
                type="button"
                onClick={handleAddSubtaskInput}
                className="text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
              >
                + Adicionar Passo
              </button>
            </div>

            <div className="mt-2 space-y-2">
              {subtaskInputs.map((sub, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={sub}
                    onChange={(e) => handleSubtaskChange(idx, e.target.value)}
                    placeholder={`Passo ${idx + 1}...`}
                    className="flex-1 rounded-xl border border-rose-100 bg-white p-2 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-zinc-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex justify-end space-x-3 pt-3 border-t border-rose-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-rose-200 px-4 py-2.5 text-xs font-semibold text-zinc-600 hover:bg-rose-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:from-rose-600 hover:to-pink-700"
            >
              <Sparkles className="h-4 w-4" />
              <span>Criar Tarefa (+{xpByDifficulty[difficulty]} XP)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
