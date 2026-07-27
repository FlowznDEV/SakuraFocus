import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { getSupabaseAdmin, verifyUserToken } from './server/supabaseAdmin.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({
  verify: (req: any, _res, buf) => {
    // Preserve raw body for Stripe webhook signature verification
    req.rawBody = buf;
  }
}));

// Helper lazy loader for Stripe SDK
function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  return new Stripe(secretKey, { apiVersion: '2025-02-24.acacia' as any });
}

// Handler para criar sessão do Stripe Checkout
async function handleCreateCheckout(req: express.Request, res: express.Response) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({
        error: 'STRIPE_SECRET_KEY não foi configurada nas variáveis de ambiente do servidor. Defina a chave privada no arquivo .env.',
      });
    }

    const {
      user_id,
      user_email,
      plan_name = 'Sakura Pro - Plano Anual',
      amount = 2900, // R$ 29,00
      currency = 'brl',
      success_url,
      cancel_url
    } = req.body || {};

    const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
    const successRedirect = success_url || `${appUrl}/?checkout=success`;
    const cancelRedirect = cancel_url || `${appUrl}/?checkout=canceled`;

    // Criação da Sessão no Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'brl',
            product_data: {
              name: plan_name || 'Sakura Pro - Assinatura Premium',
              description: 'Acesso ilimitado a todas as ferramentas do SakuraFocus.',
            },
            unit_amount: amount || 2900,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successRedirect,
      cancel_url: cancelRedirect,
      customer_email: user_email || undefined,
      client_reference_id: user_id || undefined,
      metadata: {
        user_id: user_id || 'anonymous',
        user_email: user_email || 'cliente@sakurafocus.app',
        plan_name: plan_name || 'Sakura Pro',
      },
    });

    // Requisito: Retorna APENAS a URL do Checkout
    return res.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao criar Stripe Checkout Session:', error);
    return res.status(500).json({
      error: 'Falha ao criar sessão do Stripe Checkout',
      detail: error.message || String(error),
    });
  }
}

// Register both /create-checkout and /api/create-checkout for maximum compatibility
app.post('/create-checkout', handleCreateCheckout);
app.post('/api/create-checkout', handleCreateCheckout);

// Handler do Webhook do Stripe
async function handleStripeWebhook(req: express.Request, res: express.Response) {
  const stripe = getStripeClient();
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (stripe && webhookSecret && signature && (req as any).rawBody) {
      event = stripe.webhooks.constructEvent((req as any).rawBody, signature, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err: any) {
    console.error('Erro de validação do Webhook do Stripe:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Ao receber checkout.session.completed, atualizar a tabela subscriptions no Supabase
  if (event && event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const admin = getSupabaseAdmin();

    if (admin) {
      try {
        const metadata = session.metadata || {};
        const userId = session.client_reference_id || metadata.user_id;

        await admin.from('subscriptions').upsert({
          stripe_checkout_session_id: session.id,
          stripe_customer_id: (session.customer as string) || null,
          stripe_subscription_id: (session.subscription as string) || session.id,
          user_id: userId && userId !== 'anonymous' ? userId : null,
          user_email: session.customer_email || metadata.user_email || session.customer_details?.email,
          plan_name: metadata.plan_name || 'Sakura Pro',
          amount: session.amount_total || 2900,
          currency: session.currency || 'brl',
          status: session.payment_status === 'paid' ? 'active' : session.payment_status,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'stripe_subscription_id' });

        console.log(`[STRIPE WEBHOOK SUCCESS] Inscrição salva no Supabase para ${session.customer_email || metadata.user_email}`);
      } catch (dbError) {
        console.error('[STRIPE WEBHOOK DB ERROR]', dbError);
      }
    }
  }

  return res.json({ received: true });
}

// Register both /webhook and /api/webhook
app.post('/webhook', handleStripeWebhook);
app.post('/api/webhook', handleStripeWebhook);

// Initialize GoogleGenAI client lazily or when requested
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'SakuraFocus' });
});

// Route: Supabase Backend Health & Privileged Status
app.get('/api/supabase/health', (_req, res) => {
  const adminClient = getSupabaseAdmin();
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasUrl = Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);

  res.json({
    configured: Boolean(adminClient),
    hasServiceRoleKey: hasServiceKey,
    hasUrl: hasUrl,
    message: adminClient
      ? 'Backend Supabase Service Role ativado e operacional.'
      : 'Service Role Key ausente no backend. Chaves privadas protegidas com sucesso.',
  });
});

