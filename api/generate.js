export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { prompt } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "API key not configured." });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `Generate structured fashion content for the product: "${prompt}". Follow this exact format:

1. English product description
2. Dutch translation
3. Editor’s note
4. Three lifestyle scenarios
5. Customer segment: The Fashion Conscious
6. Fabric composition
7. Care label instructions
8. Accessorising suggestions from the De Bijenkorf range
9. Suggested SEO phrases (ranked)`
          }
        ]
      })
    });

    const json = await response.json();
    return res.status(200).json({ result: json.choices?.[0]?.message?.content || "" });
  } catch (err) {
    return res.status(500).json({ error: "OpenAI request failed." });
  }
}
