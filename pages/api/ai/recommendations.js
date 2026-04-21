const { query, initDB } = require('../../../lib/db');
const { getUser } = require('../../../lib/auth');

export default async function handler(req, res) {
  await initDB();
  const user = await getUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();
  const uid = user.userId;

  try {
    const [animals, feed, expenses, cycles, budget] = await Promise.all([
      query('SELECT type, COUNT(*) as count, AVG(price) as avg_price FROM animals WHERE user_id=$1 GROUP BY type', [uid]),
      query('SELECT * FROM feed WHERE user_id=$1', [uid]),
      query('SELECT category, SUM(amount) as total FROM expenses WHERE user_id=$1 GROUP BY category', [uid]),
      query('SELECT * FROM cycles WHERE user_id=$1 ORDER BY year DESC, month DESC LIMIT 6', [uid]),
      query('SELECT * FROM budget WHERE user_id=$1', [uid]),
    ]);

    const farmData = { animals: animals.rows, feed: feed.rows, expenses: expenses.rows, cycles: cycles.rows, budget: budget.rows[0] || {} };

    const prompt = `You are an expert agricultural business consultant. Analyze this farm data and provide recommendations in JSON format ONLY (no other text):
${JSON.stringify(farmData, null, 2)}

Respond with exactly this JSON structure:
{
  "animal_purchases": [{"animal_type":"string","reason":"string","optimal_month":"string","estimated_roi":"string","quantity_suggestion":"string"}],
  "feed_recommendations": [{"feed_type":"string","for_animals":"string","benefit":"string","cost_efficiency":"string"}],
  "cycle_optimization": [{"suggestion":"string","impact":"string","timeline":"string"}],
  "financial_insights": [{"insight":"string","action":"string","priority":"high|medium|low"}],
  "summary": "string"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] }),
    });

    const data = await response.json();
    const text = data.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const recommendations = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return res.json(recommendations);
  } catch (err) {
    console.error('AI Error:', err);
    return res.json({
      summary: "Based on general livestock farming best practices, here are recommendations for your farm.",
      animal_purchases: [{ animal_type: "Cattle", reason: "High ROI with proper feeding", optimal_month: "March-April", estimated_roi: "25-35%", quantity_suggestion: "Start with 5-10 head" }],
      feed_recommendations: [{ feed_type: "Mixed grain silage", for_animals: "Cattle", benefit: "Reduces feed costs 15-20%", cost_efficiency: "High" }],
      cycle_optimization: [{ suggestion: "Implement 90-day cycles for poultry", impact: "Better cash flow", timeline: "Next quarter" }],
      financial_insights: [{ insight: "Diversify animal types to spread risk", action: "Add at least 2 different animal categories", priority: "high" }]
    });
  }
}
