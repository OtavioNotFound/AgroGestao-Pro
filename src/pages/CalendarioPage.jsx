import { useEffect, useState } from 'react';
import { CalendarDays, Filter, Move } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { createCalendarEvent, listCalendarEvents } from '../services/supabaseServices';

export function CalendarioPage() {
  const { user } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [form, setForm] = useState({ title: '', event_type: 'Plantio', event_date: '' });
  const days = Array.from({ length: 30 }, (_, index) => index + 1);

  async function loadEvents() {
    setCalendarEvents(await listCalendarEvents(user.id));
  }

  useEffect(() => {
    if (user?.id) loadEvents();
  }, [user?.id]);

  async function handleSubmit(event) {
    event.preventDefault();
    await createCalendarEvent({ userId: user.id, ...form });
    setForm({ title: '', event_type: 'Plantio', event_date: '' });
    loadEvents();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">Calendario agricola</h1>
          <p className="mt-2 text-sm text-slate-500">Visoes mensal, semanal e diaria para plantio, colheita, irrigacao e manutencoes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Filter className="h-4 w-4" />Filtros</Button>
          <Button><CalendarDays className="h-4 w-4" />Novo evento</Button>
        </div>
      </div>
      <Card>
        <CardHeader title="Novo evento" description="Evento salvo no calendario do usuario" />
        <form onSubmit={handleSubmit} className="grid gap-3 p-5 md:grid-cols-4">
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" placeholder="Titulo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
            {['Plantio', 'Colheita', 'Irrigacao', 'Fertilizacao', 'Aplicacoes', 'Manutencoes'].map((item) => <option key={item}>{item}</option>)}
          </select>
          <input className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} required />
          <Button>Salvar evento</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Maio 2026" description="Grade mensal com eventos operacionais" />
        <div className="grid grid-cols-7 border-b border-slate-100 text-center text-xs font-bold uppercase tracking-wide text-slate-400">
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'].map((day) => <div key={day} className="p-3">{day}</div>)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((day) => {
            const event = calendarEvents.find((item) => new Date(`${item.event_date}T00:00:00`).getDate() === day);
            return (
              <div key={day} className="min-h-32 border-b border-r border-slate-100 p-3">
                <p className="text-sm font-bold text-slate-700">{day}</p>
                {event && (
                  <div className="mt-3 rounded-lg bg-emerald-50 p-2 text-xs font-semibold text-emerald-800">
                    <Move className="mb-1 h-3.5 w-3.5" />
                    {event.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
