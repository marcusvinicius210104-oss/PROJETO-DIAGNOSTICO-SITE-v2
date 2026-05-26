const fetch = require('node-fetch');
const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' };
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
  if (!CLAUDE_KEY) return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada' }) };

  try {
    const d = JSON.parse(event.body);
    const prompt = `Você é um consultor empresarial especialista em pequenos negócios locais brasileiros. Gere um diagnóstico estratégico completo.\n\nDADOS:\n- Nome: ${d.nome}\n- Segmento: ${d.segmento}\n- Cidade: ${d.cidade}\n- Desafio: ${d.desafio}\n- Canais: ${d.canais}\n- Objetivo: ${d.objetivos || 'Não informado'}\n\nGere com estas seções:\n## 📊 Diagnóstico Geral\n## 🚨 Pontos Críticos (Top 3)\n## 💡 Oportunidades Imediatas\n## 🗺️ Plano de Ação 90 Dias\n## 📱 Presença Digital\n## 💰 Potencial de Crescimento\n## ✅ Comece Esta Semana`;
    const response = await fetch(CLAUDE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2800,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    if (!response.ok) return { statusCode: response.status, body: JSON.stringify({ error: data }) };
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ relatorio: data.content[0].text })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
