function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportReportPdf({ title, summary = [], rows = [], columns = [], filename = 'relatorio.pdf' }) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFontSize(18);
  doc.text(title, 40, 44);

  if (summary.length > 0) {
    autoTable(doc, {
      startY: 64,
      head: [['Indicador', 'Valor']],
      body: summary,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 197, 94] },
    });
  }

  autoTable(doc, {
    startY: summary.length > 0 ? doc.lastAutoTable.finalY + 24 : 72,
    head: [columns.map((column) => column.header)],
    body: rows.map((row) => columns.map((column) => row[column.key] ?? '')),
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(filename);
}

export async function exportReportExcel({ title, summary = [], rows = [], columns = [], filename = 'relatorio.xls' }) {
  const escape = (value) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const summaryRows = summary.map(([label, value]) => `<tr><td>${escape(label)}</td><td>${escape(value)}</td></tr>`).join('');
  const headerRows = columns.map((column) => `<th>${escape(column.header)}</th>`).join('');
  const bodyRows = rows
    .map((row) => `<tr>${columns.map((column) => `<td>${escape(row[column.key])}</td>`).join('')}</tr>`)
    .join('');
  const html = `
    <html>
      <head><meta charset="UTF-8" /></head>
      <body>
        <h1>${escape(title)}</h1>
        <table border="1">
          <tbody>${summaryRows}</tbody>
        </table>
        <br />
        <table border="1">
          <thead><tr>${headerRows}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </body>
    </html>
  `;

  downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' }), filename.replace(/\.xlsx$/, '.xls'));
}
