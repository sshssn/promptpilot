/**
 * Utility functions for handling file uploads and conversions for Gemini API
 */

export interface FileData {
  name: string;
  mimeType: string;
  data: string; // base64 encoded
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 data
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function prepareFilesForGemini(files: File[]): Promise<FileData[]> {
  const fileData: FileData[] = [];
  
  for (const file of files) {
    try {
      const base64Data = await fileToBase64(file);
      fileData.push({
        name: file.name,
        mimeType: file.type,
        data: base64Data
      });
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(`Failed to process file: ${file.name}`);
    }
  }
  
  return fileData;
}

export function getFileTypeFromMime(mimeType: string): 'image' | 'document' | 'spreadsheet' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv') return 'spreadsheet';
  return 'document';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
