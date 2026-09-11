const http = require('http');

const PORT = process.env.PORT || 4000;

const messages = [
  {
    id: 'msg_1001',
    name: 'Ama Mensah',
    recipient: '+233 24 401 2233',
    carrier: 'MTN',
    campaign: 'Payday Flash Sale',
    message: 'Hi Ama! Payday Flash Sale is LIVE: 30% off everything for 48 hrs.',
    status: 'Delivered',
    sentAt: Date.now() - 2 * 60_000,
    cost: 0.07,
    segments: 2,
  },
  {
    id: 'msg_1002',
    name: 'Kofi Boateng',
    recipient: '+233 50 218 7741',
    carrier: 'Telecel',
    campaign: 'Payday Flash Sale',
    message: 'Hi Kofi! Payday Flash Sale is LIVE: 30% off everything for 48 hrs.',
    status: 'Pending',
    sentAt: Date.now() - 70_000,
    cost: 0.07,
    segments: 2,
  },
];

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'sms-backend', time: new Date().toISOString() }));
    return;
  }

  if (url.pathname === '/api/messages') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ items: messages }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, message: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`SMS backend running on http://localhost:${PORT}`);
});
