const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const ABACATE_KEY = process.env.ABACATEPAY_API_KEY;
  if (!ABACATE_KEY) return res.status(500).json({ error: 'ABACATEPAY_API_KEY nao configurada' });

  try {
    const { nome, segmento } = req.body;
    const payload = {
      method: 'PIX',
      data: {
        amount: 19700,
        description: `Diagnostico Empresarial - ${nome || 'Cliente'}`,
        expiresIn: 3600,
        externalId: `diag-${Date.now()}`
      }
    };

    const response = await fetch('https://api.abacatepay.com/v2/transparents/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ABACATE_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: text }); }
    return res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
