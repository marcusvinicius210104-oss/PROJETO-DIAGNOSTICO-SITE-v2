const fetch = require('node-fetch');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const ABACATE_KEY = process.env.ABACATEPAY_API_KEY;
  if (!ABACATE_KEY) return res.status(500).json({ error: 'ABACATEPAY_API_KEY nao configurada' });

  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'ID nao informado' });

    const response = await fetch(`https://api.abacatepay.com/v1/pixQrCode/check?id=${id}`, {
      headers: { 'Authorization': `Bearer ${ABACATE_KEY}` }
    });

    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { return res.status(500).json({ error: text }); }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
