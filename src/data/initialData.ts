import { LevelInfo, Badge, Task, NotificationSetting, ZenQuote } from '../types';

export const LEVEL_SYSTEM: LevelInfo[] = [
  {
    level: 1,
    title: 'Aprendiz Zen',
    kanji: '初心',
    minXp: 0,
    maxXp: 100,
    perk: 'Início da jornada da clareza mental.',
    iconName: 'Sprout'
  },
  {
    level: 2,
    title: 'Iniciante Sakura',
    kanji: '桜花',
    minXp: 100,
    maxXp: 250,
    perk: 'Desbloqueia temas de personalização e novos sons zen.',
    iconName: 'Flower2'
  },
  {
    level: 3,
    title: 'Praticante do Foco',
    kanji: '集中',
    minXp: 250,
    maxXp: 450,
    perk: 'Ganhe +10% de XP bônus nas sessões do Monte Fuji.',
    iconName: 'Compass'
  },
  {
    level: 4,
    title: 'Guardiaõ do Tempo',
    kanji: '時間',
    minXp: 450,
    maxXp: 700,
    perk: 'Desbloqueia assistente de IA Gemini para desmembrar tarefas.',
    iconName: 'Hourglass'
  },
  {
    level: 5,
    title: 'Guerreiro Bushido',
    kanji: '武士',
    minXp: 700,
    maxXp: 1000,
    perk: 'Acesso às estatísticas semanais detalhadas e histórico de XP.',
    iconName: 'Sword'
  },
  {
    level: 6,
    title: 'Mestre da Mente',
    kanji: '心王',
    minXp: 1000,
    maxXp: 1350,
    perk: 'Notificações inteligentes avançadas customizáveis.',
    iconName: 'Brain'
  },
  {
    level: 7,
    title: 'Sábio do Monte Fuji',
    kanji: '富士',
    minXp: 1350,
    maxXp: 1750,
    perk: 'Desbloqueia modo iluminação no cronômetro do Monte Fuji.',
    iconName: 'Mountain'
  },
  {
    level: 8,
    title: 'Ronin Imparável',
    kanji: '浪人',
    minXp: 1750,
    maxXp: 2200,
    perk: 'Protetor de Streak: Perdoa 1 dia de falha na sequência semanal.',
    iconName: 'Shield'
  },
  {
    level: 9,
    title: 'Espírito de Lótus',
    kanji: '蓮華',
    minXp: 2200,
    maxXp: 2700,
    perk: 'Multiplicador de XP x1.2 em todas as batalhas e tarefas.',
    iconName: 'Sparkles'
  },
  {
    level: 10,
    title: 'Iluminado Foco Absoluto',
    kanji: '悟り',
    minXp: 2700,
    maxXp: 9999,
    perk: 'Nível Máximo Alcançado! Mestria total sobre a mente e o tempo.',
    iconName: 'Crown'
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_task',
    title: 'Primeira Pétala',
    description: 'Conclua a sua primeira tarefa diária no aplicativo.',
    icon: 'CheckCircle2',
    category: 'tasks',
    requiredCount: 1,
    currentCount: 0,
    unlocked: false,
    xpBonus: 50
  },
  {
    id: 'streak_3',
    title: 'Caminho do Samurai',
    description: 'Mantenha 3 dias seguidos de batalhas e tarefas concluídas.',
    icon: 'Flame',
    category: 'streak',
    requiredCount: 3,
    currentCount: 0,
    unlocked: false,
    xpBonus: 100
  },
  {
    id: 'streak_7',
    title: 'Chá do Amanhecer',
    description: 'Mantenha 7 dias consecutivos de consistência e clareza mental.',
    icon: 'Coffee',
    category: 'streak',
    requiredCount: 7,
    currentCount: 0,
    unlocked: false,
    xpBonus: 200
  },
  {
    id: 'fuji_master_1',
    title: 'Escalador do Fuji',
    description: 'Complete a sua primeira sessão de Foco Profundo no Monte Fuji.',
    icon: 'Mountain',
    category: 'fuji',
    requiredCount: 1,
    currentCount: 0,
    unlocked: false,
    xpBonus: 75
  },
  {
    id: 'fuji_master_10',
    title: 'Topo do Vulcão',
    description: 'Complete 10 sessões de estudo/foco no Monte Fuji.',
    icon: 'Trophy',
    category: 'fuji',
    requiredCount: 10,
    currentCount: 0,
    unlocked: false,
    xpBonus: 250
  },
  {
    id: 'tasks_10',
    title: 'Jardineiro de Tarefas',
    description: 'Conclua 10 tarefas diárias.',
    icon: 'CheckCheck',
    category: 'tasks',
    requiredCount: 10,
    currentCount: 0,
    unlocked: false,
    xpBonus: 120
  },
  {
    id: 'tasks_30',
    title: 'Mestre da Organização',
    description: 'Conclua 30 tarefas no aplicativo.',
    icon: 'Award',
    category: 'tasks',
    requiredCount: 30,
    currentCount: 0,
    unlocked: false,
    xpBonus: 300
  },
  {
    id: 'level_5',
    title: 'Guerreiro Ascendente',
    description: 'Alcance o Nível 5 (Guerreiro Bushido).',
    icon: 'Sword',
    category: 'level',
    requiredCount: 5,
    currentCount: 0,
    unlocked: false,
    xpBonus: 150
  },
  {
    id: 'level_10',
    title: 'Espírito Iluminado',
    description: 'Alcance o Nível Máximo 10 no SakuraFocus.',
    icon: 'Crown',
    category: 'level',
    requiredCount: 10,
    currentCount: 0,
    unlocked: false,
    xpBonus: 500
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    title: 'Organizar mesa de estudos por 2 minutos',
    category: 'Estudo',
    difficulty: 'Fácil',
    xpReward: 20,
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 2,
    subtasks: [
      { id: 'st-1', title: 'Remover copos e papéis desnecessários', completed: false },
      { id: 'st-2', title: 'Deixar apenas caderno/notebook na mesa', completed: false }
    ]
  },
  {
    id: 't-2',
    title: '1 Sessão de Foco Profundo no Monte Fuji (25 min)',
    category: 'Mente',
    difficulty: 'Média',
    xpReward: 35,
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 25,
    subtasks: [
      { id: 'st-3', title: 'Ativar modo não perturbe no celular', completed: false },
      { id: 'st-4', title: 'Escolher um som de fundo zen (Chuva/Templo)', completed: false }
    ]
  },
  {
    id: 't-3',
    title: 'Beber 1 copo de água e respirar fundo 5 vezes',
    category: 'Saúde',
    difficulty: 'Fácil',
    xpReward: 20,
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 1,
    subtasks: []
  },
  {
    id: 't-4',
    title: 'Definir as 3 maiores prioridades de amanhã',
    category: 'Trabalho',
    difficulty: 'Média',
    xpReward: 35,
    completed: false,
    createdAt: new Date().toISOString(),
    estimatedMinutes: 10,
    subtasks: []
  }
];

