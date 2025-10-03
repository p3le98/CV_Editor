import React from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CVSection {
  title: string;
  content: string[];
}

interface CVData {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
  };
  sections: CVSection[];
}

interface CVPreviewProps {
  data?: CVData;
  template?: "modern" | "classic" | "minimal";
}

const defaultData: CVData = {
  name: "",
  title: "",
  contact: {
    email: "",
    phone: "",
    location: "",
  },
  sections: [
    { title: "Experience", content: [] },
    { title: "Education", content: [] },
    { title: "Skills", content: [] },
  ],
};

const CVPreview: React.FC<CVPreviewProps> = ({
  data = defaultData,
  template = "modern",
}) => {
  return (
    <div className="w-full h-full bg-white p-6">
      <ScrollArea className="h-full w-full">
        <Card
          id="cv-preview"
          className="w-full min-h-[1056px] bg-white shadow-lg p-8"
        >
          {/* Header Section */}
          <div
            className={`text-center mb-8 ${template === "modern" ? "border-b-2 pb-6" : ""}`}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.name}
            </h1>
            <h2 className="text-xl text-gray-600 mb-4">{data.title}</h2>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>{data.contact.email}</span>
              <span>•</span>
              <span>{data.contact.phone}</span>
              <span>•</span>
              <span>{data.contact.location}</span>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-6">
            {data.sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h3
                  className={`text-xl font-semibold mb-3 ${template === "modern" ? "text-blue-600" : "text-gray-900"}`}
                >
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.content.map((item, itemIndex) => (
                    <li
                      key={itemIndex}
                      className={`text-gray-700 ${template === "modern" ? "pl-4 border-l-2 border-gray-200" : ""}`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      </ScrollArea>
    </div>
  );
};

export default CVPreview;
