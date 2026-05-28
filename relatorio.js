const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const CLAUDE_KEY = process.env.ANTHROPIC_API_KEY;
  if (!CLAUDE_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY nao configurada' });

  try {
    const d = req.body;
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

Gere o relatório com EXATAMENTE estas seções:
## 📊 Diagnóstico Geral
## 🚨 Pontos Críticos (Top 3)
## 💡 Oportunidades Imediatas
## 🗺️ Plano de Ação 90 Dias
## 📱 Presença Digital: O que fazer
## 💰 Potencial de Crescimento
## ✅ Comece Esta Semana

Seja direto, prático e específico. Nada genérico.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
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
    if (!response.ok) return res.status(response.status).json({ error: data });
    return res.status(200).json({ relatorio: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
