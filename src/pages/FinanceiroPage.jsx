import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Search, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { MetricCard } from '../components/ui/MetricCard';
import { Button } from '../components/ui/Button';
import { FinanceChart } from '../components/ui/SimpleChart';
import { useAuth } from '../contexts/AuthContext';
import { createFinancialEntry, listFinancialEntries } from '../services/supabaseServices';
import { formatCurrency, formatDate } from '../lib/formatters';
import { useWorkspace } from '../hooks/useWorkspace';

export function FinanceiroPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ nome_insumo: '', categoria: 'Insumos', custo: '', observacoes: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const { season } = useWorkspace();

  async function loadEntries() {
    if (!user?.id) return;
    try {
      setEntries(await listFinancialEntries(user.id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadEntries();
  }, [user?.id]);

  const filtered = useMemo(
    () => entries.filter((item) => item.nome_insumo?.toLowerCase().includes(search.toLowerCase())),
    [entries, search],
  );
  const total = useMemo(() => entries.reduce((sum, item) => sum + Number(item.custo || 0), 0), [entries]);
  const revenue = Number(season?.actual_revenue || 0);
  const monthlyFinance = useMemo(() => {
    const grouped = entries.reduce((acc, item) => {
      const date = new Date(item.data_lancamento || item.created_at);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });
      acc[month] = (acc[month] || 0) + Number(item.custo || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([month, despesa]) => ({ month, receita: 0, despesa }));
  }, [entries]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.nome_insumo || !form.custo) return;
    await createFinancialEntry({
      nome_insumo: form.nome_insumo,
      categoria: form.categoria,
      custo: Number(form.custo),
      observacoes: form.observacoes,
      userId: user.id,
    });
    setForm({ nome_insumo: '', categoria: 'Insumos', custo: '', observacoes: '' });
    loadEntries();
  }

  const columns = [
    { key: 'created_at', label: 'Data', render: (row) => formatDate(row.created_at) },
    { key: 'nome_insumo', label: 'Lancamento' },
    { key: 'categoria', label: 'Categoria', render: (row) => row.categoria || 'Sem categoria' },
    { key: 'observacoes', label: 'Observacoes', render: (row) => row.observacoes || '-' },
    { key: 'custo', label: 'Valor', align: 'right', render: (row) => <span className="font-bold text-rose-600">{formatCurrency(row.custo)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Financeiro</h1>
          <p className="mt-2 text-sm text-slate-500">Fluxo de caixa, custos reais da safra e comparativos executivos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Download className="h-4 w-4" />PDF</Button>
          <Button variant="secondary"><Download className="h-4 w-4" />Excel</Button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Receita" value={formatCurrency(revenue)} icon={TrendingUp} />
        <MetricCard title="Despesas" value={formatCurrency(total)} icon={TrendingDown} tone="rose" />
        <MetricCard title="Lucro" value={formatCurrency(revenue - total)} icon={WalletCards} tone="blue" />
        <MetricCard title="Fluxo de caixa" value={formatCurrency(revenue * 0.42 - total)} caption="Projetado" icon={WalletCards} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader title="Novo lancamento" description="Grava na tabela safra_dados existente" />
          <form onSubmit={handleSubmit} className="space-y-4 p-5">
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-emerald-500" placeholder="Insumo ou despesa" value={form.nome_insumo} onChange={(e) => setForm({ ...form, nome_insumo: e.target.value })} />
            <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-emerald-500" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
              {['Insumos', 'Maquinas', 'Mao de obra', 'Combustivel', 'Logistica', 'Administrativo'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-emerald-500" type="number" step="0.01" placeholder="Valor em R$" value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} />
            <textarea className="min-h-24 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-emerald-500" placeholder="Observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            <Button className="w-full"><Plus className="h-4 w-4" />Registrar custo</Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Grafico mensal" description="Comparativo de receitas e despesas" />
          <div className="p-5">
            {monthlyFinance.length > 0 ? <FinanceChart data={monthlyFinance} /> : <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">Cadastre custos para gerar o grafico mensal.</div>}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="DataTable de movimentacoes"
          description="Busca, ordenacao visual e base para paginacao"
          action={
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          }
        />
        <DataTable columns={columns} rows={filtered} emptyMessage="Nenhum lancamento financeiro encontrado." />
      </Card>
    </div>
  );
}
