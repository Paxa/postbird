function parseSemver(v: string): [number, number, number] {
  if (!v) return [0, 0, 0];
  const clean = String(v).trim().replace(/^v/, '').split('-')[0].split('+')[0];
  const parts = clean.split('.').map((n) => parseInt(n, 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export function compare(v1: string, v2: string): number {
  if (typeof Bun !== 'undefined' && (Bun as any).semver && typeof (Bun as any).semver.order === 'function') {
    return (Bun as any).semver.order(v1, v2);
  }
  const [a1, b1, c1] = parseSemver(v1);
  const [a2, b2, c2] = parseSemver(v2);
  if (a1 !== a2) return a1 > a2 ? 1 : -1;
  if (b1 !== b2) return b1 > b2 ? 1 : -1;
  if (c1 !== c2) return c1 > c2 ? 1 : -1;
  return 0;
}

export const gt = (a: string, b: string) => compare(a, b) > 0;
export const gte = (a: string, b: string) => compare(a, b) >= 0;
export const lt = (a: string, b: string) => compare(a, b) < 0;
export const lte = (a: string, b: string) => compare(a, b) <= 0;
export const eq = (a: string, b: string) => compare(a, b) === 0;

export const semver = {
  gt,
  gte,
  lt,
  lte,
  eq,
  compare,
};

export default semver;