// Route: Privileged Server-side Data Synchronization (Executes via Service Role Key)
app.post('/api/supabase/privileged-sync', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const user = await verifyUserToken(authHeader);

    if (!user) {
      return res.status(401).json({
        error: 'Não autorizado. Token Supabase Auth inválido ou expirado.',
      });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return res.status(503).json({
        error: 'Service Role Key do Supabase não configurada no servidor backend.',
      });
    }

    const { stats, tasks } = req.body;

    // Perform privileged server update using Service Role Key
    if (stats) {
      await admin.from('user_stats').upsert({
        user_id: user.id,
        total_xp: stats.totalXp ?? 0,
        level: stats.level ?? 1,
        streak_days: stats.streakDays ?? 0,
        tasks_completed_count: stats.tasksCompletedCount ?? 0,
        pomodoro_minutes_total: stats.pomodoroMinutesTotal ?? 0,
        history: stats.history || [],
        updated_at: new Date().toISOString(),
      });
    }

    if (tasks && Array.isArray(tasks)) {
      const records = tasks.map((t) => ({
        id: t.id,
        user_id: user.id,
        title: t.title,
        category: t.category,
        difficulty: t.difficulty,
        xp_reward: t.xpReward,
        completed: t.completed,
        completed_at: t.completedAt || null,
        estimated_minutes: t.estimatedMinutes || 15,
        subtasks: t.subtasks || [],
      }));

      if (records.length > 0) {
        await admin.from('user_tasks').upsert(records);
      }
    }

    return res.json({
      success: true,
      message: 'Dados sincronizados com sucesso via Backend Privilegiado (Service Role).',
      userId: user.id,
    });
  } catch (err: any) {
    console.error('Erro no sync privilegindo Supabase:', err);
    return res.status(500).json({ error: err.message || 'Erro no servidor' });
  }
});

// Route: Generate Japanese Zen/Samurai Motivational Quote
app.post('/api/gemini/quote', async (req, res) => {
  try {
    const { mood = 'foco', level = 1, streak = 1, completedToday = 0, totalToday = 0 } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Return fallback quote gracefully if no API key is set
      const fallbacks: Record<string, string> = {
        foco: "O bambu que se curva ao vento é mais forte que o carvalho que resiste à tempestade. Foque em um único passo por vez.",
        bushido: "A jornada de mil milhas começa com um único passo calmo. O verdadeiro guerreiro domina a própria mente.",
        calmaria: "Respire fundo como a brisa entre as cerejeiras. Não se apresse, apenas continue em frente.",
        gentileza: "A compaixão com seu próprio ritmo é o segredo do foco sustentável. Cada pequena vitória conta.",
      };
      return res.json({
        quote: fallbacks[mood] || fallbacks.foco,
        author: "Mestre Zen Sakura",
        kanji: "集中",
        kanjiMeaning: "Foco Absoluto",
        source: "offline_fallback"
      });
    }

    const prompt = `Você é um mestre zen e estrategista samurai focado na técnica japonesa de clareza mental e Kaizen (melhoria contínua), falando em Português do Brasil com uma pessoa que busca superar distrações e ter foco.
    
Contexto do Usuário:
- Nível atual: ${level} de 10
- Dias de Batalha em sequência (Streak): ${streak} dias
- Tarefas concluídas hoje: ${completedToday} de ${totalToday}
- Estilo do momento desejado: ${mood} (opções: foco, bushido, calmaria, gentileza)

Crie uma frase inspiradora curta, profunda e poética (máximo 20-35 palavras) para ficar no topo do aplicativo 'SakuraFocus'.
Responda ESTRITAMENTE em formato JSON com as seguintes chaves:
- "quote": a frase motivacional inspiradora
- "author": o autor fictício ou filósofo (ex: "Mestre Miyamoto Musashi", "Provérbio Zen", "Sabedoria Sakura")
- "kanji": 1 a 2 caracteres japoneses relacionados (ex: 精神, 忍耐, 桜, 富士)
- "kanjiMeaning": tradução simples dos kanjis (ex: "Espírito", "Paciência", "Flor de Cerejeira", "Progresso Constant")`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            author: { type: Type.STRING },
            kanji: { type: Type.STRING },
            kanjiMeaning: { type: Type.STRING },
          },
          required: ['quote', 'author', 'kanji', 'kanjiMeaning'],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json({ ...data, source: 'gemini' });
    }

    throw new Error('Sem resposta válida do Gemini');
  } catch (error: any) {
    console.error('Erro ao gerar citação Gemini:', error);
    return res.json({
      quote: "Concentre toda a sua mente no momento presente. A flor de cerejeira desabrocha no seu próprio tempo.",
      author: "Provérbio Zen",
      kanji: "一心",
      kanjiMeaning: "Mente Focada",
      source: "fallback_error"
    });
  }
});

// Route: Micro-Focus Task Breakdown for Focus/ADHD support
app.post('/api/gemini/breakdown', async (req, res) => {
  try {
    const { taskTitle, category = 'Geral' } = req.body;
    if (!taskTitle) {
      return res.status(400).json({ error: 'Título da tarefa é obrigatório' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Offline fallback
      return res.json({
        subtasks: [
          `Preparar o ambiente e materiais para: ${taskTitle}`,
          `Executar os primeiros 10 minutos sem interrupções`,
          `Revisar e concluir com calma`
        ]
      });
    }

    const prompt = `A ajude uma pessoa que tem dificuldade de foco/TDAH a quebrar a seguinte tarefa em EXATAMENTE 3 micro-passos ultra-simples, claros e fáceis de começar imediatamente:
    
Tarefa Principal: "${taskTitle}" (Categoria: ${category})

Retorne em formato JSON com uma chave "subtasks" sendo um array de 3 strings curtas em Português do Brasil.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['subtasks'],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json(data);
    }

    throw new Error('Resposta do Gemini vazia');
  } catch (err: any) {
    console.error('Erro ao quebrar tarefa:', err);
    return res.json({
      subtasks: [
        `Organizar o primeiro passo básico de ${req.body.taskTitle || 'foco'}`,
        `Focar por 15 minutos sem distrações`,
        `Finalizar e registrar seu progresso`
      ]
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SakuraFocus server rodando em http://localhost:${PORT}`);
  });
}

startServer();
