const DEEPSEEK_API_KEY = "YOUR_API_KEY";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface LLMResponse {
  languageDetection?: string;
  categorization?: {
    personalData: Array<{
      name: string;
      title: string;
      email: string;
      phone: string;
      location: string;
    }>;
    workExperience: string[];
    education: string[];
    skills: string[];
  };
}

export async function preprocessWithLLM(
  text: string,
  task: "languageDetection" | "categorization",
): Promise<any> {
  try {
    let systemPrompt = "";
    let userPrompt = "";

    if (task === "languageDetection") {
      systemPrompt = `You are a language detection expert. Analyze the following CV text and determine if it's in English (en) or German (de). Focus on key terms like 'Experience'/'Berufserfahrung', 'Education'/'Ausbildung', etc. Only respond with "en" or "de".`;
      userPrompt = `CV Text:\n${text.substring(0, 1000)}... // Truncated for API limits\n\nLanguage (en/de):`;
    } else if (task === "categorization") {
      systemPrompt = `You are a CV parsing expert. Extract and structure CV information accurately. Only respond with the requested JSON structure, no additional text.`;
      userPrompt = `Parse the following CV text and extract structured information. Respond with this exact JSON structure:\n{
  "personalData": [{
    "name": "Full Name",
    "title": "Job Title",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, Country"
  }],
  "workExperience": ["detailed work entries"],
  "education": ["detailed education entries"],
  "skills": ["skill1", "skill2", ...]
}\n\nCV Text:\n${text.substring(0, 2000)}... // Truncated for API limits`;
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.1, // Low temperature for more consistent outputs
        max_tokens: task === "languageDetection" ? 10 : 2000,
        top_p: 0.1, // More focused sampling
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content.trim();

    if (task === "languageDetection") {
      // Validate language code
      const lang = result.toLowerCase();
      if (lang !== "en" && lang !== "de") {
        console.warn("Invalid language detected, defaulting to English");
        return "en";
      }
      return lang;
    } else {
      try {
        // Parse and validate JSON structure
        const parsed = JSON.parse(result);
        if (!parsed.personalData || !Array.isArray(parsed.personalData)) {
          throw new Error("Invalid JSON structure");
        }
        return parsed;
      } catch (e) {
        console.error("Error parsing LLM response:", e);
        // Return default structure
        return {
          personalData: [
            {
              name: "",
              title: "",
              email: "",
              phone: "",
              location: "",
            },
          ],
          workExperience: [],
          education: [],
          skills: [],
        };
      }
    }
  } catch (error) {
    console.error(`Error in preprocessWithLLM (${task}):`, error);
    if (task === "languageDetection") {
      return "en"; // Default to English on error
    }
    // Return default structured data on error
    return {
      personalData: [
        {
          name: "",
          title: "",
          email: "",
          phone: "",
          location: "",
        },
      ],
      workExperience: [],
      education: [],
      skills: [],
    };
  }
}
