const { GoogleGenerativeAI } = require('@google/generative-ai');

const analyzeTranscript = async (transcript) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

    // Fallback if the user passes the @google/genai sdk, but let's use @google/generative-ai.
    // Actually, I'll just use GoogleGenerativeAI initialization.
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI meeting intelligence assistant. Analyze the meeting transcript below and convert the conversation into structured actionable information. 
Extract only information supported by the transcript. Identify summary, decisions, action items, assignees, deadlines and contextual priority (High, Medium, Low).
If the transcript does not contain an assignee, deadline, or priority, do not invent information. Use "Unassigned" for assignee, "No deadline specified" for deadline, and "Medium" if context is unclear for priority.

Transcript: "${transcript}"

Require valid JSON output EXACTLY matching this structure:
{
  "summary": "Detailed summary string",
  "decisions": [
    "decision 1",
    "decision 2"
  ],
  "tasks": [
    {
      "description": "Task description",
      "assignee": "Assignee name or Unassigned",
      "deadline": "Deadline string or No deadline specified",
      "priority": "High, Medium, or Low"
    }
  ]
}

Return ONLY the raw JSON object, without markdown formatting or code blocks.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/^```[a-z]*\n/g, '').replace(/\n```$/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};

module.exports = { analyzeTranscript };
