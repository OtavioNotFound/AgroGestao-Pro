import {
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  Combine,
  LayoutDashboard,
  Settings,
  Sprout,
  Tractor,
  WalletCards,
} from 'lucide-react';

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'financeiro', label: 'Financeiro', icon: WalletCards },
  { id: 'estoque', label: 'Estoque', icon: Combine },
  { id: 'safras', label: 'Safras', icon: Sprout },
  { id: 'maquinas', label: 'Maquinas', icon: Tractor },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays },
  { id: 'relatorios', label: 'Relatorios', icon: ChartNoAxesCombined },
  { id: 'ia', label: 'Assistente IA', icon: Bot },
  { id: 'configuracoes', label: 'Configuracoes', icon: Settings },
];
