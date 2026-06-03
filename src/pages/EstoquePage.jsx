import { useEffect, useState } from 'react';
import { AlertTriangle, Boxes, History, PackageCheck } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { DataTable } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { createStockItem, listStockItems } from '../services/supabaseServices';

export function EstoquePage() {
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const [form, setForm] = useState({ category: 'Fertilizantes', name: '', quantity: '', unit: 'un', average_consumption: '', reorder_point: '' });
  const [error, setError] = useState('');

  async function loadStock() {
    try {
      setStockItems(await listStockItems(user.id));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (user?.id) loadStock();
  }, [user?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    await createStockItem({ userId: user.id, ...form });
    setForm({ category: 'Fertilizantes', name: '', quantity: '', unit: 'un', average_consumption: '', reorder_point: '' });
    loadStock();
  }

  const columns = [
    { key: 'category', label: 'Categoria' },
    { key: 'name', label: 'Item' },
    { key: 'quantity', label: 'Quantidade atual', render: (row) => `${row.quantity} ${row.unit}` },
    { key: 'average_consumption', label: 'Consumo medio', render: (row) => `${row.average_consumption || 0} ${row.unit}/dia` },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const isCritical = Number(row.quantity) <= Number(row.reorder_point || 0);
        return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isCritical ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{isCritical ? 'Critico' : 'Saudavel'}</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Estoque agricola</h1>
        <p className="mt-2 text-sm text-slate-500">Controle de fertilizantes, sementes, defensivos e combustiveis.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Itens monitorados" value={stockItems.length} icon={Boxes} />
        <MetricCard title="Alertas automaticos" value={stockItems.filter((item) => Number(item.quantity) <= Number(item.reorder_point || 0)).length} icon={AlertTriangle} tone="amber" />
        <MetricCard title="Categorias" value={new Set(stockItems.map((item) => item.category)).size} icon={PackageCheck} tone="blue" />
      </div>
      {error && <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{error}</p>}
      <Card>
        <CardHeader title="Cadastrar item" description="O item fica salvo no Supabase apenas para o usuario logado" />
        <form onSubmit={handleSubmit} className="grid gap-3 p-5 md:grid-cols-6">
          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {['Fertilizantes', 'Sementes', 'Defensivos', 'Combustiveis'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:col-span-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" placeholder="Qtd." value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Un." value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
          <Button>Salvar</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Posicao de estoque" description="Quantidade atual, consumo medio e reposicao prevista" />
        <DataTable columns={columns} rows={stockItems} emptyMessage="Nenhum item de estoque cadastrado." />
      </Card>
      <Card>
        <CardHeader title="Historico de entradas e saidas" description="Linha operacional consolidada" />
        <div className="grid gap-3 p-5 md:grid-cols-3">
          {['Entrada de 120 sc de sementes', 'Saida de 600 L de diesel', 'Reposicao prevista de NPK'].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-700">
              <History className="h-4 w-4 text-emerald-600" />
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
