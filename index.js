module.exports = parseInt(process.versions.node, 10) < 8 ? require('./lib/index.js') : require('./src/index.js');