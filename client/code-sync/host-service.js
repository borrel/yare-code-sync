const host = {};
host.addr = window._serverAddr || 'localhost:4000';
host.protoHint = window._protoHint || '';

host.socketAddr = window._socketAddr || `ws${host.protoHint}://${host.addr}/notify`
host.codeUrl = window._codeUrl || `http${host.protoHint}://${host.addr}/code-main`

module.exports = host;
