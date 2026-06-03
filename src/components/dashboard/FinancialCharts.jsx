import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../lib/formatters';

const colors = ['#22C55E', '#0EA5E9', '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'];

export function MonthlyFinanceChart({ data }) {
  if (!data.length) return <EmptyChart text="Cadastre dados financeiros para gerar o grafico." />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: '#64748B', fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
          <Bar dataKey="receita" name="Receita" fill="#22C55E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="despesa" name="Despesa" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProfitLineChart({ data }) {
  if (!data.length) return <EmptyChart text="Sem historico mensal para lucro/prejuizo." />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} tick={{ fill: '#64748B', fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Line type="monotone" dataKey="lucro" name="Lucro/Prejuizo" stroke="#0EA5E9" strokeWidth={3} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ExpensesPieChart({ data }) {
  if (!data.length) return <EmptyChart text="Sem categorias de despesas cadastradas." />;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="category" innerRadius={58} outerRadius={92} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyChart({ text }) {
  return <div className="flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm font-medium text-slate-400">{text}</div>;
}
