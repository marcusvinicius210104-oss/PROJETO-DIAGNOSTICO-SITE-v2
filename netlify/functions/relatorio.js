const fetch = require('node-fetch');

const CLAUDE_URL = 'https://api.anthropic.com/v1/messages';

exports.handler = async (event) => {
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

  const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
  if (!CLAUDE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY não configurada' }) };
  }

  try {
    const d = JSON.parse(event.body);
    console.log('[RELATORIO] Gerando para:', d.nome);

    const prompt = `Você é um consultor empresarial especialista em pequenos negócios locais brasileiros. Gere um diagnóstico estratégico completo e personalizado.

DADOS DO NEGÓCIO:
- Nome: ${d.nome}
- Segmento: ${d.segmento}
- Localização: ${d.cidade}
- Tempo de mercado: ${d.tempo || 'Não informado'}
- Equipe: ${d.funcionarios || 'Não informado'}
- Faturamento mensal: ${d.faturamento || 'Não informado'}

MARKETING E CAPTAÇÃO:
- Canais usados: ${d.canais}
- Tráfego pago: ${d.trafego || 'Não informado'}
- Como capta clientes: ${d.captacao || 'Não informado'}
- Presença online: ${d.online || 'Não informado'}

DESAFIOS E OBJETIVOS:
- Maior desafio atual: ${d.desafio}
- O que já tentou: ${d.tentativas || 'Não informado'}
- Objetivo em 6 meses: ${d.objetivos || 'Não informado'}

---
Gere o relatório com EXATAMENTE estas seções:

## 📊 Diagnóstico Geral
Avaliação honesta do estágio atual. Pontos fortes e fracos.

## 🚨 Pontos Críticos (Top 3)
Os três maiores problemas que travam o crescimento, em ordem de prioridade.

## 💡 Oportunidades Imediatas
O que fazer nos próximos 30 dias com baixo custo e alto impacto.

## 🗺️ Plano de Ação 90 Dias
**Primeiros 30 dias:** ações urgentes
**31 a 60 dias:** construção de base
**61 a 90 dias:** escala e consolidação

## 📱 Presença Digital: O que fazer
Recomendações específicas para ${d.segmento} em ${d.cidade}.

## 💰 Potencial de Crescimento
Estimativa realista de resultado seguindo o plano.

## ✅ Comece Esta Semana
5 ações concretas para implementar nos próximos 7 dias.

Seja direto, prático e específico. Nada genérico.`;

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
    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data }) };
    }

    console.log('[RELATORIO] Gerado com sucesso');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ relatorio: data.content[0].text })
    };

  } catch (err) {
    console.error('[RELATORIO] Erro:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
