import { parsePDF } from "../pdfParser";
import * as pdfjsLib from "pdfjs-dist";

// Mock PDF.js
jest.mock("pdfjs-dist", () => ({
  getDocument: jest.fn(),
  GlobalWorkerOptions: {
    workerSrc: "",
  },
  version: "2.0",
}));

describe("parsePDF", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it("should extract name, title, and contact info", async () => {
    // Mock PDF.js response
    const mockTextContent = {
      items: [
        { str: "John Doe" },
        { str: "Software Engineer" },
        { str: "Email: john@example.com" },
        { str: "Phone: +1234567890" },
        { str: "Location: San Francisco, CA" },
      ],
    };

    const mockPage = {
      getTextContent: jest.fn().mockResolvedValue(mockTextContent),
    };

    const mockPDF = {
      numPages: 1,
      getPage: jest.fn().mockResolvedValue(mockPage),
    };

    (pdfjsLib.getDocument as jest.Mock).mockResolvedValue({
      promise: Promise.resolve(mockPDF),
    });

    const mockFile = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });

    const result = await parsePDF(mockFile);

    expect(result.name).toBe("John Doe");
    expect(result.title).toBe("Software Engineer");
    expect(result.contact.email).toBe("john@example.com");
    expect(result.contact.phone).toBe("+1234567890");
    expect(result.contact.location).toBe("San Francisco, CA");
  });

  it("should extract sections", async () => {
    // Mock PDF.js response
    const mockTextContent = {
      items: [
        { str: "EXPERIENCE" },
        { str: "Company A - Software Engineer" },
        { str: "EDUCATION" },
        { str: "University B - Computer Science" },
        { str: "SKILLS" },
        { str: "JavaScript, React, Node.js" },
      ],
    };

    const mockPage = {
      getTextContent: jest.fn().mockResolvedValue(mockTextContent),
    };

    const mockPDF = {
      numPages: 1,
      getPage: jest.fn().mockResolvedValue(mockPage),
    };

    (pdfjsLib.getDocument as jest.Mock).mockResolvedValue({
      promise: Promise.resolve(mockPDF),
    });

    const mockFile = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });

    const result = await parsePDF(mockFile);

    expect(result.sections).toEqual([
      { title: "Experience", content: ["Company A - Software Engineer"] },
      { title: "Education", content: ["University B - Computer Science"] },
      { title: "Skills", content: ["JavaScript, React, Node.js"] },
    ]);
  });

  it("should handle empty sections", async () => {
    // Mock PDF.js response with no sections
    const mockTextContent = {
      items: [{ str: "John Doe" }, { str: "Software Engineer" }],
    };

    const mockPage = {
      getTextContent: jest.fn().mockResolvedValue(mockTextContent),
    };

    const mockPDF = {
      numPages: 1,
      getPage: jest.fn().mockResolvedValue(mockPage),
    };

    (pdfjsLib.getDocument as jest.Mock).mockResolvedValue({
      promise: Promise.resolve(mockPDF),
    });

    const mockFile = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });

    const result = await parsePDF(mockFile);

    expect(result.sections).toEqual([
      { title: "Experience", content: [] },
      { title: "Education", content: [] },
      { title: "Skills", content: [] },
    ]);
  });

  it("should handle PDF parsing errors", async () => {
    (pdfjsLib.getDocument as jest.Mock).mockRejectedValue(
      new Error("PDF parsing failed"),
    );

    const mockFile = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });

    await expect(parsePDF(mockFile)).rejects.toThrow(
      "Failed to parse PDF. Please try again.",
    );
  });
});
