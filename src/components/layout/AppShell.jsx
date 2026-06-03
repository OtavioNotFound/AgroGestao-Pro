import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  ChevronsLeft,
  ChevronsRight,
  Command,
  LogOut,
  Menu,
  Search,
  Sprout,
  X,
} from 'lucide-react';
import { navigationItems } from '../../constants/navigation';
import { initialsFromEmail } from '../../lib/formatters';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../hooks/useWorkspace';
import { listNotifications, markNotificationRead } from '../../services/supabaseServices';
import { Button } from '../ui/Button';

export function AppShell({ children, activePage, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, signOut } = useAuth();
  const { farm, season } = useWorkspace();
  const farmName = farm?.name || 'Cadastre sua fazenda';
  const seasonName = season?.name || 'Cadastre sua safra';
  const activeItem = useMemo(
    () => navigationItems.find((item) => item.id === activePage) || navigationItems[0],
    [activePage],
  );

  function navigate(page) {
    onNavigate(page);
    setMobileOpen(false);
    setCommandOpen(false);
  }

  useEffect(() => {
    if (!user?.id) return;
    listNotifications(user.id).then(setNotifications).catch(() => setNotifications([]));
  }, [user?.id]);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <div className="min-h-screen bg-[var(--background)] text-slate-950">
      <div className="flex min-h-screen">
        <Sidebar
          activePage={activePage}
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
          onNavigate={navigate}
          onSignOut={signOut}
          farmName={farmName}
          seasonName={seasonName}
        />

        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full w-72 bg-white" onClick={(event) => event.stopPropagation()}>
              <Sidebar activePage={activePage} onNavigate={navigate} onSignOut={signOut} mobile farmName={farmName} seasonName={seasonName} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>

              <div className="hidden min-w-0 flex-1 flex-col md:flex">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">AgroGestao Pro / {activeItem.label}</p>
                <h1 className="truncate text-lg font-bold text-slate-950">{activeItem.label}</h1>
              </div>

              <button
                onClick={() => setCommandOpen(true)}
                className="hidden min-w-[280px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 transition hover:bg-white lg:flex"
              >
                <Search className="h-4 w-4" />
                Buscar modulo, relatorio ou tarefa
                <span className="ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs font-bold text-slate-400">Ctrl K</span>
              </button>

              <Button variant="secondary" className="hidden md:inline-flex">
                <Sprout className="h-4 w-4" />
                {farmName}
              </Button>
              <Button variant="secondary" className="hidden md:inline-flex">
                {seasonName}
              </Button>

              <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setNotificationsOpen((value) => !value)}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{unreadCount}</span>}
              </button>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {initialsFromEmail(user?.email)}
              </div>
            </div>
          </header>
          {notificationsOpen && (
            <div className="absolute right-6 top-16 z-40 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
              <div className="border-b border-slate-100 p-4">
                <p className="font-bold text-slate-950">Notificacoes</p>
                <p className="text-xs text-slate-500">{unreadCount} nao lida(s)</p>
              </div>
              <div className="max-h-80 overflow-auto p-2">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => markNotificationRead(item.id).then(() => setNotifications((current) => current.map((row) => (row.id === item.id ? { ...row, is_read: true } : row))))}
                    className="w-full rounded-lg p-3 text-left hover:bg-slate-50"
                  >
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.description || 'Sem descricao'}</p>
                  </button>
                ))}
                {notifications.length === 0 && <p className="p-6 text-center text-sm text-slate-400">Nenhuma notificacao.</p>}
              </div>
            </div>
          )}

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {commandOpen && <CommandPalette onClose={() => setCommandOpen(false)} onNavigate={navigate} />}
    </div>
  );
}

function Sidebar({ activePage, collapsed = false, mobile = false, onToggle, onNavigate, onSignOut, farmName, seasonName }) {
  return (
    <aside className={`${mobile ? 'flex' : 'hidden md:flex'} ${collapsed ? 'w-20' : 'w-72'} shrink-0 flex-col border-r border-slate-200 bg-white transition-all`}>
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Sprout className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-950">AgroGestao Pro</p>
            <p className="truncate text-xs text-slate-500">SaaS agricola premium</p>
          </div>
        )}
        {!mobile && (
          <button className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-slate-100" onClick={onToggle}>
            {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="m-4 rounded-lg border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-xs font-semibold text-emerald-700">{farmName}</p>
          <p className="mt-1 text-xs text-emerald-900">{seasonName}</p>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button
          onClick={onSignOut}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && 'Sair'}
        </button>
      </div>
    </aside>
  );
}

function CommandPalette({ onClose, onNavigate }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/30 px-4 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 p-4">
          <Command className="h-5 w-5 text-slate-400" />
          <input autoFocus className="flex-1 outline-none" placeholder="Ir para modulo, relatorio ou insight..." />
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Icon className="h-4 w-4 text-slate-400" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
