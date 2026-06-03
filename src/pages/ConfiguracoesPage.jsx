import { useState } from 'react';
import { Database, KeyRound, ShieldCheck, UserRoundCog } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../hooks/useWorkspace';
import { createFarm, createSeason } from '../services/supabaseServices';

export function ConfiguracoesPage() {
  const { user } = useAuth();
  const { farm, season } = useWorkspace();
  const [farmForm, setFarmForm] = useState({ name: '', city: '', total_area: '' });
  const [seasonForm, setSeasonForm] = useState({ name: '', crop: '', planted_area: '', expected_production: '', actual_production: '', actual_revenue: '' });
  const [message, setMessage] = useState('');
  const settings = [
    ['Perfil', user?.email || 'Usuario autenticado', UserRoundCog],
    ['Banco de dados', 'Supabase preservado com RLS', Database],
    ['Seguranca', 'Auth, politicas por user_id e sessoes', ShieldCheck],
    ['Acessos', 'Base para permissoes por propriedade', KeyRound],
  ];

  async function handleFarm(event) {
    event.preventDefault();
    await createFarm({ userId: user.id, ...farmForm });
    setMessage('Fazenda salva. Recarregue a pagina para atualizar o seletor.');
    setFarmForm({ name: '', city: '', total_area: '' });
  }

  async function handleSeason(event) {
    event.preventDefault();
    await createSeason({ userId: user.id, farmId: farm?.id, ...seasonForm });
    setMessage('Safra salva. Recarregue a pagina para atualizar o seletor.');
    setSeasonForm({ name: '', crop: '', planted_area: '', expected_production: '', actual_production: '', actual_revenue: '' });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Configuracoes</h1>
        <p className="mt-2 text-sm text-slate-500">Organizacao, conta, seguranca e propriedades rurais.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {settings.map(([title, description, Icon]) => (
          <Card key={title} className="p-5">
            <div className="flex gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-950">{title}</p>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader title="Propriedades e safras" description="Estrutura pronta para evoluir multi-fazenda e multi-safra sem alterar a autenticacao." />
        <div className="p-5 text-sm text-slate-500">
          Atual: {farm?.name || 'nenhuma fazenda cadastrada'} / {season?.name || 'nenhuma safra cadastrada'}
        </div>
      </Card>
      {message && <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cadastrar fazenda" description="Dados salvos por usuario" />
          <form onSubmit={handleFarm} className="space-y-3 p-5">
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Nome da fazenda" value={farmForm.name} onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })} required />
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Cidade/UF" value={farmForm.city} onChange={(e) => setFarmForm({ ...farmForm, city: e.target.value })} />
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" placeholder="Area total em hectares" value={farmForm.total_area} onChange={(e) => setFarmForm({ ...farmForm, total_area: e.target.value })} />
            <Button>Salvar fazenda</Button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Cadastrar safra" description="Vinculada a fazenda atual" />
          <form onSubmit={handleSeason} className="space-y-3 p-5">
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Nome da safra" value={seasonForm.name} onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })} required />
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Cultura" value={seasonForm.crop} onChange={(e) => setSeasonForm({ ...seasonForm, crop: e.target.value })} />
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" placeholder="Area plantada" value={seasonForm.planted_area} onChange={(e) => setSeasonForm({ ...seasonForm, planted_area: e.target.value })} />
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" placeholder="Producao prevista" value={seasonForm.expected_production} onChange={(e) => setSeasonForm({ ...seasonForm, expected_production: e.target.value })} />
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" placeholder="Producao realizada" value={seasonForm.actual_production} onChange={(e) => setSeasonForm({ ...seasonForm, actual_production: e.target.value })} />
            <input className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="number" placeholder="Receita realizada" value={seasonForm.actual_revenue} onChange={(e) => setSeasonForm({ ...seasonForm, actual_revenue: e.target.value })} />
            <Button>Salvar safra</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
