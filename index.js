const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.post("/nutrition", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: `You are a nutrition assistant. Return ONLY a JSON object, no markdown, no explanation. Format: {"name":"food name","calories":number,"protein_g":number,"carbs_g":number,"fat_g":number,"serving_note":"description of serving size"}. Always give your best estimate, never refuse.`,
        messages: [{ role: "user", content: req.body.food }],
      }),
    });
    const data = await response.json();
    const text = data.content.map(b => b.text || "").join("");
    const match = text.match(/\{[\s\S]*\}/);
    res.json(JSON.parse(match[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(process.env.PORT || 3000);
