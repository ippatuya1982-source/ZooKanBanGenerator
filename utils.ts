
import html2canvas from 'html2canvas';

export const downloadAsImage = async (element: HTMLElement, fileName: string) => {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: "#fcfaf5",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = fileName;
    link.href = canvas.toDataURL('image/png');
    link.click();
    return true;
  } catch (err) {
    console.error("Capture failed:", err);
    return false;
  }
};
