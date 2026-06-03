import { useEffect, useMemo, useState } from 'react';
import { Bot, Loader2, Search, Send, Star } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../hooks/useWorkspace';
import {
  askAgroAi,
  createAiConversation,
  createAiMessage,
  listAiConversations,
  listAiMessages,
  listFinancialEntries,
  listMachines,
  listStockItems,
  listTasks,
} from '../services/supabaseServices';
import { getTotalCost } from '../lib/analytics';
import { formatCurrency } from '../lib/formatters';

const suggestions = [
  'Como reduzir custos?',
  'Qual cultura esta mais lucrativa?',
  'Analisar safra atual',
  'Gerar relatorio financeiro',
  'Comparar produtividade',
];

export function AssistenteIAPage() {
  const { user } = useAuth();
  const { farm, season } = useWorkspace();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contextData, setContextData] = useState({ entries: [], tasks: [], stock: [], machines: [] });

  async function loadConversations() {
    const rows = await listAiConversations(user.id);
    setConversations(rows);
    if (!activeConversation && rows[0]) setActiveConversation(rows[0]);
  }

  async function loadContext() {
    const [entries, tasks, stock, machines] = await Promise.all([
      listFinancialEntries(user.id),
      listTasks(user.id),
      listStockItems(user.id),
      listMachines(user.id),
    ]);
    setContextData({ entries, tasks, stock, machines });
  }

  useEffect(() => {
    if (!user?.id) return;
    loadConversations().catch((err) => setError(err.message));
    loadContext().catch((err) => setError(err.message));
  }, [user?.id]);

  useEffect(() => {
    if (!activeConversation?.id) {
      setMessages([]);
      return;
    }
    listAiMessages(activeConversation.id).then(setMessages).catch((err) => setError(err.message));
  }, [activeConversation?.id]);

  const context = useMemo(() => {
    const totalCost = getTotalCost(contextData.entries);
    const pendingTasks = contextData.tasks.filter((task) => task.status !== 'done').length;
    return {
      farm,
      season,
      financial: {
        totalCost,
        totalCostFormatted: formatCurrency(totalCost),
        entriesCount: contextData.entries.length,
        revenue: Number(season?.actual_revenue || 0),
      },
      tasks: {
        total: contextData.tasks.length,
        pending: pendingTasks,
      },
      stock: contextData.stock,
      machines: contextData.machines,
    };
  }, [contextData, farm, season]);

  async function ensureConversation(prompt) {
    if (activeConversation) return activeConversation;
    const created = await createAiConversation({ userId: user.id, title: prompt.slice(0, 48) });
    setActiveConversation(created);
    setConversations((current) => [created, ...current]);
    return created;
  }

  async function handleSend(customPrompt) {
    const prompt = (customPrompt || input).trim();
    if (!prompt || loading) return;

    setLoading(true);
    setError('');

    try {
      const conversation = await ensureConversation(prompt);
      const userMessage = await createAiMessage({
        userId: user.id,
        conversationId: conversation.id,
        role: 'user',
        content: prompt,
      });
      setMessages((current) => [...current, userMessage]);
      setInput('');

      const result = await askAgroAi({ message: prompt, context });
      const assistantMessage = await createAiMessage({
        userId: user.id,
        conversationId: conversation.id,
        role: 'assistant',
        content: result.answer,
      });
      setMessages((current) => [...current, assistantMessage]);
      loadConversations();
    } catch (err) {
      setError(err.message || 'Nao foi possivel chamar a IA.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-7rem)] gap-6 lg:grid-cols-[300px_1fr]">
      <Card className="flex flex-col">
        <div className="border-b border-slate-100 p-5">
          <h1 className="text-xl font-black text-slate-950">Assistente IA</h1>
          <p className="mt-1 text-sm text-slate-500">Historico salvo por usuario.</p>
        </div>
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none" placeholder="Pesquisar conversas" />
          </div>
          <Button className="mb-4 w-full" onClick={() => setActiveConversation(null)}>Nova conversa</Button>
          {conversations.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveConversation(item)}
              className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold hover:bg-slate-100 ${activeConversation?.id === item.id ? 'bg-slate-100 text-slate-950' : 'text-slate-700'}`}
            >
              <Star className="h-4 w-4 text-amber-500" />
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card className="flex min-h-[620px] flex-col overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">IA operacional</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">Como posso ajudar sua fazenda hoje?</h2>
        </div>
        <div className="flex-1 space-y-4 overflow-auto bg-slate-50 p-5">
          {error && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{error}</p>}
          {messages.length === 0 && (
            <>
              <div className="max-w-2xl rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-900"><Bot className="h-4 w-4 text-emerald-600" />AgroGestao IA</div>
                <p className="text-sm leading-6 text-slate-600">
                  Vou analisar seus custos, tarefas, estoque, maquinas e safra ativa. A chave Gemini fica segura na Edge Function.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleSend(item)}
                    className="rounded-lg border border-slate-200 bg-white p-4 text-left text-sm font-bold text-slate-700 shadow-sm hover:border-emerald-200 hover:text-emerald-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`max-w-3xl rounded-lg p-4 shadow-sm ${message.role === 'user' ? 'ml-auto bg-slate-950 text-white' : 'bg-white text-slate-700'}`}>
              <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
            </div>
          ))}
          {loading && (
            <div className="flex max-w-xs items-center gap-2 rounded-lg bg-white p-4 text-sm font-semibold text-slate-500 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              Analisando dados da fazenda...
            </div>
          )}
        </div>
        <form
          className="border-t border-slate-100 bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <input
              className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              placeholder="Pergunte sobre sua operacao agricola..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <Button disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
