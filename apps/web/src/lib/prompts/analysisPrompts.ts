export const interviewAnalysisPrompt = (
  messages: { role: string; content: string }[],
  categories: string[],
  rationale: string,
  roleToApply: string,
  requirements: string,
  companyName: string
): string => {
  const transcript = messages.map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n\n');
  const categoriesText = JSON.stringify(categories, null, 2);

  return `You are an expert interview evaluator. Your task is to analyze an interview transcript and provide a comprehensive evaluation of the candidate's performance.

CRITICAL: You MUST return ONLY valid JSON. No markdown, no code blocks, no commentary, no backticks.
Do NOT use emojis in any part of your response.

**OUTPUT SCHEMA:**
{
  "overall_score": <number>,        // 0.0-10.0, 1 decimal place (e.g. 7.5)
  "sub_scores": {
    "interview_performance": <number>,  // 0.0-10.0
    "communication_structure": <number>, // 0.0-10.0
    "answer_quality": <number>          // 0.0-10.0
  },
  "summary": "<string>",              // 2-3 sentence overview of the interview
  "strengths": ["<string>"],          // list of what went well (plain text, no emojis)
  "weaknesses": ["<string>"],         // areas needing improvement (plain text, no emojis)
  "suggestions": ["<string>"],        // actionable next steps (plain text, no emojis)
  "detailed_feedback": "<string>"     // multi-paragraph deep analysis
}

**SCORING RUBRIC (0.0 to 10.0):**
0.0 - 3.9: Poor (Major gaps, irrelevant answers, poor communication)
4.0 - 5.9: Average (Basic answers, some gaps, okay communication)
6.0 - 7.9: Good (Solid answers, mostly covered, clear communication)
8.0 - 9.9: Very Good (Strong answers, deep knowledge, excellent structure)
10.0: Exceptional (Exceeded all expectations, flawless)

**SUB-SCORE DEFINITIONS:**
- interview_performance: How well the candidate performed for this specific role. Technical accuracy, depth, relevance to job requirements, coverage of blueprint categories.
- communication_structure: How smooth, structured, and articulate the user was. Clarity, logical flow, use of frameworks (STAR), conciseness, confidence.
- answer_quality: Correctness and appropriateness of each answer. Factual accuracy, relevance, depth, completeness, use of concrete examples.

**CONTEXT:**
- Company: ${companyName}
- Role: ${roleToApply}
- Requirements: ${requirements}
- Interview Categories Targeted: ${categoriesText}
- Interview Rationale: ${rationale}

**INTERVIEW TRANSCRIPT:**
${transcript}

Remember: Return ONLY the JSON object. No markdown formatting, no code blocks.`;
};

export const resumeAnalysisPrompt = (
  roleToApply: string,
  requirements: string,
  companyName: string
): string => {
  return `You are an expert resume reviewer and career advisor. Your task is to analyze the attached resume PDF and evaluate its fit for the target role.

CRITICAL: You MUST return ONLY valid JSON. No markdown, no code blocks, no commentary, no backticks.
Do NOT use emojis in any part of your response.

**OUTPUT SCHEMA:**
{
  "score": <number>,                // 0.0-10.0, 1 decimal place (e.g. 7.5)
  "summary": "<string>",              // 2-3 sentence overview of resume-role fit
  "strengths": ["<string>"],          // what's strong about the resume for this role (plain text, no emojis)
  "weaknesses": ["<string>"],         // gaps and mismatches (plain text, no emojis)
  "resume_suggestions": ["<string>"], // specific actionable changes to make to the resume (plain text, no emojis)
  "detailed_feedback": "<string>"     // multi-paragraph analysis of resume-role fit
}

**SCORING RUBRIC (0.0 to 10.0):**
0.0 - 3.9: Poor (Does not match role, missing key requirements, poor formatting)
4.0 - 5.9: Average (Some relevant experience, missing some keywords, okay formatting)
6.0 - 7.9: Good (Solid match, covers most requirements, clear structure)
8.0 - 9.9: Very Good (Strong match, highlights relevant achievements, excellent formatting)
10.0: Exceptional (Perfect fit, highly compelling, flawless presentation)

**CONTEXT:**
- Company: ${companyName}
- Target Role: ${roleToApply}
- Job Requirements: ${requirements}
- Resume: Attached as PDF inline data.

Focus areas: keyword alignment, experience relevance, skills gaps, formatting, ATS compatibility.
Remember: Return ONLY the JSON object. No markdown formatting, no code blocks.`;
};
