import { useEffect, useMemo, useState } from 'react';
import { Activity, AreaChart, CircleDollarSign, ClipboardCheck, Plus, Sprout, Trash2, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { createTask, deleteTask, listCropProductions, listFinancialEntries, listTasks, updateTaskStatus } from '../services/supabaseServices';
import { formatCurrency, formatNumber } from '../lib/formatters';
import { useWorkspace } from '../hooks/useWorkspace';
import { getMonthlyFinancials, getTotalCost } from '../lib/analytics';
import { MonthlyFinanceChart, ProfitLineChart } from '../components/dashboard/FinancialCharts';

export function DashboardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [entries, setEntries] = useState([]);
  const [productions, setProductions] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [error, setError] = useState('');
  const { farm, season } = useWorkspace();

  async function loadData() {
    if (!user?.id) return;
    try {
      const [taskRows, financialRows, productionRows] = await Promise.all([listTasks(user.id), listFinancialEntries(user.id), listCropProductions(user.id)]);
      setTasks(taskRows);
      setEntries(financialRows);
      setProductions(productionRows);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const totalCosts = useMemo(() => getTotalCost(entries), [entries]);
  const revenue = Number(season?.actual_revenue || 0);
  const profit = revenue - totalCosts;
  const monthlyFinance = useMemo(() => getMonthlyFinancials(entries, revenue), [entries, revenue]);
  const productionByCrop = productions.map((item) => ({
    label: item.crop,
    value: Number(item.percentage || item.production || 0),
    color: item.color || '#22C55E',
  }));
  const pendingTasks = tasks.filter((task) => task.status !== 'done').length;
  const activeSeasons = season ? 1 : 0;

  async function handleCreateTask(event) {
    event.preventDefault();
    if (!newTask.trim()) return;
    await createTask({ title: newTask.trim(), userId: user.id });
    setNewTask('');
    loadData();
  }

  async function moveTask(task) {
    const next = task.status === 'todo' ? 'doing' : 'done';
    await updateTaskStatus({ id: task.id, status: next });
    loadData();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">{farm?.name || 'Cadastre sua fazenda'}</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Dashboard executivo</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Visao consolidada de receita, custos, produtividade, producao e operacao agricola.
          </p>
        </div>
        <Button variant="secondary">Exportar visao executiva</Button>
      </div>

      {error && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Receita total" value={formatCurrency(revenue)} caption="+14,2% vs safra anterior" icon={CircleDollarSign} />
        <MetricCard title="Despesas totais" value={formatCurrency(totalCosts)} caption={`${entries.length} lancamentos reais`} icon={Activity} tone="rose" />
        <MetricCard title={profit >= 0 ? 'Lucro' : 'Prejuizo'} value={formatCurrency(profit)} caption="Receitas menos despesas" icon={TrendingUp} tone={profit >= 0 ? 'blue' : 'rose'} />
        <MetricCard title="Tarefas pendentes" value={pendingTasks} caption={`${activeSeasons} safra ativa`} icon={ClipboardCheck} tone="amber" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Safras ativas" value={activeSeasons} caption={season?.name || 'Nenhuma safra ativa'} icon={Sprout} />
        <MetricCard title="Area plantada" value={`${formatNumber(season?.planted_area || farm?.total_area || 0)} ha`} caption={`${formatNumber(season?.productivity || 0)} sc/ha media`} icon={AreaChart} tone="amber" />
        <MetricCard title="Indicador mensal" value={monthlyFinance.length} caption="Meses com dados financeiros" icon={Activity} tone="slate" />
        <MetricCard title="Culturas monitoradas" value={productions.length} caption="Producao por cultura" icon={Sprout} tone="blue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <CardHeader title="Performance financeira" description="Receita e despesas por mes" />
          <div className="p-5">
            <MonthlyFinanceChart data={monthlyFinance} />
          </div>
        </Card>

        <Card>
          <CardHeader title="Lucro/prejuizo mensal" description="Indicador financeiro consolidado" />
          <div className="p-5">
            <ProfitLineChart data={monthlyFinance} />
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader title="Proximas atividades" description="Kanban real preservado na tabela tasks" />
          <div className="p-5">
            <form onSubmit={handleCreateTask} className="mb-4 flex gap-2">
              <input
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:bg-white"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Nova atividade da fazenda"
              />
              <Button type="submit"><Plus className="h-4 w-4" />Adicionar</Button>
            </form>
            <div className="space-y-2">
              {tasks.slice(0, 6).map((task) => (
                <div key={task.id} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">{task.title}</p>
                  {task.status !== 'done' && <Button variant="ghost" className="px-2" onClick={() => moveTask(task)}>Avancar</Button>}
                  <button className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => deleteTask(task.id).then(loadData)}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {tasks.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">Nenhuma atividade registrada.</p>}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Insights automaticos" description="Sinais operacionais para priorizacao" />
          <div className="grid gap-3 p-5">
            {[
              ['Resultado financeiro', profit >= 0 ? 'Operacao com lucro no periodo analisado.' : 'Custos acima das receitas no periodo analisado.'],
              ['Pendencias operacionais', `${pendingTasks} tarefa(s) ainda precisam de acompanhamento.`],
              ['Producao monitorada', `${productionByCrop.length} cultura(s) cadastrada(s) para analise.`],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-900">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
