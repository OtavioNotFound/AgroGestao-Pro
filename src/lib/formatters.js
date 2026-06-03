export function formatCurrency(value) {
  return Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatNumber(value, options = {}) {
  return Number(value || 0).toLocaleString('pt-BR', options);
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
}

export function initialsFromEmail(email = '') {
  const name = email.split('@')[0] || 'user';
  return name.slice(0, 2).toUpperCase();
}
