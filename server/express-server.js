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
    var data = "";
    if(("host" in req.headers) && !(['localhost','127.0.0.1'].includes(req.headers.host.substr(0, 9)))){
        //prepend host reported by headers
        data += `window._serverAddr = ${JSON.stringify(req.headers.host)};`;
    }

    //console.log(req.headers)
    if(('x-forwarded-proto' in req.headers && req.headers['x-forwarded-proto'] == 'https')){
        data += `window._protoHint = 's';`
    }



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
