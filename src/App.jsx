import { lazy, Suspense, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { Loader2 } from 'lucide-react';

const pages = {
  dashboard: lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage }))),
  financeiro: lazy(() => import('./pages/FinanceiroPage').then((module) => ({ default: module.FinanceiroPage }))),
  estoque: lazy(() => import('./pages/EstoquePage').then((module) => ({ default: module.EstoquePage }))),
  safras: lazy(() => import('./pages/SafrasPage').then((module) => ({ default: module.SafrasPage }))),
  maquinas: lazy(() => import('./pages/MaquinasPage').then((module) => ({ default: module.MaquinasPage }))),
  calendario: lazy(() => import('./pages/CalendarioPage').then((module) => ({ default: module.CalendarioPage }))),
  relatorios: lazy(() => import('./pages/RelatoriosPage').then((module) => ({ default: module.RelatoriosPage }))),
  ia: lazy(() => import('./pages/AssistenteIAPage').then((module) => ({ default: module.AssistenteIAPage }))),
  configuracoes: lazy(() => import('./pages/ConfiguracoesPage').then((module) => ({ default: module.ConfiguracoesPage }))),
};

function AuthenticatedApp() {
  const { session, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const ActivePage = useMemo(() => pages[activePage] || pages.dashboard, [activePage]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] text-slate-500">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm font-medium">Carregando AgroGestao Pro...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      <Suspense fallback={<PageLoader />}>
        <ActivePage />
      </Suspense>
    </AppShell>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-72 items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm font-semibold text-slate-500">
      <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-600" />
      Carregando modulo...
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}
