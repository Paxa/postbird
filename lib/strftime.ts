const pad = (n: number, len = 2) => String(n).padStart(len, '0');
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function strftime(format: string, date?: any): string {
  if (date === null || date === undefined || date === '') return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const Y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const dNum = pad(d.getDate());
  const H = pad(d.getHours());
  const M = pad(d.getMinutes());
  const S = pad(d.getSeconds());
  const L = pad(d.getMilliseconds(), 3);
  const B = MONTHS[d.getMonth()];

  return format
    .replace(/%F/g, `${Y}-${m}-${dNum}`)
    .replace(/%T/g, `${H}:${M}:${S}`)
    .replace(/%Y/g, String(Y))
    .replace(/%m/g, m)
    .replace(/%d/g, dNum)
    .replace(/%H/g, H)
    .replace(/%M/g, M)
    .replace(/%S/g, S)
    .replace(/%L/g, L)
    .replace(/%B/g, B);
}

export default strftime;
