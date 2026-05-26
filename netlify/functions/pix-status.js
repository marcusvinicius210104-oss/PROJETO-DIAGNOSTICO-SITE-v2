const fetch = require('node-fetch');

const ABACATE_KEY = 'abc_prod_A45GXEC5dNgqFDuEbSjkTkDc';
const ABACATE_URL = 'https://api.abacatepay.com/v2';

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const id = event.queryStringParameters?.id;
    if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'ID não informado' }) };

    const response = await fetch(`${ABACATE_URL}/transparents/check?id=${id}`, {
      headers: { 'Authorization': `Bearer ${ABACATE_KEY}` }
    });

    const text = await response.text();
    console.log('[PIX STATUS]', text);

    let data;
    try { data = JSON.parse(text); } catch(e) {
      return { statusCode: 500, body: JSON.stringify({ error: text }) };
    }

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
