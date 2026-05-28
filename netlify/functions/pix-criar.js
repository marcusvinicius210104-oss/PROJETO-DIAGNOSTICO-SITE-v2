const fetch = require('node-fetch');

exports.handler = async (event) => {

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };

  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const ABACATE_KEY = process.env.ABACATEPAY_API_KEY;

  if (!ABACATE_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'ABACATEPAY_API_KEY nao configurada' }) };

  try {

    const { nome, segmento } = JSON.parse(event.body);

    const payload = { method: 'PIX', data: { amount: 19700, description: `Diagnostico Empresarial - ${nome || 'Cliente'}`, expiresIn: 3600, externalId: `diag-${Date.now()}` } };

    const response = await fetch('https://api.abacatepay.com/v2/transparents/create', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ABACATE_KEY}` }, body: JSON.stringify(payload) });

    const text = await response.text();

    let data; try { data = JSON.parse(text); } catch(e) { return { statusCode: 500, body: JSON.stringify({ error: text }) }; }

    return { statusCode: response.ok ? 200 : response.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) };

  } catch (err) { return { statusCode: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: err.message }) }; }

};
