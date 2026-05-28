const fetch = require('node-fetch');

const ABACATE_URL = 'https://api.abacatepay.com/v2';

exports.handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const ABACATE_KEY = process.env.ABACATEPAY_API_KEY;
  if (!ABACATE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ABACATEPAY_API_KEY não configurada' }) };
  }

  try {
    const { nome, segmento, externalId } = JSON.parse(event.body);

    const payload = {
      method: 'PIX',
      data: {
        amount: 19700,
        description: `Diagnostico Empresarial - ${nome || 'Cliente'}`,
        expiresIn: 3600,
        externalId: externalId || `diag-${Date.now()}`,
        metadata: { negocio: nome, segmento }
      }
    };

    console.log('[PIX] Criando:', JSON.stringify(payload));

    const response = await fetch(`${ABACATE_URL}/transparents/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATE_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    console.log('[PIX] Resposta Abacate:', text);

    let data;
    try { data = JSON.parse(text); } catch(e) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Resposta invalida', raw: text }) };
    }

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };

  } catch (err) {
    console.error('[PIX] Erro:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
