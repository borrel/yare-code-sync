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

app.get('/code-sync', async (req, res, next) => {
  try {
    const data = await provider.getCodeSync();
    res.jsonp(data.toString());
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
});


provider.onNewBuild(() => {
  console.log('New build detected!')
  expressWs.getWss('/notify').clients.forEach((conn) => {
    conn.sendEvent('code-update');
  });
});

app.use((err, req, res, next) => {
  res.status(500).send(err.toString());
});

console.log('Starting express server...')
app.listen(4000)
