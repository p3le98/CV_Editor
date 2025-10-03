const LIGHTPDF_API_KEY = "wxvqi2dv99qo9lfmt";
const LIGHTPDF_API_URL = "https://api.lightpdf.com/v1/parse-resume";

interface LightPDFResponse {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  title?: string;
  experience?: Array<{
    company?: string;
    position?: string;
    duration?: string;
    description?: string[];
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    duration?: string;
  }>;
  skills?: string[];
}

export async function parsePDFWithLightPDF(file: File) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(LIGHTPDF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LIGHTPDF_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to parse PDF");
    }

    const data: LightPDFResponse = await response.json();

    // Transform the response to match our CVData interface
    return {
      name: data.name || "",
      title: data.title || "",
      contact: {
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
      },
      sections: [
        {
          title: "Experience",
          content: (data.experience || []).map(
            (exp) =>
              `${exp.position || ""} at ${exp.company || ""} ${exp.duration ? `(${exp.duration})` : ""}`,
          ),
        },
        {
          title: "Education",
          content: (data.education || []).map(
            (edu) =>
              `${edu.degree || ""} at ${edu.school || ""} ${edu.duration ? `(${edu.duration})` : ""}`,
          ),
        },
        {
          title: "Skills",
          content: data.skills || [],
        },
      ],
    };
  } catch (error) {
    console.error("Error parsing PDF with LightPDF:", error);
    throw new Error("Failed to parse PDF. Please try again.");
  }
}
