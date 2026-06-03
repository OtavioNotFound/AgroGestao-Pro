import { useEffect, useState } from 'react';
import { AreaChart, BarChart3, Sprout, Wheat } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { MetricCard } from '../components/ui/MetricCard';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../hooks/useWorkspace';
import { createCropStage, listCropStages } from '../services/supabaseServices';
import { formatNumber } from '../lib/formatters';

export function SafrasPage() {
  const { user } = useAuth();
  const { season } = useWorkspace();
  const [cropTimeline, setCropTimeline] = useState([]);
  const [form, setForm] = useState({ name: '', progress: '', stage_date: '' });

  async function loadStages() {
    setCropTimeline(await listCropStages(user.id));
  }

  useEffect(() => {
    if (user?.id) loadStages();
  }, [user?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    await createCropStage({ userId: user.id, ...form });
    setForm({ name: '', progress: '', stage_date: '' });
    loadStages();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Safras</h1>
        <p className="mt-2 text-sm text-slate-500">Acompanhamento completo da safra atual, evolucao e historico.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard title="Safra atual" value={season?.name || 'Nao cadastrada'} icon={Sprout} />
        <MetricCard title="Area cultivada" value={`${formatNumber(season?.planted_area || 0)} ha`} icon={AreaChart} tone="blue" />
        <MetricCard title="Producao prevista" value={`${formatNumber(season?.expected_production || 0)} sc`} icon={Wheat} tone="amber" />
        <MetricCard title="Produtividade" value={`${formatNumber(season?.productivity || 0)} sc/ha`} icon={BarChart3} tone="emerald" />
      </div>
      <Card>
        <CardHeader title="Cadastrar etapa" description="Cada etapa fica vinculada ao usuario autenticado" />
        <form onSubmit={handleSubmit} className="grid gap-3 p-5 md:grid-cols-4">
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Etapa" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" min="0" max="100" placeholder="Progresso %" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} required />
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="date" value={form.stage_date} onChange={(e) => setForm({ ...form, stage_date: e.target.value })} />
          <Button>Salvar etapa</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Timeline da safra" description="Planejamento, plantio, manejo e colheita" />
        <div className="grid gap-4 p-5">
          {cropTimeline.map((item) => (
            <div key={item.id} className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 p-4 md:grid-cols-[160px_1fr_80px] md:items-center">
              <div>
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.stage_date || '-'}</p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.progress}%` }} />
              </div>
              <p className="text-sm font-bold text-slate-700">{item.progress}%</p>
            </div>
          ))}
          {cropTimeline.length === 0 && <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">Nenhuma etapa cadastrada para este usuario.</div>}
        </div>
      </Card>
    </div>
  );
}
