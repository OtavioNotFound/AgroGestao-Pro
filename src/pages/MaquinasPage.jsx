import { useEffect, useState } from 'react';
import { Gauge, Wrench } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { DataTable } from '../components/ui/DataTable';
import { MetricCard } from '../components/ui/MetricCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { createMachine, listMachines } from '../services/supabaseServices';
import { formatCurrency } from '../lib/formatters';

export function MaquinasPage() {
  const { user } = useAuth();
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'Trator', hour_meter: '', operational_cost: '', availability: '100' });

  async function loadMachines() {
    setMachines(await listMachines(user.id));
  }

  useEffect(() => {
    if (user?.id) loadMachines();
  }, [user?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    await createMachine({ userId: user.id, ...form });
    setForm({ name: '', type: 'Trator', hour_meter: '', operational_cost: '', availability: '100' });
    loadMachines();
  }

  const cost = machines.reduce((sum, item) => sum + Number(item.operational_cost || 0), 0);
  const availability = machines.length ? Math.round(machines.reduce((sum, item) => sum + Number(item.availability || 0), 0) / machines.length) : 0;
  const columns = [
    { key: 'name', label: 'Equipamento' },
    { key: 'type', label: 'Tipo' },
    { key: 'hour_meter', label: 'Horimetro', render: (row) => `${row.hour_meter || 0} h` },
    { key: 'last_maintenance', label: 'Ultima manutencao', render: (row) => row.last_maintenance || '-' },
    { key: 'next_maintenance', label: 'Proxima manutencao', render: (row) => row.next_maintenance || '-' },
    { key: 'availability', label: 'Disponibilidade', render: (row) => `${row.availability}%` },
    { key: 'operational_cost', label: 'Custo operacional', align: 'right', render: (row) => formatCurrency(row.operational_cost) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Maquinas</h1>
        <p className="mt-2 text-sm text-slate-500">Tratores, colheitadeiras, pulverizadores e caminhoes com manutencao preventiva.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title="Frota ativa" value={machines.length} icon={Gauge} />
        <MetricCard title="Disponibilidade" value={`${availability}%`} icon={Gauge} tone="blue" />
        <MetricCard title="Custos operacionais" value={formatCurrency(cost)} icon={Wrench} tone="amber" />
      </div>
      <Card>
        <CardHeader title="Cadastrar maquina" description="Equipamento salvo no banco por usuario" />
        <form onSubmit={handleSubmit} className="grid gap-3 p-5 md:grid-cols-6">
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:col-span-2" placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {['Trator', 'Colheitadeira', 'Pulverizador', 'Caminhao'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" placeholder="Horimetro" value={form.hour_meter} onChange={(e) => setForm({ ...form, hour_meter: e.target.value })} />
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" placeholder="Custo" value={form.operational_cost} onChange={(e) => setForm({ ...form, operational_cost: e.target.value })} />
          <Button>Salvar</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Gestao da frota" description="Horimetro, manutencoes e disponibilidade" />
        <DataTable columns={columns} rows={machines} emptyMessage="Nenhuma maquina cadastrada." />
      </Card>
    </div>
  );
}