export const INITIAL_NOTIFICATIONS: NotificationSetting[] = [
  {
    id: 'n-1',
    title: 'Lembrete Matinal Sakura',
    description: 'Uma mensagem inspiradora para começar o dia com clareza mental.',
    time: '08:30',
    enabled: true,
    type: 'morning'
  },
  {
    id: 'n-2',
    title: 'Alerta de Sequência em Risco',
    description: 'Aviso carinhoso se você não concluiu nenhuma tarefa até o final da tarde.',
    time: '18:00',
    enabled: true,
    type: 'streak'
  },
  {
    id: 'n-3',
    title: 'Incentivo do Mestre Fuji',
    description: 'Lembrete para fazer uma pausa consciente e tomar um chá/água.',
    time: '14:00',
    enabled: true,
    type: 'break'
  }
];

export const INITIAL_QUOTES: ZenQuote[] = [
  {
    quote: "O bambu que se curva ao vento é mais forte do que o carvalho que resiste à tempestade.",
    author: "Provérbio Zen",
    kanji: "柔軟",
    kanjiMeaning: "Flexibilidade & Resiliência"
  },
  {
    quote: "Concentre toda a sua mente no momento presente. A flor de cerejeira desabrocha sem pressa.",
    author: "Mestre Miyamoto",
    kanji: "一心",
    kanjiMeaning: "Mente Focada"
  },
  {
    quote: "Se você se focar no próximo pequeno passo, a montanha inteira será superada com serenidade.",
    author: "Sabedoria Sakura",
    kanji: "歩み",
    kanjiMeaning: "Passo a Passo"
  }
];
