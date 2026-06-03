import { supabase } from '../../supabaseClient';

export async function listTasks(userId) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createTask({ title, userId }) {
  const { error } = await supabase.from('tasks').insert([
    {
      title,
      status: 'todo',
      user_id: userId,
    },
  ]);

  if (error) throw error;
}

export async function updateTaskStatus({ id, status }) {
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function listFinancialEntries(userId) {
  const { data, error } = await supabase
    .from('safra_dados')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createFinancialEntry({ nome_insumo, categoria, custo, observacoes, userId }) {
  const { error } = await supabase.from('safra_dados').insert([
    {
      nome_insumo,
      categoria: categoria || 'Sem categoria',
      custo,
      observacoes,
      user_id: userId,
    },
  ]);

  if (error) throw error;
}

export async function getWorkspace(userId) {
  const [{ data: farms, error: farmsError }, { data: seasons, error: seasonsError }] = await Promise.all([
    supabase.from('farms').select('*').eq('user_id', userId).order('created_at', { ascending: true }).limit(1),
    supabase.from('seasons').select('*').eq('user_id', userId).eq('is_active', true).order('created_at', { ascending: true }).limit(1),
  ]);

  if (farmsError) throw farmsError;
  if (seasonsError) throw seasonsError;

  return {
    farm: farms?.[0] || null,
    season: seasons?.[0] || null,
  };
}

export async function createFarm({ userId, name, city, total_area }) {
  const { data, error } = await supabase
    .from('farms')
    .insert([{ user_id: userId, name, city, total_area: Number(total_area || 0) }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSeason({ userId, farmId, name, crop, planted_area, expected_production, actual_production, actual_revenue }) {
  const { data, error } = await supabase
    .from('seasons')
    .insert([
      {
        user_id: userId,
        farm_id: farmId || null,
        name,
        crop,
        planted_area: Number(planted_area || 0),
        expected_production: Number(expected_production || 0),
        actual_production: Number(actual_production || 0),
        actual_revenue: Number(actual_revenue || 0),
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listStockItems(userId) {
  const { data, error } = await supabase
    .from('stock_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createStockItem({ userId, category, name, quantity, unit, average_consumption, reorder_point }) {
  const { error } = await supabase.from('stock_items').insert([
    {
      user_id: userId,
      category,
      name,
      quantity: Number(quantity || 0),
      unit,
      average_consumption: Number(average_consumption || 0),
      reorder_point: Number(reorder_point || 0),
    },
  ]);

  if (error) throw error;
}

export async function listMachines(userId) {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createMachine({ userId, name, type, hour_meter, last_maintenance, next_maintenance, operational_cost, availability }) {
  const { error } = await supabase.from('machines').insert([
    {
      user_id: userId,
      name,
      type,
      hour_meter: Number(hour_meter || 0),
      last_maintenance: last_maintenance || null,
      next_maintenance: next_maintenance || null,
      operational_cost: Number(operational_cost || 0),
      availability: Number(availability || 100),
    },
  ]);

  if (error) throw error;
}

export async function listCalendarEvents(userId) {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCalendarEvent({ userId, title, event_type, event_date }) {
  const { error } = await supabase.from('calendar_events').insert([
    {
      user_id: userId,
      title,
      event_type,
      event_date,
    },
  ]);

  if (error) throw error;
}

export async function listReports(userId) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createReport({ userId, name, category }) {
  const { error } = await supabase.from('reports').insert([{ user_id: userId, name, category }]);
  if (error) throw error;
}

export async function listCropStages(userId) {
  const { data, error } = await supabase
    .from('crop_stages')
    .select('*')
    .eq('user_id', userId)
    .order('stage_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCropStage({ userId, name, progress, stage_date }) {
  const { error } = await supabase.from('crop_stages').insert([
    {
      user_id: userId,
      name,
      progress: Number(progress || 0),
      stage_date,
    },
  ]);

  if (error) throw error;
}

export async function listCropProductions(userId) {
  const { data, error } = await supabase
    .from('crop_productions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function listAiConversations(userId) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAiConversation({ userId, title }) {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert([{ user_id: userId, title: title || 'Nova conversa' }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listAiMessages(conversationId) {
  const { data, error } = await supabase
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createAiMessage({ userId, conversationId, role, content }) {
  const { data, error } = await supabase
    .from('ai_messages')
    .insert([{ user_id: userId, conversation_id: conversationId, role, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function askAgroAi({ message, context }) {
  const { data, error } = await supabase.functions.invoke('agro-ai', {
    body: { message, context },
  });

  if (error) throw error;
  return data;
}

export async function listNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  if (error) throw error;
}
