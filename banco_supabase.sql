-- AgroGestao Pro - schema multiusuario para Supabase
-- Rode este arquivo no SQL Editor do Supabase.
-- Ele preserva as tabelas antigas tasks e safra_dados e adiciona os modulos reais.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Fazendas e safras
-- =========================================================
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  city text,
  total_area numeric(12,2) default 0 check (total_area >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  name text not null,
  crop text,
  planted_area numeric(12,2) default 0 check (planted_area >= 0),
  expected_production numeric(14,2) default 0 check (expected_production >= 0),
  actual_production numeric(14,2) default 0 check (actual_production >= 0),
  actual_revenue numeric(14,2) default 0 check (actual_revenue >= 0),
  productivity numeric(12,2) generated always as (
    case when planted_area > 0 then actual_production / planted_area else 0 end
  ) stored,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Tarefas/Kanban existente
-- =========================================================
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  title varchar(255) not null,
  description text,
  status varchar(50) not null default 'todo',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint valid_status check (status in ('todo', 'doing', 'done'))
);

alter table public.tasks add column if not exists farm_id uuid references public.farms(id) on delete set null;
alter table public.tasks add column if not exists season_id uuid references public.seasons(id) on delete set null;

-- =========================================================
-- Financeiro existente: custos de safra
-- =========================================================
create table if not exists public.safra_dados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  nome_insumo varchar(255) not null,
  categoria text default 'Sem categoria',
  custo numeric(12,2) not null check (custo >= 0),
  data_lancamento timestamptz default now(),
  observacoes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.safra_dados add column if not exists farm_id uuid references public.farms(id) on delete set null;
alter table public.safra_dados add column if not exists season_id uuid references public.seasons(id) on delete set null;
alter table public.safra_dados add column if not exists categoria text default 'Sem categoria';

-- =========================================================
-- Estoque
-- =========================================================
create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  category text not null check (category in ('Fertilizantes', 'Sementes', 'Defensivos', 'Combustiveis')),
  name text not null,
  quantity numeric(14,2) not null default 0 check (quantity >= 0),
  unit text not null default 'un',
  average_consumption numeric(14,2) not null default 0 check (average_consumption >= 0),
  reorder_point numeric(14,2) not null default 0 check (reorder_point >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stock_item_id uuid not null references public.stock_items(id) on delete cascade,
  movement_type text not null check (movement_type in ('entrada', 'saida')),
  quantity numeric(14,2) not null check (quantity > 0),
  notes text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Safras: etapas e producao por cultura
-- =========================================================
create table if not exists public.crop_stages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete set null,
  name text not null,
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  stage_date date,
  stage_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crop_productions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season_id uuid references public.seasons(id) on delete set null,
  crop text not null,
  production numeric(14,2) not null default 0 check (production >= 0),
  percentage numeric(5,2) default 0 check (percentage >= 0 and percentage <= 100),
  color text default '#22C55E',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Maquinas
-- =========================================================
create table if not exists public.machines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  name text not null,
  type text not null,
  hour_meter numeric(14,2) default 0 check (hour_meter >= 0),
  last_maintenance date,
  next_maintenance date,
  operational_cost numeric(14,2) default 0 check (operational_cost >= 0),
  availability numeric(5,2) default 100 check (availability >= 0 and availability <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- Calendario, relatorios e IA
-- =========================================================
create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  farm_id uuid references public.farms(id) on delete set null,
  season_id uuid references public.seasons(id) on delete set null,
  title text not null,
  event_type text not null,
  event_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  owner text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nova conversa',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  notification_type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Indices
-- =========================================================
create index if not exists farms_user_id_idx on public.farms(user_id);
create index if not exists seasons_user_id_idx on public.seasons(user_id);
create index if not exists seasons_farm_id_idx on public.seasons(farm_id);
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_status_idx on public.tasks(status);
create index if not exists safra_dados_user_id_idx on public.safra_dados(user_id);
create index if not exists safra_dados_data_lancamento_idx on public.safra_dados(data_lancamento);
create index if not exists stock_items_user_id_idx on public.stock_items(user_id);
create index if not exists stock_movements_user_id_idx on public.stock_movements(user_id);
create index if not exists crop_stages_user_id_idx on public.crop_stages(user_id);
create index if not exists crop_productions_user_id_idx on public.crop_productions(user_id);
create index if not exists machines_user_id_idx on public.machines(user_id);
create index if not exists calendar_events_user_id_idx on public.calendar_events(user_id);
create index if not exists reports_user_id_idx on public.reports(user_id);
create index if not exists ai_conversations_user_id_idx on public.ai_conversations(user_id);
create index if not exists ai_messages_user_id_idx on public.ai_messages(user_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);

-- =========================================================
-- Updated_at triggers
-- =========================================================
drop trigger if exists set_updated_at on public.farms;
create trigger set_updated_at before update on public.farms for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.seasons;
create trigger set_updated_at before update on public.seasons for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.tasks;
create trigger set_updated_at before update on public.tasks for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.safra_dados;
create trigger set_updated_at before update on public.safra_dados for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.stock_items;
create trigger set_updated_at before update on public.stock_items for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.crop_stages;
create trigger set_updated_at before update on public.crop_stages for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.crop_productions;
create trigger set_updated_at before update on public.crop_productions for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.machines;
create trigger set_updated_at before update on public.machines for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.calendar_events;
create trigger set_updated_at before update on public.calendar_events for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.reports;
create trigger set_updated_at before update on public.reports for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.ai_conversations;
create trigger set_updated_at before update on public.ai_conversations for each row execute function public.set_updated_at();

-- =========================================================
-- RLS
-- =========================================================
alter table public.farms enable row level security;
alter table public.seasons enable row level security;
alter table public.tasks enable row level security;
alter table public.safra_dados enable row level security;
alter table public.stock_items enable row level security;
alter table public.stock_movements enable row level security;
alter table public.crop_stages enable row level security;
alter table public.crop_productions enable row level security;
alter table public.machines enable row level security;
alter table public.calendar_events enable row level security;
alter table public.reports enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.notifications enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'farms',
    'seasons',
    'tasks',
    'safra_dados',
    'stock_items',
    'stock_movements',
    'crop_stages',
    'crop_productions',
    'machines',
    'calendar_events',
    'reports',
    'ai_conversations',
    'ai_messages',
    'notifications'
  ]
  loop
    execute format('drop policy if exists "%1$s_select_own" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_insert_own" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_update_own" on public.%1$I', table_name);
    execute format('drop policy if exists "%1$s_delete_own" on public.%1$I', table_name);

    execute format('create policy "%1$s_select_own" on public.%1$I for select using (auth.uid() = user_id)', table_name);
    execute format('create policy "%1$s_insert_own" on public.%1$I for insert with check (auth.uid() = user_id)', table_name);
    execute format('create policy "%1$s_update_own" on public.%1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)', table_name);
    execute format('create policy "%1$s_delete_own" on public.%1$I for delete using (auth.uid() = user_id)', table_name);
  end loop;
end $$;
