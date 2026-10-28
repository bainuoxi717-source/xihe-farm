const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, 'dist');
const port = Number(process.env.PORT || 4177);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png'};
const server = http.createServer((req, res) => {
  let requested;
  try { requested = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  const qa = requested === '/__qa';
  const file = qa ? path.join(__dirname, 'tests', 'responsive.html') : path.resolve(root, '.' + (requested === '/' ? '/index.html' : requested));
  if (!qa && !file.startsWith(root + path.sep)) { res.writeHead(403).end('Forbidden'); return; }
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405).end('Method not allowed'); return; }
  fs.readFile(file, (error, body) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : body);
  });
});
server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? `端口 ${port} 已使用，请打开 http://127.0.0.1:${port}，或更换 PORT。` : e.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`溪禾手记已启动： http://127.0.0.1:${port}\n仅在本机提供服务。按 Ctrl+C 停止。`));
