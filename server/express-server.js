const provider = require('./provider');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

const allowCrossDomain = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
};

// Configure middleware
app.use(allowCrossDomain);

function getUrl(req, path='', url='http'){
  if(('x-forwarded-proto' in req.headers && req.headers['x-forwarded-proto'] == 'https')){
    url += `window._protoHint = 's';`
  }
  url +="://"

  if("x-forwarded-host" in req.headers) {
    url += req.headers['x-forwarded-host'];
  }else if("host" in req.headers) {
    url += req.headers.host;
  }
  return `${url}/${path}`;
}




app.get('/code-sync', async (req, res, next) => {
  try {
    var data = 
`window._socketAddr = ${JSON.stringify(getUrl(req, 'notify', 'ws'))};
window._codeUrl = ${JSON.stringify(getUrl(req, 'code-main'))};`;
    res.jsonp(data +  (await provider.getCodeSync()).toString());
  } catch (err) {
    next(err);
  }
});

app.get('/code-main', async (req, res, next) => {
  try {
    const data = await provider.getCodeMain();
    res.jsonp(data.toString());
  } catch (err) {
    next(err);
  }
});

app.get('/tamper.user.js', async (req, res, next) => {
  try {
    const data = 
`
// ==UserScript==
// @name         Yare.io Connecter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://yare.io/d1/*
// @icon         https://www.google.com/s2/favicons?domain=yare.io
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    confirm("Connect to CodeSync?") 
	&& fetch(${JSON.stringify(getUrl(req,'code-sync'))}).then((r)=>r.json()).then(eval);
})();
`;
    res.contentType('text/plain');
    res.send(data.toString());
  } catch (err) {
    next(err);
  }
});



app.ws('/notify', (conn, req) => {
  console.log('New connection');

  conn.on('close', (code, reason) => {
    console.log('Connection closed');
  });

  conn.on('error', () => {
    console.log('Connection error');
  });

  conn.sendEvent = (type, payload = {}) => {
    const data = {};
    data.type = type;
    data.payload = payload;
    conn.send(JSON.stringify(data));
  };
  conn.sendEvent('code-update');
});


provider.onNewBuild(() => {
  console.log('New build detected!')
  expressWs.getWss('/notify').clients.forEach((conn) => {
    conn.sendEvent('code-update');
  });
});


app.get('/', async (req, res, next) => {
  res.send(`
    <a href="/tamper.user.js">install tampermonky script</a><br />
    Or copy this to console <br />
    <textarea cols="200" rows="10" onclick="this.select()">fetch(${JSON.stringify(getUrl(req,'code-sync'))}).then((r)=>r.json()).then(eval);</textarea>
  `);
});


app.use((err, req, res, next) => {
  res.status(500).send(err.toString());
});

console.log('Starting express server...')
app.listen(4000)
