const https = require('https');
const http = require('http');
const url = require('url');
const seedConfig = require('./seed-config');

const SEED_API_SECRET = process.env.SEED_API_SECRET || 'pharma-seed-secret-2026';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';

function seedDatabase(callback) {
  const postData = JSON.stringify(seedConfig);
  const parsedUrl = url.parse(SERVER_URL);
  const isHttps = parsedUrl.protocol === 'https:';
  const client = isHttps ? https : http;

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (isHttps ? 443 : 3000),
    path: '/api/seed',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Authorization': `Bearer ${SEED_API_SECRET}`
    }
  };

  const req = client.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (callback) callback(null, { status: res.statusCode, body: data });
    });
  });

  req.on('error', (err) => {
    if (callback) callback(err, null);
  });

  req.write(postData);
  req.end();
}

console.log('Enviando dados de seed para o servidor...');
seedDatabase((err, result) => {
  if (err) {
    console.error('Erro ao conectar ao servidor:', err.message);
    process.exit(1);
  }

  if (result.status === 200) {
    console.log('Seed concluído com sucesso!');
    console.log(result.body);
  } else {
    console.error(`Falha no seed. Status: ${result.status}`);
    console.error(result.body);
    process.exit(1);
  }
});
