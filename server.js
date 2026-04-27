import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import { fileURLToPath } from "url";

export const app = express();
const port = process.env.PORT || 3000;
const currentFile = fileURLToPath(import.meta.url);

app.use(express.json({ limit: "1mb" }));
app.use(express.static("."));

app.post("/generate", async (req, res) => {
  try {
    const text = String(req.body.text || "").trim();

    if (!text) {
      return res.status(400).json({ error: "Reviewer text is required." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not set on the server." });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-nano",
      input: [
        {
          role: "system",
          content:
            "You create clear beginner-friendly study materials. Return exactly 5 questions with short helpful answers.",
        },
        {
          role: "user",
          content: `Generate 5 study questions with answers based on this reviewer text:\n\n${text}`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "study_questions",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              questions: {
                type: "array",
                minItems: 5,
                maxItems: 5,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" },
                  },
                  required: ["question", "answer"],
                },
              },
            },
            required: ["questions"],
          },
        },
      },
    });

    const parsed = JSON.parse(response.output_text);
    return res.json({ questions: parsed.questions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to generate questions." });
  }
});

if (process.argv[1] && process.argv[1].toLowerCase() === currentFile.toLowerCase()) {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Text to Reviewer is running at http://localhost:${port}`);
  });
}
