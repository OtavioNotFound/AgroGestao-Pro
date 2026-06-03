import { formatCurrency } from '../../lib/formatters';

export function BarChart({ data, valueKey = 'value', labelKey = 'label', color = '#22C55E', currency = false }) {
  const max = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const value = Number(item[valueKey] || 0);
        return (
          <div key={item[labelKey]} className="grid grid-cols-[64px_1fr_auto] items-center gap-3 text-sm">
            <span className="font-medium text-slate-500">{item[labelKey]}</span>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{ width: `${(value / max) * 100}%`, backgroundColor: item.color || color }}
              />
            </div>
            <span className="font-semibold text-slate-700">{currency ? formatCurrency(value) : value}</span>
          </div>
        );
      })}
    </div>
  );
}

export function FinanceChart({ data }) {
  const max = Math.max(...data.flatMap((item) => [item.receita, item.despesa]), 1);

  return (
    <div className="flex h-64 items-end gap-3 rounded-lg bg-slate-50 p-4">
      {data.map((item) => (
        <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex h-48 w-full items-end justify-center gap-1.5">
            <div className="w-3 rounded-t bg-emerald-500" style={{ height: `${(item.receita / max) * 100}%` }} />
            <div className="w-3 rounded-t bg-rose-400" style={{ height: `${(item.despesa / max) * 100}%` }} />
          </div>
          <span className="text-xs font-semibold text-slate-500">{item.month}</span>
        </div>
      ))}
    </div>
  );
}
