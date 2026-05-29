const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const MP_TOKEN = process.env.MP_ACCESS_TOKEN;
  if (!MP_TOKEN) return res.status(500).json({ error: 'MP_ACCESS_TOKEN nao configurado' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID nao informado' });

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { 'Authorization': `Bearer ${MP_TOKEN}` }
    });

    const data = await response.json();
    console.log('[MP STATUS] id:', id, 'status:', data.status);

    return res.status(200).json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
