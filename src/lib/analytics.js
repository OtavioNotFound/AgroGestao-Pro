export function getMonthlyFinancials(entries = [], revenue = 0) {
  const grouped = entries.reduce((acc, item) => {
    const date = new Date(item.data_lancamento || item.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    if (!acc[key]) acc[key] = { key, month: label, receita: 0, despesa: 0 };
    acc[key].despesa += Number(item.custo || 0);
    return acc;
  }, {});

  const rows = Object.values(grouped).sort((a, b) => a.key.localeCompare(b.key));
  if (rows.length === 0) return [];

  const monthlyRevenue = Number(revenue || 0) / rows.length;
  return rows.map((row) => ({
    ...row,
    receita: monthlyRevenue,
    lucro: monthlyRevenue - row.despesa,
  }));
}

export function getExpensesByCategory(entries = []) {
  const grouped = entries.reduce((acc, item) => {
    const category = item.categoria || item.category || 'Sem categoria';
    acc[category] = (acc[category] || 0) + Number(item.custo || 0);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, value]) => ({ category, value }));
}

export function getTotalCost(entries = []) {
  return entries.reduce((sum, item) => sum + Number(item.custo || 0), 0);
}

