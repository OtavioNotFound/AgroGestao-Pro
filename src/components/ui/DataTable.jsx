export function DataTable({ columns, rows, emptyMessage = 'Nenhum registro encontrado.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {columns.map((column) => (
              <th key={column.key} className={`px-5 py-3 font-bold ${column.align === 'right' ? 'text-right' : ''}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 && (
            <tr>
              <td className="px-5 py-10 text-center text-slate-400" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
          {rows.map((row, index) => (
            <tr key={row.id || index} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className={`px-5 py-4 text-slate-700 ${column.align === 'right' ? 'text-right' : ''}`}>
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
