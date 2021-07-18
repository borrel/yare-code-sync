const host = {};
host.addr = window._serverAddr || 'localhost';
host.protoHint = window._protoHint || '';

host.socketAddr  = window._socketAddr || `ws${host.protoHint}://${host.addr}:8001`
host.codeAddr  = window._codeAddr || `http${host.protoHint}://${host.addr}:4000/code-main`
module.exports = host;
