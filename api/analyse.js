export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { pseudo, objectif } = req.body;

  if (!pseudo || !objectif) {
    return res.status(400).json({ error: 'pseudo et objectif requis' });
  }

  const prompt = `Tu es un expert en stratégie Instagram. Analyse le compte Instagram @${pseudo} dont l'objectif principal est : ${objectif}.

Génère un rapport d'analyse complet et structuré avec :

1. **SCORE GLOBAL** : Donne un score entre 0 et 100 basé sur ce que tu sais de ce type de compte Instagram. Mets-le en tout premier sous la forme "SCORE: XX/100"

2. **DIAGNOSTIC RAPIDE** : 3-4 phrases sur le profil type de ce compte et ses forces/faiblesses probables selon son handle.

3. **POINTS FORTS** : 3 points positifs concrets (utilise des bullet points avec ✅)

4. **FREINS À LA CROISSANCE** : 3 problèmes qui bloquent probablement la progression (utilise des bullet points avec ⚠️)

5. **PLAN D'ACTION CETTE SEMAINE** : 5 actions précises, actionnables immédiatement, numérotées et adaptées à l'objectif "${objectif}"

6. **CONSEIL EXPERT** : Un insight stratégique spécifique à l'objectif ${objectif} que 90% des créateurs ignorent.

Sois direct, concret, sans blabla. Parle en "tu". Adapte tout à l'objectif : ${objectif}.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content.map(i => i.text || '').join('');
    res.status(200).json({ result: text });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
