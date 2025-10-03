import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { ResumeSection } from '../components/resume/ResumeEditor';

export async function exportToPDF(contentElement: HTMLElement, sections: ResumeSection[]) {
  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Convert the HTML content to canvas
    const canvas = await html2canvas(contentElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Calculate dimensions to fit A4
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add the canvas as image to PDF
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Add metadata
    pdf.setProperties({
      title: `Lebenslauf - ${sections.find(s => s.type === 'persönlich')?.content.name || 'Unbenannt'}`,
      subject: 'Lebenslauf',
      creator: 'Resume Builder',
      author: sections.find(s => s.type === 'persönlich')?.content.name || 'Anonymous',
      keywords: 'resume, cv, lebenslauf'
    });

    // Save the PDF
    pdf.save('lebenslauf.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
} 