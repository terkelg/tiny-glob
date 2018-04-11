const isWin = process.platform === 'win32';

// unixify path for cross-platform testing
function unixify(str) {
  return isWin ? str.replace(/\\/g, '/') : str;
}

function toIgnore(str) {
  return !str.includes('.DS_Store');
}

function order(arr) {
  return arr.filter(toIgnore).map(unixify).sort();
}

module.exports = { unixify, order };
