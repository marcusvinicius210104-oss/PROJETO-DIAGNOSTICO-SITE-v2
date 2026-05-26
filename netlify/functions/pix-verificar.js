const fetch = require('node-fetch');
const ABACATE_URL = 'https://api.abacatepay.com/v2';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, OPTIONS' }, body: '' };
  }

  const ABACATE_KEY = process.env.ABACATEPAY_API_KEY;
  if (!ABACATE_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'ABACATEPAY_API_KEY não configurada' }) };

  try {
    const id = event.queryStringParameters?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'ID não informado' }) };
    const response = await fetch(`${ABACATE_URL}/transparents/check?id=${id}`, {
      headers: { 'Authorization': `Bearer ${ABACATE_KEY}` }
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { return { statusCode: 500, body: JSON.stringify({ error: text }) }; }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
