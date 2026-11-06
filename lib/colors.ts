const wrap = (code: number, close: number) => (str: any) => `\x1b[${code}m${str}\x1b[${close}m`;

const colors: any = {
  enabled: true,
  green: wrap(32, 39),
  yellow: wrap(33, 39),
  red: wrap(31, 39),
  blue: wrap(34, 39),
  gray: wrap(90, 39),
  white: wrap(37, 39),
  safe: {
    green: wrap(32, 39),
    yellow: wrap(33, 39),
    red: wrap(31, 39),
  }
};

colors.safe.safe = colors.safe;

export const safe = colors.safe;
export { colors };
export default colors;
