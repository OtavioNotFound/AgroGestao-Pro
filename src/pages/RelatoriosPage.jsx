import { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, Share2, SlidersHorizontal } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { createReport, listCropStages, listFinancialEntries, listReports } from '../services/supabaseServices';
import { useWorkspace } from '../hooks/useWorkspace';
import { exportReportExcel, exportReportPdf } from '../lib/reportExports';
import { getExpensesByCategory, getMonthlyFinancials, getTotalCost } from '../lib/analytics';
import { formatCurrency, formatNumber } from '../lib/formatters';
import { ExpensesPieChart, MonthlyFinanceChart, ProfitLineChart } from '../components/dashboard/FinancialCharts';

export function RelatoriosPage() {
  const { user } = useAuth();
  const { season } = useWorkspace();
  const [reports, setReports] = useState([]);
  const [entries, setEntries] = useState([]);
  const [stages, setStages] = useState([]);
  const [form, setForm] = useState({ name: '', category: 'Financeiro' });

  async function loadReports() {
    const [reportRows, financialRows, stageRows] = await Promise.all([
      listReports(user.id),
      listFinancialEntries(user.id),
      listCropStages(user.id),
    ]);
    setReports(reportRows);
    setEntries(financialRows);
    setStages(stageRows);
  }

  useEffect(() => {
    if (user?.id) loadReports();
  }, [user?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    await createReport({ userId: user.id, ...form });
    setForm({ name: '', category: 'Financeiro' });
    loadReports();
  }

  const columns = [
    { key: 'name', label: 'Relatorio' },
    { key: 'category', label: 'Categoria' },
    { key: 'owner', label: 'Responsavel', render: (row) => row.owner || '-' },
    { key: 'updated_at', label: 'Atualizado', render: (row) => new Date(row.updated_at).toLocaleDateString('pt-BR') },
    {
      key: 'actions',
      label: 'Acoes',
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="secondary" className="px-3" onClick={() => exportPdf(row)}><Download className="h-4 w-4" /></Button>
          <Button variant="secondary" className="px-3" onClick={() => exportExcel(row)}><FileSpreadsheet className="h-4 w-4" /></Button>
          <Button variant="secondary" className="px-3"><Share2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];
  const revenue = Number(season?.actual_revenue || 0);
  const totalCost = getTotalCost(entries);
  const monthly = getMonthlyFinancials(entries, revenue);
  const expensesByCategory = getExpensesByCategory(entries);
  const summary = [
    ['Receita total', formatCurrency(revenue)],
    ['Custos totais', formatCurrency(totalCost)],
    ['Lucro/prejuizo', formatCurrency(revenue - totalCost)],
    ['Produtividade', `${formatNumber(season?.productivity || 0)} sc/ha`],
  ];
  const financialRows = entries.map((entry) => ({
    data: new Date(entry.data_lancamento || entry.created_at).toLocaleDateString('pt-BR'),
    descricao: entry.nome_insumo,
    categoria: entry.categoria || 'Sem categoria',
    valor: formatCurrency(entry.custo),
  }));
  const reportColumns = [
    { key: 'data', header: 'Data' },
    { key: 'descricao', header: 'Descricao' },
    { key: 'categoria', header: 'Categoria' },
    { key: 'valor', header: 'Valor' },
  ];

  function exportPdf(report) {
    exportReportPdf({
      title: report?.name || 'Relatorio AgroGestao Pro',
      summary,
      rows: financialRows,
      columns: reportColumns,
      filename: `${report?.name || 'relatorio'}.pdf`,
    });
  }

  async function exportExcel(report) {
    await exportReportExcel({
      title: report?.name || 'Relatorio AgroGestao Pro',
      summary,
      rows: financialRows,
      columns: reportColumns,
      filename: `${report?.name || 'relatorio'}.xlsx`,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Relatorios</h1>
          <p className="mt-2 text-sm text-slate-500">Central analitica para financeiro, estoque, safras, maquinas e producao.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><SlidersHorizontal className="h-4 w-4" />Filtros avancados</Button>
          <Button onClick={() => exportPdf({ name: 'Relatorio financeiro completo' })}><Download className="h-4 w-4" />PDF</Button>
          <Button onClick={() => exportExcel({ name: 'Relatorio financeiro completo' })}><FileSpreadsheet className="h-4 w-4" />Excel</Button>
        </div>
      </div>
      <Card>
        <CardHeader title="Criar relatorio" description="Registro salvo por usuario no Supabase" />
        <form onSubmit={handleSubmit} className="grid gap-3 p-5 md:grid-cols-4">
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:col-span-2" placeholder="Nome do relatorio" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['Financeiro', 'Estoque', 'Safras', 'Maquinas', 'Producao'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <Button>Salvar</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Biblioteca de relatorios" description="PDF, Excel e compartilhamento para equipes" />
        <DataTable columns={columns} rows={reports} emptyMessage="Nenhum relatorio cadastrado." />
      </Card>
      <Card>
        <CardHeader title="Dashboard analitico" description="Indicadores prontos para revisao executiva" />
        <div className="grid gap-4 p-5 md:grid-cols-4">
          {summary.map(([metric, value]) => (
            <div key={metric} className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-900">{metric}</p>
              <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-5 xl:col-span-2">
          <CardHeader title="Evolucao mensal" description="Receitas, despesas e indicadores mensais" />
          <MonthlyFinanceChart data={monthly} />
        </Card>
        <Card className="p-5">
          <CardHeader title="Despesas por categoria" description="Distribuicao dos custos" />
          <ExpensesPieChart data={expensesByCategory} />
        </Card>
        <Card className="p-5 xl:col-span-2">
          <CardHeader title="Lucro/prejuizo" description="Resultado mensal" />
          <ProfitLineChart data={monthly} />
        </Card>
        <Card>
          <CardHeader title="Produtividade" description="Etapas da safra cadastradas" />
          <div className="space-y-3 p-5">
            {stages.map((stage) => (
              <div key={stage.id}>
                <div className="mb-1 flex justify-between text-xs font-bold text-slate-500">
                  <span>{stage.name}</span>
                  <span>{stage.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stage.progress}%` }} />
                </div>
              </div>
            ))}
            {stages.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">Nenhuma etapa de safra cadastrada.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
