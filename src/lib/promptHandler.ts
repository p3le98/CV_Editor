import { preprocessWithLLM } from "./llmPreprocessor";

interface CVData {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  sections: Array<{
    title: string;
    content: string[];
  }>;
}

const PROMPT_SYSTEM = `You are a CV editor assistant. Given the current CV data and a user's command, output JSON with the changes to be made. Format:
{
  "action": "add" | "update" | "remove",
  "section": "Experience" | "Education" | "Skills" | "contact" | "basic",
  "content": string | string[],
  "position": "start" | "end" | number // For add actions
}`;

export async function handlePrompt(prompt: string, currentData: CVData) {
  try {
    const response = await preprocessWithLLM(
      `${PROMPT_SYSTEM}\n\nCurrent CV:\n${JSON.stringify(currentData, null, 2)}\n\nUser Command: ${prompt}`,
      "categorization",
    );

    if (!response || !response.action) {
      throw new Error("Invalid response from LLM");
    }

    return response;
  } catch (error) {
    console.error("Error processing prompt:", error);
    throw new Error("Failed to process your request. Please try again.");
  }
}
