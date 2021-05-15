export const isWin = process.platform === 'win32';

// unixify path for cross-platform testing
export function unixify(str) {
  return isWin ? str.replace(/\\/g, '/') : str;
}

const toIgnore = (str) => !str.includes('.DS_Store');

export function order(arr) {
  return arr.filter(toIgnore).map(unixify).sort();
}
