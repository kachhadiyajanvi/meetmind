const { GoogleGenerativeAI } = (() => {
  try {
    return require('@google/generative-ai');
  } catch (e) {
    return {};
  }
})();

const safeJsonParse = (text) => {
  try { return JSON.parse(text); } catch (e) { return null; }
};

const simpleExtractiveSummary = (transcript) => {
  // Very light-weight fallback summarizer and extractor for decisions/tasks
  const sentences = transcript.match(/[^.!?]+[.!?]?/g) || [transcript];
  const summary = sentences.slice(0, 3).map(s => s.trim()).join(' ');

  const lower = transcript.toLowerCase();
  const decisionLines = transcript.split(/\n+/).filter(l => /decid|decision|agree|agreed|we will|we'll|let's|lets/.test(l.toLowerCase())).map(l => l.trim()).slice(0,5);

  const tasks = [];
  const taskLines = transcript.split(/\n+/).filter(l => /action|todo|task|follow up|follow-up|assign|assign to|will do|i will|i'll/.test(l.toLowerCase()));
  for (const line of taskLines.slice(0,10)) {
    // naive assignee extraction
    let assignee = 'Unassigned';
    const m = line.match(/to\s+([A-Z][a-zA-Z0-9_\-]+)/);
    if (m) assignee = m[1];
    tasks.push({ description: line.trim(), assignee, deadline: 'No deadline specified', priority: 'Medium' });
  }

  return {
    summary: summary || transcript.slice(0, 300),
    decisions: decisionLines.length ? decisionLines : [],
    tasks
  };
};

const analyzeTranscript = async (transcript) => {
  // Try Gemini via @google/generative-ai if available, otherwise fallback to extractive
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && GoogleGenerativeAI && typeof GoogleGenerativeAI === 'function') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are an AI meeting intelligence assistant. Analyze the meeting transcript below and convert the conversation into structured actionable information. Extract only information supported by the transcript. Identify summary, decisions, action items, assignees, deadlines and contextual priority (High, Medium, Low). If the transcript does not contain an assignee, deadline, or priority, do not invent information. Use \"Unassigned\" for assignee, \"No deadline specified\" for deadline, and \"Medium\" if context is unclear for priority.\n\nTranscript: "${transcript}"\n\nRequire valid JSON output EXACTLY matching this structure: { "summary": "Detailed summary string", "decisions": ["decision 1","decision 2"], "tasks": [{ "description": "Task description","assignee": "Assignee name or Unassigned","deadline": "Deadline string or No deadline specified","priority": "High, Medium, or Low" }] }\nReturn ONLY the raw JSON object, without markdown formatting or code blocks.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = await response.text();
      text = text.replace(/^```[a-z]*\n/g, '').replace(/\n```$/g, '').trim();

      const parsed = safeJsonParse(text);
      if (parsed) return parsed;
      // if parsing failed, fall through to fallback
      console.warn('Gemini returned unparsable JSON, falling back to extractive summary');
    } catch (err) {
      console.error('Gemini analysis failed, falling back:', err.message || err);
    }
  } else {
    if (!apiKey) console.warn('GEMINI_API_KEY not set; using fallback summarizer');
  }

  // fallback
  return simpleExtractiveSummary(transcript);
};

module.exports = { analyzeTranscript };
